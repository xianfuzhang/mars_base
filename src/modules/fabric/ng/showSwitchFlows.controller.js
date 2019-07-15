export class ShowSwitchFlowsController {
  static getDI() {
    return [
      '$scope',
      '$q',
      'dataModel',
      'flowService',
      'deviceDetailService',
      'deviceDataManager',
      'tableProviderFactory'
    ];
  }

  constructor(...args) {
    this.di = {};
    ShowSwitchFlowsController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.scope.switchId = this.di.dataModel.switchId;

    this.scope.flowsModel = {
      provider: null,
      api: null,
      schema: this.di.deviceDetailService.getTopoDeviceFlowsSchema(),
      entities: []
    };

    this.scope.onTableRowClick = (event) => {
      if (event.$data){
        this.scope.flowsModel.api.setSelectedRow(event.$data.id);
      }
    };

    this.scope.onApiReady = ($api) => {
      this.scope.flowsModel.api = $api;
    };

    this.init();
  }

  init() {
    this.scope.flowsModel.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.deviceDataManager.getDeviceFlows(this.scope.switchId, {}).then((res) => {
          this.entityStandardization(res.data.flows);
          defer.resolve({
            data: this.scope.flowsModel.entities,
            count: this.scope.flowsModel.total
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.scope.flowsModel.schema,
          index_name: 'id',
          rowCheckboxSupport: false,
          rowActionsSupport: false
        };
      }
    });
  }

  entityStandardization(entities) {
    this.scope.flowsModel.entities = [];
    entities.forEach((entity) => {
      let obj = {};
      obj['id'] = entity.id;
      obj['state'] = entity.state;
      obj['packets'] = entity.packets;
      obj['duration'] = entity.life;
      obj['priority'] = entity.priority;
      obj['name'] = entity.tableId;
      obj['selector'] = this.di.flowService.selectorHandler(entity.selector).toString();
      obj['treatment'] = this.di.flowService.treatmentHander(entity.treatment).toString();
      obj['app'] = entity.appId;
      this.scope.flowsModel.entities.push(obj);
    });
  }
}
ShowSwitchFlowsController.$inject = ShowSwitchFlowsController.getDI();
ShowSwitchFlowsController.$$ngIsClass = true;