export class SwitchController {
  static getDI() {
    return [
      '$scope',
      '$log',
      '$q',
      'switchService',
      'switchDataManager',
      'tableProviderFactory'
    ];
  }

  constructor(...args){
    this.di = {};
    SwitchController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.scope.switchModel = {
      tabs: this.di.switchService.getTabSchema(),
      tabSelected: null,
      actionsShow: this.di.switchService.getSwitchActionsShow(),
      switchProvider: null,
      switchAPI: null
    };

    this.scope.onTabChange= (tab) => {
      this.di.$log.info(tab);
      if (tab){
        this.scope.switchModel.tabSelected = tab;
      }
    };

    this.scope.onTableRowClick = (event) => {
      this.di.$log.info('switch controller table click.' + event);
      if (event.$data){
        this.scope.switchModel.switchAPI.setSelectedRow(event.$data.mac);
      }
    };

    this.scope.onSwitchApiReady = ($api) => {
      this.scope.switchModel.switchAPI = $api;
    };

    this.init();
  }

  init () {
    this.scope.switchModel.switchProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
       /* let defer = this.di.$q.defer();
        defer.resolve({
          data: []
        });
        return defer.promise;*/
        return this.di.switchDataManager.getSwitches(params);
      },
      getSchema: () => {
        return {
          schema: this.di.switchService.getSwitchTableSchema(),
          index_name: 'mac',
          rowCheckboxSupport: true,
          rowActionsSupport: true,
          rowActions: this.di.switchService.getSwitchTableRowActions(),
        };
      }
    });
    this.scope.onTabChange(this.scope.switchModel.tabs[0]);
  }
}

SwitchController.$inject = SwitchController.getDI();
SwitchController.$$ngIsClass = true;