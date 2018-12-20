export class EGPController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$filter',
      '$q',
      '$log',
      'logicalService',
      'roleService',
      'dialogService',
      'notificationService',
      'logicalDataManager',
      'tableProviderFactory'
    ];
  };
  constructor(...args) {
    this.di = {};
    EGPController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.role = this.di.roleService.getRole();
    this.scope.tabSwitch = false;
    this.scope.tabSelected = null;
    this.scope.segment = null;
    this.scope.tabs = this.di.logicalService.getEGPTabSchema();
    this.scope.model = {
      provider: null,
      api: null,
      actionsShow: null,
      rowActions: null,
      entities: []
    };
    this.scope.policyModel = {
      policy: null,
      provider: null,
      api: null,
      tableInit: false
    }

    this.initActions();
    this.init();

    let unsubscribers = [];
    unsubscribers.push(this.di.$rootScope.$on('egp-group-list-refresh',(event)=>{
      this.scope.alert = {
        type: 'success',
        msg: this.translate('MODULES.LOGICAL.EGP.TAB.GROUP.CREATE.SUCCESS')
      }
      this.di.notificationService.render(this.scope);
      this.scope.model.api.queryUpdate();
    }));
    unsubscribers.push(this.di.$rootScope.$on('egp-policy-list-refresh',(event, params)=>{
      this.scope.alert = {
        type: 'success',
        msg: this.translate('MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.SUCCESS')
      }
      this.di.notificationService.render(this.scope);
      this.scope.model.api.queryUpdate();
    }));
    this.scope.$on('$destroy', () => {
    });
  }

  initActions() {
    this.scope.onTabChange = (tab) => {
      if (tab && !this.scope.tabSwitch){
        this.scope.tabSelected = tab;
        this.scope.tabSwitch = true;
        this.prepareTableData();
      }
    }

    this.scope.onTableRowSelectAction = (event) => {
      switch (this.scope.tabSelected.type){
        case 'group':
          if (event.action.value === 'delete') {
            this.di.dialogService.createDialog('warning', this.translate('MODULES.LOGICAL.EGP.TAB.GROUP.REMOVE_GROUP'))
              .then(() => {
                this.deleteEGPGroup(event.data.name);
              }, () => {
                this.di.$log.debug('delete EGP group dialog cancel');
              });
          }
          break;
        case 'policy':
          if (event.action.value === 'delete') {
            this.di.dialogService.createDialog('warning', this.translate('MODULES.LOGICAL.EGP.TAB.GROUP.REMOVE_GROUP'))
              .then(() => {
                this.deleteEGPPolicy(event.data.name);
              }, () => {
                this.di.$log.debug('delete EGP policy dialog cancel');
              });
          }
          break;  
      }
    };

    this.scope.onTableRowClick = (event) => {
      this.scope.model.api.setSelectedRow(event.$data.id);
      if (this.scope.tabSelected.type === 'policy') {
        this.scope.policyModel.policy = event.$data;
        this.scope.policyModel.ruleName =this.translate('MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.RULE') + 
          '(' +  this.scope.policyModel.policy.name + ')';
        this.policyRulesQuery();  
      }
      else {
        this.scope.policyModel.policy = null;
      }
    };

    this.scope.onApiReady = ($api) => {
      this.scope.model.api = $api;
    };

    this.scope.onRulesApiReady = ($api) => {
      this.scope.policyModel.api = $api;
    };

    this.scope.addGroup = () => {
      this.di.logicalDataManager.getTenants()
        .then((res) => {
          if (!res.data.tenants.length) {
            this.scope.alert = {
              type: 'warning',
              msg: this.translate('MODULES.LOGICAL.EGP.WARNING.NO_AVAILABLE_TENANT')
            }
            this.di.notificationService.render(this.scope);
          }
          else {
            this.di.$rootScope.$emit('group-wizard-show', res.data.tenants);      
          }
        });
    };

    this.scope.addPolicy = () => {
      let all = [], tenantDefer = this.di.$q.defer(), groupDefer = this.di.$q.defer();
      this.di.logicalDataManager.getTenants()
        .then((res) => {
          tenantDefer.resolve(res.data.tenants);
        });
      this.di.logicalDataManager.getEGPGroupList()
        .then((data) => {
          groupDefer.resolve(data);
        });
      all.push(tenantDefer.promise);
      all.push(groupDefer.promise);
      this.di.$q.all(all).then((arr) => {
        if (!arr[0].length) {
          this.scope.alert = {
            type: 'warning',
            msg: this.translate('MODULES.LOGICAL.EGP.WARNING.NO_AVAILABLE_TENANT')
          }
           this.di.notificationService.render(this.scope);
          return;
        }
        if (!arr[1].length) {
          this.scope.alert = {
            type: 'warning',
            msg: this.translate('MODULES.LOGICAL.EGP.WARNING.NO_AVAILABLE_GROUP')
          }
          this.di.notificationService.render(this.scope);
          return;
        }
        this.di.$rootScope.$emit('policy-wizard-show', {'tenants': arr[0], 'groups': arr[1]});
      });
    };

    this.scope.batchRemove = (values) => {
      if (!values.length) return;
      let dialog = this.scope.tabSelected.type === 'group' ? this.translate('MODULES.LOGICAL.EGP.TAB.GROUP.BATCH_DELETE_GROUP') :
        this.translate('MODULES.LOGICAL.EGP.TAB.POLICY.BATCH_DELETE_POLICY');
      this.di.dialogService.createDialog('warning', dialog)
        .then(() =>{
          this.batchRemove(values);
        }, () => {
          this.di.$log.debug('batch delete EGP policy dialog cancel');
        });
    };
  }

  init() {
    this.scope.model.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.getEntities(params).then((res) => {
          this.scope.tabSwitch = false;
          this.entityStandardization(res.data);
          defer.resolve({
            data: this.scope.model.entities
          });
          this.selectEntity();
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.scope.model.schema,
          index_name: this.getDataType().index_name,
          rowCheckboxSupport: this.getDataType().rowCheckboxSupport,
          rowActionsSupport: this.getDataType().rowActionsSupport,
          authManage: this.getDataType().authManage
        };
      }
    });
    this.scope.onTabChange(this.scope.tabs[0]);
  }

  prepareTableData() {
    this.scope.model.schema = this.getSchema();
    this.scope.model.actionsShow = this.getActionsShow();
    this.scope.model.rowActions = this.getRowActions();
  }

  getEntities(params) {
    let defer = this.di.$q.defer();
    switch (this.scope.tabSelected.type) {
      case 'group':
        this.di.logicalDataManager.getEGPGroupList().then((data) => {
          defer.resolve({'data': data});
        });
        break;
      case 'policy':
        this.di.logicalDataManager.getEGPPolicyList().then((data) => {
          defer.resolve({'data': data});
        });
        break;
    }
    return defer.promise;
  }

  entityStandardization(entities) {
    this.scope.model.entities = [];
    switch (this.scope.tabSelected.type) {
      case 'group':
        entities.forEach((entity) => {
          let obj = {};
          obj['id'] = entity.name;
          obj['name'] = entity.name;
          obj['tenant'] = entity.tenant;
          obj['address'] = entity.macAddresses;
          this.scope.model.entities.push(obj);
        });
        break;
      case 'policy':
        entities.forEach((entity) => {
          let obj = {};
          obj['id'] = entity.name;
          obj['name'] = entity.name;
          obj['group'] = entity.egpGroupId;
          obj['tenant'] = entity.tenant;
          this.scope.model.entities.push(obj);
        });
        break;  
    }
  }

  getSchema() {
    let schema;
    switch(this.scope.tabSelected.type) {
      case 'group':
        schema = this.di.logicalService.getEGPGroupSchema();
        break;
      case 'policy':
        schema = this.di.logicalService.getEGPPolicySchema();
        break;
    }
    return schema;
  }

  getActionsShow() {
    let actions = this.di.logicalService.getEGPActionsShow();
    return actions;
  }

  getRowActions() {
    let actions = this.di.logicalService.getEGPRowActions();
    return actions;
  }

  getDataType() {
    let schema = {};
    schema['authManage'] = {
      support: true,
      currentRole: this.scope.role
    };
    schema['index_name'] = 'id';
    schema['rowCheckboxSupport'] = true;
    schema['rowActionsSupport'] = true;
   
    return schema;
  }

  deleteEGPGroup(group_name) {
    this.di.logicalDataManager.deleteEGPGroup(group_name)
      .then(() => {
        this.scope.alert = {
          type: 'success',
          msg: this.translate('MODULES.LOGICAL.EGP.TAB.GROUP.DELETE.SUCCESS')
        }
        this.di.notificationService.render(this.scope);
      }, (msg) => {
        this.scope.alert = {
          type: 'warning',
          msg: msg
        }
        this.di.notificationService.render(this.scope);
      })
      .finally(() => {
        this.scope.model.api.queryUpdate();
      });
  }

  deleteEGPPolicy(policy_name) {
    this.di.logicalDataManager.deleteEGPPolicy(policy_name)
      .then(() => {
        this.scope.alert = {
          type: 'success',
          msg: this.translate('MODULES.LOGICAL.EGP.TAB.POLICY.DELETE.SUCCESS')
        }
        this.di.notificationService.render(this.scope);
      }, (msg) => {
        this.scope.alert = {
          type: 'warning',
          msg: msg
        }
        this.di.notificationService.render(this.scope);
      })
      .finally(() => {
        this.scope.model.api.queryUpdate();
      });
  }

  batchRemove(values) {
    let deferredArr = [];
    values.forEach((item) => {
      let defer = this.di.$q.defer();
      if (this.scope.tabSelected.type === 'group' ) {
        this.di.logicalDataManager.deleteEGPGroup(item.name)
          .then(()=> {
            defer.resolve();
          }, (msg) => {
            defer.reject(msg);
          });
        deferredArr.push(defer.promise);  
      }
      else {
        this.di.logicalDataManager.deleteEGPPolicy(item.name)
          .then(()=> {
            defer.resolve();
          }, (msg) => {
            defer.reject(msg);
          });
        deferredArr.push(defer.promise); 
      }
    });

    this.di.$q.all(deferredArr).then(() => {
      let msg = this.scope.tabSelected.type === 'group' ? this.translate('MODULES.LOGICAL.EGP.TAB.GROUP.BATCH.DELETE.SUCCESS') :
        this.translate('MODULES.LOGICAL.EGP.TAB.POLICY.BATCH.DELETE.SUCCESS');
      this.scope.alert = {
        type: 'success',
        msg: msg
      };
      this.di.notificationService.render(this.scope);  
      }, (msg) => {
        this.scope.alert = {
          type: 'warning',
          msg: msg
        };
        this.di.notificationService.render(this.scope);  
      }).finally(() =>{
        this.scope.model.api.queryUpdate();
      });
  }

  selectEntity() {
    if (this.scope.model.entities.length === 0) {
      this.scope.policyModel.policy = null;
      return;
    }
    this.scope.model.api.setSelectedRow(this.scope.model.entities[0].name);
    if (this.scope.tabSelected.type === 'policy') {
      this.scope.policyModel.policy = this.scope.model.entities[0];
      this.scope.policyModel.ruleName =this.translate('MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.RULE') + 
          '(' +  this.scope.policyModel.policy.name + ')';
      this.policyRulesQuery();  
    }
  }

  policyRulesQuery() {
    if (!this.scope.policyModel.tableInit) {
      this.initPolicyRulesTable();
      this.scope.policyModel.tableInit = true;
    }
    else {
      this.scope.policyModel.api.queryUpdate();
    }
  }

  initPolicyRulesTable() {
    this.scope.policyModel.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        let policyName = this.scope.policyModel.policy.name;
        this.di.logicalDataManager.getEGPPolicyDetail(policyName).then((result) => {
          let data = [];
          if (result) {
            data = this.formatPolicyRules(result);
          }
          defer.resolve({
            data: data
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.logicalService.getPolicyRulesSchema()
        };
      }
    });
  }

  formatPolicyRules(policy) {
    let result = [];
    policy.rules.forEach((rule) => {
      let obj = {};
      obj['action'] = rule.action === 'permit' ? this.translate('MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.RULE.ACTION.PERMIT') :
        this.translate('MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.RULE.ACTION.DENY');
      obj['ip_proto'] = rule.match.ipProtocol === 1 ? 'ICMP' : (rule.match.ipProtocol === 6 ? 'TCP' : 'UDP');
      obj['src_ip'] = rule.match.srcIp;
      obj['dst_ip'] = rule.match.dstIp;
      obj['dst_mac'] = rule.match.dstMac;
      obj['vid'] = rule.match.vid;
      obj['src_port'] = rule.match.srcPort;
      obj['dst_port'] = rule.match.dstPort;
      obj['icmp_type'] = rule.match.icmpType;
      obj['icmp_code'] = rule.match.icmpCode;
      result.push(obj);
    });
    return result;
  }
}

EGPController.$inject = EGPController.getDI();
EGPController.$$ngIsClass = true;