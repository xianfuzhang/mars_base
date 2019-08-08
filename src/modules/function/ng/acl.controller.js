export class AclController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$location',
      '$log',
      '$q',
      '$filter',
      '_',
      'dialogService',
      'roleService',
      'aclService',
      'notificationService',
      'modalManager',
      'deviceDataManager',
      'functionDataManager',
      'tableProviderFactory'
    ];
  }

  constructor(...args){
    this.di = {};
    AclController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    /*this.scope.tabSelected = null;
    this.scope.tabs = this.di.aclService.getTabSchema();*/
    this.scope.page_title = this.translate('MODULES.SWITCHES.TAB.SCHEMA.SWITCH');
    this.scope.role = this.di.roleService.getRole();
    this.scope.entities = [];
    this.di.$scope.deviceMap = {};
    this.di.$scope.aclMap = {};
    this.scope.model = {
      selectedAcl: null,
      actionsShow: this.di.aclService.getTableActionsShow(),
      rowActions: this.di.aclService.getTableRowActions(),
      provider: null,
      API: null
    };

    this.unsubscribers = [];

    this.scope.onTableRowClick = (event) => {
      if (event.$data){
        this.scope.model.selectedAcl = this.scope.aclMap[event.$data.policy_id]
        this.scope.model.API.setSelectedRow(event.$data.policy_id);
      }
    };

    // this.scope.onTableRowActionsFilter = (event) =>{
    //   let filterActions = [];
    //   if (event.data) {
    //     event.actions.forEach((action) =>{
    //       if (event.data.type !== 'unknown') {
    //         filterActions.push(action);
    //       }
    //       if(event.data.type === 'unknown' && action.value === 'delete'){
    //         filterActions.push(action);
    //       }
    //     });
    //   }
    //   return filterActions;
    // };

    this.scope.onTableRowSelectAction = (event) => {
      if (event.data && event.action) {
        if (event.action.value === 'delete') {
          this.di.dialogService.createDialog('warning', this.translate('MODULE.FUNCTIONS.ACL.MESSAGE.DELETE_ACL'))
            .then((data) =>{
              this.di.functionDataManager.deleteAcl(event.data.policy_id)
                .then((res) =>{
                  this.scope.model.API.queryUpdate();
                });
            }, (res) =>{
              this.di.$log.debug('Delete ACL dialog cancel');
            });
        }

        // if (event.action.value === 'update') {
        //   this.di.$rootScope.$emit('switch-wizard-show', event.data.id);
        // }
      }
    };

    this.scope.onAPIReady = ($api) => {
      this.scope.model.API = $api;
    };

    this.scope.batchRemoveAcl = ($value) => {
      if ($value.length) {
        this.di.dialogService.createDialog('warning', this.translate('MODULE.FUNCTIONS.ACL.MESSAGE.DELETE_ACL'))
          .then((data) =>{
            this.batchDeleteAcls($value);
          }, (res) =>{
            this.scope.model.API.queryUpdate();
            this.di.$log.debug('delete switch dialog cancel');
          });
      }
    };
    
    this.scope.addAcl = () => {
      this.di.$rootScope.$emit('acl-wizard-show');
    }
    
    this.init();

    this.unsubscribers.push(this.di.$rootScope.$on('clickabletext', (event, params) => {
      //location path to device detail
      if (params && params.field === 'switch_name') {
        //this.di.$location.path('/devices/' + params.value).search({'id': params.object.id});
        this.di.$location.path('/devices/' + params.object.id);
      }
    }));
  
    this.unsubscribers.push(this.di.$rootScope.$on('device-list-refresh', (event, params) => {
      this.scope.model.API.queryUpdate();
    }));

    this.scope.$on('$destroy', () => {
      this.unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }

  init() {
    let testAcl = [
      {
        "deviceId": "rest:192.168.40.225:80",
        "policyId": 1648303342,
        "port": "eth1/50",
        "direction": true,
        "action": "permit",
        "mac": {
          "srcMac": "66:11:11:11:11:11",
          "dstMac": "22:22:22:22:22:22",
          "etherType": "0800",
          "vid": "1001"
        },
        "ipv4": {
          "protocol": 17,
          "srcIp": "1.1.1.1",
          "dstIp": "2.2.2.2",
          "srcPort": 5000,
          "dstPort": 6000
        }
      },
      {
        "deviceId": "rest:192.168.40.228:80",
        "policyId": 1648303343,
        "port": "eth1/50",
        "direction": false,
        "action": "deny",
        "mac": {
          "srcMac": "66:11:11:11:11:11",
          "dstMac": "22:22:22:22:22:22",
          "etherType": "0801",
          "vid": "1001"
        },
        "ipv4": {
          "protocol": 19,
          "srcIp": "1.1.1.1",
          "dstIp": "2.2.2.2",
          "srcPort": 5100,
          "dstPort": 6200
        }
      }
    ];

    let initialFlag = true;
    this.scope.model.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();

        this.scope.entities = [];

        if(initialFlag) {
          initialFlag = false;
          let deviceDefer = this.di.$q.defer();
          let aclDefer = this.di.$q.defer();

          this.di.deviceDataManager.getDeviceConfigs().then((devices) => {
            devices.forEach((device) => {
              this.di.$scope.deviceMap[device['id']] = device;
            });
            deviceDefer.resolve();
          }, (err) => {
            console.log(err)
            deviceDefer.reject(err);
          });

          this.di.functionDataManager.getAcl().then((res)=>{
            res.data.acl.forEach((acl) => {
              this.di.$scope.aclMap[acl['policyId']] = acl;
            });
            aclDefer.resolve(res.data.acl);
          }, (err) => {
            aclDefer.resolve(testAcl); // TODO: test mode
            testAcl.forEach((acl) => {
              this.di.$scope.aclMap[acl['policyId']] = acl;
            });

            // aclDefer.reject(err);
            console.log(err)
          })

          Promise.all([deviceDefer.promise, aclDefer.promise]).then((resArr) => {
            this.scope.entities = this.getAclEntities(resArr[1]);
            if(this.scope.entities.length) {
              this.scope.model.selectedAcl = this.scope.aclMap[this.scope.entities[0].policy_id]
            }

            defer.resolve({
              data: this.scope.entities
            });
          }, (err) => {
            this.di.notificationService.renderWarning(this.scope, this.translate("MODULE.FUNCTIONS.ACL.MESSAGE.ERROR.GET_ACL_REQUEST"));
            defer.resolve({
              data: this.scope.entities
            });
          })
        } else {
          this.di.functionDataManager.getAcl().then((res)=>{
            res.data.acl.forEach((acl) => {
              this.di.$scope.aclMap[acl['policy_id']] = acl;
            });

            this.scope.entities = this.getAclEntities(res.data.acl);
            defer.resolve({
              data: this.scope.entities
            });
          }, (err) => {
            this.di.notificationService.renderWarning(this.scope, this.translate("MODULE.FUNCTIONS.ACL.MESSAGE.ERROR.GET_ACL_REQUEST"));
            // TODO: test mode
            testAcl.forEach((acl) => {
              this.di.$scope.aclMap[acl['policyId']] = acl;
            });

            defer.resolve({
              data: this.scope.entities
            });
          });
        }

        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.aclService.getTableSchema(),
          index_name: 'policy_id',
          rowCheckboxSupport: true,
          rowActionsSupport: true,
          authManage: {
            support: true,
            currentRole: this.scope.role
          }
        };
      }
    });
  }

  getAclEntities(aclArray) {
    let scope = this.di.$scope;
    let entities = [];
    aclArray.forEach((acl) => {
        entities.push({
          'policy_id': acl.policyId,
          'device_id': acl.deviceId,
          'device_name': scope.deviceMap[acl.deviceId] ? scope.deviceMap[acl.deviceId].name : acl.deviceId,
          'port': acl.port,
          'direction': acl.direction ? 'IN' : 'OUT',
          'action': acl.action == 'permit' ? 'done' : 'not_interested'
        });
    });

    return entities;
  }

  batchDeleteAcls(arr) {
    let deferredArr = [];
    arr.forEach((item) => {
      let defer = this.di.$q.defer();
      this.di.functionDataManager.deleteAcl(item.policy_id)
        .then(() => {
          defer.resolve();
        }, (msg) => {
          defer.reject(msg);
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then(() => {
      this.di.notificationService.renderSuccess(this.scope, this.translate('MODULE.FUNCTIONS.ACL.BATCH.DELETE.SUCCESS'));
      this.scope.model.API.queryUpdate();
    }, (msg) => {
      this.di.notificationService.renderWarning(this.scope, this.translate('MODULE.FUNCTIONS.ACL.BATCH.DELETE.FAILED'));
      this.scope.model.API.queryUpdate();
    });
  }
}

AclController.$inject = AclController.getDI();
AclController.$$ngIsClass = true;