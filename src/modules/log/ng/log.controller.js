export class LogController {
  static getDI() {
    return [
      '$filter',
      '$scope',
      '$q',
      '$timeout',
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
    this.date = this.di.$filter('date');
  
    this.scope.pageTitle = this.translate('MODULE.LOG.PAGE.TITLE');
    this.scope.loading = false;
    this.scope.hasData = false;
    
    let now = Date.now();
    let today = this.date(now, 'yyyy-MM-dd');
    this.scope.today = new Date(today + ' 23:59:59');
    this.scope.dateFrom = new Date(today + ' 00:00:00');
    this.scope.dateTo = new Date(today + ' 23:59:59');
    
    // the params that had send to get data
    let dateObj = {from: null, to: null};
  
    this.scope.logModel = {
      // actionsShow: this.di.logService.getActionsShow(),
      // rowActions: this.di.logService.getDeviceTableRowActions(),
      logProvider: null,
      logAPI: null
    };
    
    this.scope.search = () => {
      this.scope.loading = true;
      
      this.scope.logModel.logAPI.queryUpdate();
    }
  
    this.scope.file = () => {
      this.scope.loading = true;
      this.di.$timeout(() => {
        this.scope.loading = false;
      }, 2000)
    }
  
    this.scope.onLogAPIReady = ($api) => {
      this.scope.logModel.logAPI = $api;
    };
    
    this.unsubscribers = [];
  
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
        
        let dateObj = {};
        dateObj.from = this.date(this.scope.dateFrom, 'yyyy-MM-dd');
        dateObj.to = this.date(this.scope.dateTo, 'yyyy-MM-dd');
        
        this.di.logDataManager.getLogs(dateObj).then((res) => {
          this.scope.loading = false;
          this.scope.hasData = res.data.logs.length ? true : false;
          this.scope.entities = this.getEntities(res.data.logs);
          defer.resolve({
            data: this.scope.entities,
            count: this.scope.entities.length
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.logService.getTableSchema(),
          index_name: 'created_time',
        };
      }
    });
  }
  
  getEntities(origins) {
    let entities = [];
    if(!Array.isArray(origins)) return entities;
    origins.forEach((item) => {
      let obj = {};
      let arr = item.split('|');
      if(arr.length ===  6){
        obj.created_time = arr[0];
        obj.type = arr[1];
        obj.level = arr[2];
        obj.creator = arr[3];
        obj.operation = arr[4];
        obj.content = arr[5];
        entities.push(obj);
      }
      

    });
    return entities;
  }
  
}

LogController.$inject = LogController.getDI();
LogController.$$ngIsClass = true;