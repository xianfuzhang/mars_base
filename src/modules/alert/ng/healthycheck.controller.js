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
      'dialogService',
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
    let translate = this.translate;
    let di = this.di;
    scope.healthyCheckModel = {
      actionsShow: {'menu': false, 'add': true, 'remove': false, 'refresh': true, 'search': false},
      rowActions: [
        {
          'label': this.translate('MODULES.ALERT.RECEIVE_GROUP.EDIT'),
          'value': 'edit'
        },
        {
          'label': this.translate('MODULES.ALERT.RECEIVE_GROUP.DELETE'),
          'value': 'delete'
        }
      ],
      healthTableProvider: null,
      healthyCheckAPI :""
    };

    scope.onHCTableRowSelectAction = (event) => {
      if (event.data && event.action) {
        if (event.action.value === 'delete') {
          // this.confirmDialog(this.translate('MODULES.ALERT.RECEIVE_GROUP.REMOVE_GROUP'))
          this.di.dialogService.createDialog('warning', this.translate('MODULES.ALERT.DIALOG.CONTENT.REMOVE_HEALTHY_HISTORY'))
            .then((data) =>{

              let resource = di.alertService.getRuleResource(event.data.type);
              let object = di.alertService.getRuleObject(event.data.from);

              this.di.alertDataManager.deleteHealthyCheck(object, resource, event.data.rule_name)
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

    function formatHcGroups(rules) {
      let hcs = [];
      di._.forEach(rules, (rule)=>{
        let hc = {};
        hc.rule_name = rule.name;
        hc.from = rule.from === 'controller'?translate('MODULES.ALERT.HEALTHY_CHECK.OBJECT.CONTROLLER'):translate('MODULES.ALERT.HEALTHY_CHECK.OBJECT.SWITCH');
        hc.status = rule.status === 'enabled'?translate('MODULES.ALERT.HEALTHY_CHECK.STATUS.ENABLED'):translate('MODULES.ALERT.HEALTHY_CHECK.STATUS.DISABLED');
        hc.alert_level = rule.alert_level === 0?translate('MODULES.ALERT.HEALTHY_CHECK.LEVEL.LOW'):translate('MODULES.ALERT.HEALTHY_CHECK.LEVEL.HIGHT');
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

    scope.onTableRowClick = (event) => {
      if (event.$data){
        scope.healthyCheckModel.healthyCheckAPI.setSelectedRow(event.$data.rule_name);
      }
    };

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