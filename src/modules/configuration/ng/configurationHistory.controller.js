export class ConfigurationHistoryController {
  static getDI() {
    return [
      '$filter',
      '$scope',
      '$rootScope',
      '$q',
      '$timeout',
      '$window',
      'appService',
      'roleService',
      'dialogService',
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
    this.scope.role = this.di.roleService.getRole();
    this.scope.pageTitle = this.translate('MODULE.HEADER.CONFIG.CONFIGURATION_HISTORY');
    this.scope.loading = false;
    this.scope.hasData = false;
    this.scope.fileList = {options: []};
    this.scope.historyFileSelected = {};
    
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
  
    this.scope.downloadFile = () => {
      if (this.scope.historyFileSelected.value == '') return false;
	
      this.di.$window.location.href = this.di.appService.getConfigurationHistoryFilesUrl() + `/${this.scope.historyFileSelected.value}`;
	
	    // let DI = this.di;
	    // DI.$rootScope.$emit('start_loading');
	    // DI.appService.downloadFileWithAuth(url, this.scope.historyFileSelected.value).then(() => {
		  //   DI.$rootScope.$emit('stop_loading');
	    // }, () => {
		  //   DI.$rootScope.$emit('stop_loading');
	    // });
    }
    
    this.scope.onAPIReady = ($api) => {
      this.scope.configurationHistoryModel.api = $api;
    };
    
    this.unsubscribers = [];

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
      if (params && params.field === 'config') {
        let res = textPretty(params.value);
        this.di.dialogService.createDialog(res.isJson?'info_json':'info', res.ret).then((data)=>{},(err)=>{});
      }
    }));

    
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
            count: res.data.count
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.getTableSchema(),
          index_name: 'created_time',
          authManage: {
            support: true,
            currentRole: this.scope.role
          }
        };
      }
    });
  
    // get configuration history files
    this.di.configurationDataManager.getConfigurationHistoryFiles().then((res) => {
      let opts = [{label: this.translate('MODULE.LOG.DOWNLOAD_FILE_SELECT'), value:""}];
      if(res.data && res.data['files'] && res.data['files'] instanceof Array){
        res.data['files'].forEach((item)=>{
          opts.push({label:item, value:item})
        });
      }
    
      this.scope.fileList.options = opts;
      this.scope.historyFileSelected = this.scope.fileList.options[0];
    });
  }
  
  getEntities(origins) {
    let entities = [];
    if(!Array.isArray(origins)) return entities;
    origins.forEach((item) => {
      let obj = {};
      
      obj.time = this._formatLocaleTime(item.time);
      obj.type = item.type;
      obj.class = item.class;
      obj.subject = item.subject;
      obj.config = JSON.stringify(item.config);
      
      entities.push(obj);
    });
    return entities;
  }

  _formatLocaleTime(time){
    let _fillInt= (num, count)=>{
      if(!count){
        count = 2;
      }
      let numStr = num + '';
      if(numStr.length !== count) {
        return '0'.repeat(count - numStr.length) + numStr
      } else
        return num
    };

    let d = new Date(time);
    let res = d.getFullYear() + '-' +
      _fillInt(d.getMonth()+ 1) + '-' +
      _fillInt(d.getDate()) + ' ' +
      _fillInt(d.getHours()) +  ':' +
      _fillInt(d.getMinutes()) + ':' +
      _fillInt(d.getSeconds())+ ',' +
      _fillInt(d.getMilliseconds(),3);

     return res
  }



  getActionsShow() {
    return {
      'refresh': {'enable': true, 'role': 3}, 
      'search': {'enable': false, 'role': 3}
    };
  }
  
  getTableSchema() {
    return [
      {
        'label': this.translate('MODULES.CONFIGURATION.HISTORY.COLUMN.TIME'),
        'field': 'time',
        'layout': {'visible': true, 'sortable': true, 'fixed': true, width:"30%"}
      },
      {
        'label': this.translate('MODULES.CONFIGURATION.HISTORY.COLUMN.TYPE'),
        'field': 'type',
        'layout': {'visible': true, 'sortable': false, 'fixed': true, width:"20%"}
      },
      // {
      //   'label': this.translate('MODUELS.CONFIGURATION.HISTORY.COLUMN.CLASS'),
      //   'field': 'subject',
      //   'layout': {'visible': true, 'sortable': false, 'fixed': true}
      // },
      // {
      //   'label': this.translate('MODUELS.CONFIGURATION.HISTORY.COLUMN.SUBJECT'),
      //   'field': 'subject',
      //   'layout': {'visible': true, 'sortable': false, 'fixed': true}
      // },
      {
        'label': this.translate('MODUELS.CONFIGURATION.HISTORY.COLUMN.CONFIG'),
        'field': 'config',
        'type':'popuptext',
        'layout': {'visible': true, 'sortable': false, 'fixed': true, width:"50%"}
      }
    ];
  }
  
}

ConfigurationHistoryController.$inject = ConfigurationHistoryController.getDI();
ConfigurationHistoryController.$$ngIsClass = true;