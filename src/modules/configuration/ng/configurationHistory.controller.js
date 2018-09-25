export class ConfigurationHistoryController {
  static getDI() {
    return [
      '$filter',
      '$scope',
      '$q',
      '$timeout',
      'configurationDataManager',
      'tableProviderFactory'
    ];
  }
  
  constructor(...args) {
    this.di = {};
    ConfigurationHistoryController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.date = this.di.$filter('date');
    
    this.scope.pageTitle = this.translate('MODULE.HEADER.CONFIG.CONFIGURATION_HISTORY');
    this.scope.loading = false;
    this.scope.hasData = false;
    
    let now = Date.now();
    let today = this.date(now, 'yyyy-MM-dd');
    this.scope.today = new Date(today + ' 23:59:59');
    this.scope.dateFrom = new Date(today + ' 00:00:00');
    this.scope.dateTo = new Date(today + ' 23:59:59');
    
    this.scope.configurationHistoryModel = {
      provider: null,
      api: null,
      actionsShow: this.getActionsShow()
    };
    
    this.scope.search = () => {
      this.scope.loading = true;
      
      this.scope.configurationHistoryModel.api.queryUpdate();
    }
    
    this.scope.file = () => {
      // TODO: get file from backend
      this.scope.loading = true;
      this.di.$timeout(() => {
        this.scope.loading = false;
      }, 2000)
    }
    
    this.scope.onAPIReady = ($api) => {
      this.scope.configurationHistoryModel.api = $api;
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
    this.scope.configurationHistoryModel.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        
        // params.from = this.date(this.scope.dateFrom, 'yyyy-MM-dd');
        // params.to = this.date(this.scope.dateTo, 'yyyy-MM-dd');
        
        this.di.configurationDataManager.getConfigurationHistory(params).then((res) => {
          this.scope.loading = false;
          this.scope.hasData = res.data.configs.length ? true : false;
          this.scope.entities = this.getEntities(res.data.configs);
          defer.resolve({
            data: this.scope.entities,
            count: this.scope.entities.length
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.getTableSchema(),
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
      
      obj.time = item.time;
      obj.type = item.type;
      obj.class = item.class;
      obj.subject = item.subject;
      obj.config = JSON.stringify(item.config);
      
      entities.push(obj);
    });
    return entities;
  }
  
  getActionsShow() {
    return {'refresh': true, 'search': false};
  }
  
  getTableSchema() {
    return [
      {
        'label': this.translate('MODULES.CONFIGURATION.HISTORY.COLUMN.TIME'),
        'field': 'time',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.CONFIGURATION.HISTORY.COLUMN.TYPE'),
        'field': 'type',
        'layout': {'visible': true, 'sortable': false, 'fixed': true}
      },
      {
        'label': this.translate('MODUELS.CONFIGURATION.HISTORY.COLUMN.CLASS'),
        'field': 'subject',
        'layout': {'visible': true, 'sortable': false, 'fixed': true}
      },
      {
        'label': this.translate('MODUELS.CONFIGURATION.HISTORY.COLUMN.SUBJECT'),
        'field': 'class',
        'layout': {'visible': true, 'sortable': false, 'fixed': true}
      },
      {
        'label': this.translate('MODUELS.CONFIGURATION.HISTORY.COLUMN.CONFIG'),
        'field': 'config',
        'layout': {'visible': true, 'sortable': false, 'fixed': true}
      }
    ];
  }
  
}

ConfigurationHistoryController.$inject = ConfigurationHistoryController.getDI();
ConfigurationHistoryController.$$ngIsClass = true;