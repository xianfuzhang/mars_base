export class LogController {
  static getDI() {
    return [
      '$filter',
      '$scope',
      '$rootScope',
      '$q',
      '$timeout',
      '$window',
      'appService',
      'dialogService',
      'logService',
      'roleService',
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
    this.scope.fileList = {options: []};
    this.scope.logFileSelected = {};
    this.scope.role = this.di.roleService.getRole();
    let now = Date.now();
    let today = this.date(now, 'yyyy-MM-dd');
    this.scope.today = new Date(today + ' 23:59:59');
    this.scope.dateFrom = new Date(today + ' 00:00:00');
    this.scope.dateTo = new Date(today + ' 23:59:59');
    
    // the params that had send to get data
    let dateObj = {from: null, to: null};
  
    this.scope.logModel = {
      actionsShow: this.getActionsShow(),
      // rowActions: this.di.logService.getDeviceTableRowActions(),
      logProvider: null,
      logAPI: null
    };
    
    this.scope.search = () => {
      this.scope.loading = true;
      
      this.scope.logModel.logAPI.queryUpdate();
    };
  
    this.scope.downloadFile = () => {
      if (this.scope.logFileSelected.value == '') return false;
      
      this.di.$window.location.href = this.di.appService.getLogFilesUrl() + `/${this.scope.logFileSelected.value}`;
    }
  
    this.scope.onLogAPIReady = ($api) => {
      this.scope.logModel.logAPI = $api;
    };
    
    this.unsubscribers = [];
  
    this.init();

    let textPretty = (text) =>{
      let ret = "";
      let isJson = false;
      try{
        ret = JSON.stringify(JSON.parse(text), null ,2 )
        isJson = true;
      } catch(e){
        ret = text;
      }
      return {ret: ret, isJson: isJson};
    };

    this.unsubscribers.push(this.di.$rootScope.$on('popuptext', (event, params) => {
      if (params && params.field === 'content') {
        let res = textPretty(params.value);
        this.di.dialogService.createDialog(res.isJson?'info_json':'info', res.ret).then((data)=>{},(err)=>{});
      }
    }));

    this.scope.$on('$destroy', () => {
      this.unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }
  
  init() {
    // get system log
    this.scope.logModel.logProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        
        // params.from = this.date(this.scope.dateFrom, 'yyyy-MM-dd');
        // params.to = this.date(this.scope.dateTo, 'yyyy-MM-dd');
        
        this.di.logDataManager.getLogs(params).then((res) => {
          this.scope.loading = false;
          this.scope.hasData = res.data.logs.length ? true : false;
          this.scope.entities = this.getEntities(res.data.logs);
          defer.resolve({
            data: this.scope.entities,
            count: res.data.count
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.logService.getTableSchema(),
          index_name: 'created_time',
          authManage: {
            support: true,
            currentRole: this.di.$scope.role
          }
        };
      }
    });
    
    // get log file
    this.di.logDataManager.getLogFiles().then((res) => {
      let opts = [{label: this.translate('MODULE.LOG.DOWNLOAD_FILE_SELECT'), value:""}];
      if(res.data && res.data['files'] && res.data['files'] instanceof Array){
        res.data['files'].forEach((item)=>{
          opts.push({label:item, value:item})
        });
      }
  
      this.scope.fileList.options = opts;
      this.scope.logFileSelected = this.scope.fileList.options[0];
    });
  }
  
  getActionsShow() {
    return {
      'refresh': {'enable': true, 'role': 2}, 
      'search': {'enable': true, 'role': 2}
    };
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