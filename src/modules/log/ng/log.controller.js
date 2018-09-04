export class LogController {
  static getDI() {
    return [
      '$filter',
      '$scope',
      '$q',
      'dialogService',
      'logService',
      'logDataManager',
      'tableProviderFactory'
    ];
  }
  
  constructor(...args) {
    this.di = {};
    LogController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
  
    this.scope.pageTitle = this.translate('MODULE.LOG.PAGE.TITLE');
  
    this.scope.logModel = {
      actionsShow: this.di.logService.getActionsShow(),
      // rowActions: this.di.logService.getDeviceTableRowActions(),
      logProvider: null,
      logAPI: null
    };
  
    this.unsubscribers = [];
  
    this.scope.onTableRowClick = (event) => {
      if (event.$data){
        this.scope.logModel.logAPI.setSelectedRow(event.$data.mac);
      }
    };
  
    this.scope.onTableRowSelectAction = (event) => {
      if (event.data && event.action) {
        if (event.action.value === 'delete') {
          this.di.dialogService.createDialog('warning', this.translate('MODULES.SWITCHES.DIALOG.CONTENT.DELETE_SWITCH'))
          //this.confirmDialog(this.translate('MODULES.SWITCHES.DIALOG.CONTENT.DELETE_SWITCH'))
            .then((data) =>{
              this.di.logDataManager.deleteDevice(event.data.id)
                .then((res) =>{
                  this.scope.logModel.logAPI.queryUpdate();
                });
            }, (res) =>{
              this.di.$log.debug('delete switch dialog cancel');
            });
        }
      }
    };
  
    this.scope.onDeviceAPIReady = ($api) => {
      this.scope.logModel.logAPI = $api;
    };
  
    this.init();
  
    this.scope.$on('$destroy', () => {
      this.unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }
  
  init() {
    this.scope.logModel.logProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.logDataManager.getLogs(params).then((res) => {
          this.scope.entities = this.getEntities(res.data.logs);
          defer.resolve({
            data: this.scope.entities,
            count: 4
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.logService.getTableSchema(),
          index_name: 'created_time',
          // rowCheckboxSupport: true,
          // rowActionsSupport: true
        };
      }
    });
  }
  
  getEntities(origins) {
    let entities = [];
    if(!Array.isArray(origins)) return entities;
    //switch(this.scope.tabSelected.type) {
    //case 'log':
    origins.forEach((item) => {
      let obj = {};
      obj.type = item.type;
      obj.created_time = item.created_time;
      obj.operation = item.operation;
      obj.content = item.content;
      obj.creator = item.creator;
      obj.level = item.level;
      
      entities.push(obj);
    });
    return entities;
  }
  
}

LogController.$inject = LogController.getDI();
LogController.$$ngIsClass = true;