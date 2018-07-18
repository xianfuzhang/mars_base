export class StormControlController {
  static getDI() {
    return [
      '$scope',
      '$q',
      'stormService',
      'tableProviderFactory',
      'stormDataManager'
    ];
  }
  constructor(...args){
    this.di = {};
    StormControlController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.scope.tabs = this.di.stormService.getTabSchema();
    this.scope.tabSelected = null;
    this.scope.entities = [];

    this.scope.stormModel = {
      actionsShow: this.di.stormService.getStormActionsShow(),
      stormProvider: null,
      stormAPI: null
    };

    this.scope.onStormApiReady = ($api) => {
      this.scope.stormModel.stormAPI = $api;
    };

    this.scope.onTableRowClick = (event) => {
      if (event.$data) {
        switch (this.scope.tabSelected.type) {
          case 'storm':
            this.scope.stormModel.stormAPI.setSelectedRow(event.$data.id);
            break;
        }
      }
    }

    this.scope.onTabChange= (tab) => {
      if (tab){
        this.scope.tabSelected = tab;
      }
    };

    this.init();
  }

  init() {
    this.scope.stormModel.stormProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.stormDataManager.getStormProfiles(params).then((res) => {
          this.scope.entities = this.getEntities(res.data.ports);
          defer.resolve({
            data: this.scope.entities,
            count: res.data.total
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.stormService.getStormTableSchema(),
          index_name: 'id',
          rowCheckboxSupport: true
        };
      }
    });
    this.scope.onTabChange(this.scope.tabs[0]);
  }

  getEntities(origins){
    return [];
  }
}

StormControlController.$inject = StormControlController.getDI();
StormControlController.$$ngIsClass = true;