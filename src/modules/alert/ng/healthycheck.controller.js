export class HealthyCheckController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '_',
      '$http',
      '$filter',
      '$q',
      'appService',
      'alertService',
      'tableProviderFactory',
      'alertDataManager',
      'configurationDataManager'
    ];
  }

  constructor(...args) {
    this.di = {};
    HealthyCheckController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unSubscribers = [];
    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    let di = this.di;
    scope.healthyCheckModel = {
      actionsShow: {'menu': false, 'add': true, 'remove': false, 'refresh': true, 'search': false},
      rowActions: [
        {
          'label': this.translate('MODULES.ALERT.RECEIVE_GROUP.DELETE'),
          'value': 'delete'
        },
        {
          'label': this.translate('MODULES.ALERT.RECEIVE_GROUP.EDIT'),
          'value': 'edit'
        }
      ],
      healthTableProvider: null,
      healthyCheckAPI :""
    };

    scope.onHCTableRowSelectAction = (event) => {
      if (event.data && event.action) {
        if (event.action.value === 'delete') {
          this.confirmDialog(this.translate('MODULES.ALERT.RECEIVE_GROUP.REMOVE_GROUP'))
            .then((data) =>{
              this.di.alertDataManager.deleteReceiveGroup(event.data.group_name)
                .then((res) =>{
                  scope.healthyCheckModel.healthyCheckAPI.queryUpdate();
                });
            }, (res) =>{
              this.di.$log.debug('delete receive group dialog cancel');
            });
        } else if(event.action.value === 'edit') {
          this.di.$rootScope.$emit('addhealthycheck-wizard-show', event.data);
        }
      }
    };


    // {
    //   'field': 'rule_name',
    //   'field': 'from',
    //   'field': 'status',
    //   'field': 'alert_level',
    //   'field': 'receive_group',
    //   'field': 'type',
    //   'field': 'description',

    // function getRuleTypeTranslate(type) {
    //   let tran = "";
    //   if(type === 'cpu_utilization'){
    //     tran = "CPU使用率";
    //   } else if(type === 'ram_used_ratio'){
    //     tran = "内存使用率";
    //   } else if(type === 'disk_root_used_ratio'){
    //     tran = "硬盘使用率";
    //   } else if(type === 'rx_util'){
    //     tran = "下载速率";
    //   } else if(type === 'tx_util'){
    //     tran = "上传速率";
    //   }
    //   return tran;
    // }

    // function getDescriptionTranslate(query, type) {
    //   let trans = "";
    //   // let type = query.type;
    //   if(type === 'cpu_utilization'){
    //     trans = (query.condition ==='gt'?"超过":"低于") + query.value + "%持续"+ query.continue + '秒';
    //   } else if(type === 'ram_used_ratio'){
    //     trans = (query.condition ==='gt'?"超过":"低于") + query.value + "%持续"+ query.continue + '秒';
    //   } else if(type === 'disk_root_used_ratio'){
    //     trans = (query.condition ==='gt'?"超过":"低于") + query.value + "%持续"+ query.continue + '秒';
    //   } else if(type === 'rx_util'){
    //     trans = (query.condition ==='gt'?"超过":"低于") + query.value + "Mbps持续"+ query.continue + '秒';
    //   } else if(type === 'tx_util'){
    //     trans = (query.condition ==='gt'?"超过":"低于") + query.value + "Mbps持续"+ query.continue + '秒';
    //   }
    //   return trans;
    // }

    function formatHcGroups(rules) {
      let hcs = [];
      di._.forEach(rules, (rule)=>{
        let hc = {};
        hc.rule_name = rule.name;
        hc.from = rule.from === 'controller'?'控制器':'交换机';
        hc.status = rule.status === 'enabled'?'开启':'停止';
        hc.alert_level = rule.alert_level === 0?'低':'高';
        hc.receive_group = rule.receive_group;
        hc.type = di.alertService.getRuleTypeTranslate(rule.type);
        if(rule.type === 'rx_util'){
          hc.description = di.alertService.getDescriptionTranslate(rule.query_rx, rule.type);
        } else if(rule.type === 'tx_util'){
          hc.description = di.alertService.getDescriptionTranslate(rule.query_tx, rule.type);
        } else {
          hc.description = di.alertService.getDescriptionTranslate(rule.query, rule.type);
        }
        hcs.push(hc);
      });
      return hcs;
    }
    
    scope.healthyCheckModel.healthTableProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.alertDataManager.getAllHealthyCheck().then((res) => {
          scope.healthyCheckModel.rules = res;
          let rules = formatHcGroups(res);
          defer.resolve({
            data: rules,
            count: res.count
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.alertService.getHealthyCheckTableSchema(),
          index_name: 'rule_name',
          rowCheckboxSupport: true,
          rowActionsSupport: true
        };
      }
    });

    scope.onHealthyAPIReady = ($api) => {
      scope.healthyCheckModel.healthyCheckAPI = $api;
    };

    scope.addHealthyCheck = () =>{
      this.di.$rootScope.$emit('addhealthycheck-wizard-show');
    };

    unSubscribers.push(this.di.$rootScope.$on('healthycheck-refresh',()=>{
      scope.healthyCheckModel.healthyCheckAPI.queryUpdate();
    }));

    this.di.$scope.$on('$destroy', () => {
      this.di._.each(unSubscribers, (unSubscribe) => {
        unSubscribe();
      });
    });
  }
}

HealthyCheckController.$inject = HealthyCheckController.getDI();
HealthyCheckController.$$ngIsClass = true;