export class LogController {
  static getDI() {
    return [
      '$filter',
      '$scope',
      '$rootScope',
      '$q',
      '$timeout',
      '$window',
      '$location',
      '$sce',
      '_',
      'appService',
      'dialogService',
      'logService',
      'roleService',
      'wsService',
      'logDataManager',
      'tableProviderFactory',
      'dashboardDataManager'
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
    this.scope.role = this.di.roleService.getRole();
    this.scope.updateRealtimeLogFlag = true;
    this.scope.endpointDisLabs = {options: []};
    this.scope.selectedEndpoint = {};
  
    this.wsService = this.di.wsService;
    this.MAX_LOG_NUM = 1000;  // max number of logs
    this.hiddenRealtimeLogs = [];
    this.scope.realtimeBtnTxt = this.translate('MODULE.LOG.BUTTON.PAUSE');
    this.logKeywords = [];
    
    // the params that had send to get data
    let dateObj = {from: null, to: null};
  
    this.scope.logModel = {
      actionsShow: this.getActionsShow(),
      // rowActions: this.di.logService.getDeviceTableRowActions(),
      logProvider: null,
      logAPI: null,
      logFileSelected: null
    };
    
    this.scope.search = () => {
      this.scope.loading = true;
      
      this.scope.logModel.logAPI.queryUpdate();
    };
  
    this.scope.downloadFile = () => {
      if (this.scope.logModel.logFileSelected.value == '') return false;
	
      this.di.$window.location.href = this.di.appService.getLogFilesUrl() + `/${this.scope.logModel.logFileSelected.value}`;
	    
      // let DI = this.di;
	    // DI.$rootScope.$emit('start_loading');
	    // DI.appService.downloadFileWithAuth(url, this.scope.logModel.logFileSelected.value).then(() => {
	    //   DI.$rootScope.$emit('stop_loading');
      // }, () => {
	    //   DI.$rootScope.$emit('stop_loading');
      // });
    }
  
    this.scope.onLogAPIReady = ($api) => {
      this.scope.logModel.logAPI = $api;
    };
  
    this.scope.onTabChange = (tab) => {
      if (tab){
        this.scope.tabSelected = tab;
      }
    };
    
    this.scope.onKeywordChange = (keywordStr) => {
      keywordStr = keywordStr.trim();
      if(!keywordStr) {
        this.logKeywords = [];
        return
      }
  
      let tmpKeywords = [];
      keywordStr = keywordStr.replace(/[,;]/g,' ');
      let tmpArr = keywordStr.split(' ');
      tmpArr.forEach((keyword) => {
        if(keyword) {
          tmpKeywords.push(keyword);
        }
      })
      
      this.logKeywords = tmpKeywords;
    }
    
    this.scope.onUpdateBtn = () => {
      this.scope.updateRealtimeLogFlag = !this.scope.updateRealtimeLogFlag;
      if(this.scope.updateRealtimeLogFlag) {
        this.scope.realtimeBtnTxt = this.translate('MODULE.LOG.BUTTON.PAUSE');
      } else {
        this.scope.realtimeBtnTxt = this.translate('MODULE.LOG.BUTTON.CONTINUE');
      }
    }
    
    this.scope.onClearLogsBtn = () => {
      let logList = document.getElementById('realtime-log-div');
      let count = logList.childNodes.length;
      for(let i = count - 1; i >= 0; i--) {
        logList.removeChild(logList.childNodes[i]);
      }
    }
    
    this.scope.tabs = this.getTabSchema();
  
    this.scope.tabSelected = this.scope.tabs[0];
    
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
  
    this.unsubscribers.push(this.di.$scope.$watch('updateRealtimeLogFlag', (newVal, oldVal) => {
      if(newVal == oldVal)return;
      if (newVal == true && this.hiddenRealtimeLogs.length) {
        let logList = document.getElementById('realtime-log-div');
        this.hiddenRealtimeLogs.forEach((log) => {
          let newLog = this.getLogElementNode(log)
          
          logList.insertBefore(newLog, logList.childNodes[0])
        })
        
        this.hiddenRealtimeLogs = [];
      }
    }));
  
    this.scope.$on('$destroy', () => {
      this.unsubscribers.forEach((cb) => {
        cb();
      });
      // close websocket
      this.wsService.unsubscribe('');
      this.wsService.kill();
    });
  }
  
  init() {
    // get controlers
    this.di.dashboardDataManager.getCluster().then((res)=>{
      let host = this.di.$location.host();
      let selectedEndpoint = {}, endpointOptions = [];
      res.forEach(node => {
        if(host == node.ip) {
          selectedEndpoint.label = node.ip;
          selectedEndpoint.value = node.ip;
        }
        endpointOptions.push({label:node.ip, value:node.ip});
      })
  
      this.scope.endpointDisLabs.options = endpointOptions;
      if (!this.di._.isEmpty (selectedEndpoint)) {
        this.scope.selectedEndpoint = selectedEndpoint;
      } else {
        this.scope.selectedEndpoint = this.scope.endpointDisLabs.options[0];
      }
      
      // get realtime log
      try {
        // let endpoint = this.di.appService.getWebscoketEndpoint(this.scope.selectedEndpoint.value);
        // this.wsService.init(endpoint);
        this.wsService.init();
      } catch(e) {
        console.error(e.message)
      } finally {
        this.wsService.subscribe('', {}, (response) => {
          let message = response.message;
      
          if(this.scope.updateRealtimeLogFlag) {
            let newLog = this.getLogElementNode(message)
        
            let logList = document.getElementById('realtime-log-div');
            logList.insertBefore(newLog, logList.childNodes[0])
          } else {
            this.hiddenRealtimeLogs.push(message);
        
            if(this.hiddenRealtimeLogs.length > this.MAX_LOG_NUM) { // only save MAX_LOG_NUM logs
              this.hiddenRealtimeLogs.splice(0, this.MAX_LOG_NUM - this.hiddenRealtimeLogs.length);
            }
          }
        })
      }
    });
    
    // get system history log
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
      this.scope.logModel.logFileSelected = this.scope.fileList.options[0];
    });
  }
  
  getLogElementNode(log) {
    
    this.logKeywords.forEach((keyword) => {
      let regex = new RegExp(keyword, 'gi');
      let replacement = '<span style="color:yellow">' + keyword + '</span>'
      log = log.replace(regex, replacement)
    })
  
    let newLog = document.createElement('span');
    newLog.innerHTML = '<span>' + log + '</span><br /><br />';

    return newLog;
  }
  
  getTabSchema() {
    return [
      {
        'label': this.translate('MODULE.LOG.TAB.REALTIME'),
        'value': 'realtime',
        'type': 'realtime'
      },
      {
        'label': this.translate('MODULE.LOG.TAB.HISTORY'),
        'value': 'history',
        'type': 'history'
      }
    ];
  }
  
  getActionsShow() {
    return {
      'refresh': {'enable': true, 'role': 2}, 
      'search': {'enable': true, 'role': 2}
    };
  }
  
  getEntities(origins) {
    let entities = [];
    let exceptionStr = '';
    let exceptionObj = {}
    let newException = true;
    if(!Array.isArray(origins)) return entities;
    origins.forEach((item) => {
      let obj = {};
      let arr = item.split('|');
      if(arr.length ===  6){
        // add pre exception
        if(exceptionStr) {
          exceptionObj = {}
          exceptionObj.created_time = '-';
          exceptionObj.type = 'EXCEPTION';
          exceptionObj.level = '-';
          exceptionObj.creator = '-';
          exceptionObj.operation = '-';
          exceptionObj.content = exceptionStr;
          entities.push(exceptionObj);
          exceptionStr = '';
          newException = true;
        }
        
        obj.created_time = arr[0];
        obj.type = arr[1];
        obj.level = arr[2];
        obj.creator = arr[3];
        obj.operation = arr[4];
        obj.content = arr[5];
        entities.push(obj);
      } else if(arr.length ===  1){
        exceptionStr += arr[0];
        newException = false;
      }
    });
    
    if(exceptionStr) {
      exceptionObj = {}
      exceptionObj.created_time = '-';
      exceptionObj.type = 'EXCEPTION';
      exceptionObj.level = '-';
      exceptionObj.creator = '-';
      exceptionObj.operation = '-';
      exceptionObj.content = exceptionStr;
      entities.push(exceptionObj);
      exceptionStr = '';
      newException = true;
    }
    return entities;
  }
  
}

LogController.$inject = LogController.getDI();
LogController.$$ngIsClass = true;