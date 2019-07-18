export class LbdCtrl {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$q',
      '$filter',
      'roleService',
      'deviceService',
      'notificationService',
      'deviceDataManager',
      'loopbackDataManager',
      'tableProviderFactory'
    ];
  }
  constructor(...args){
    this.di = {};
    LbdCtrl.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.role = this.di.roleService.getRole();
    this.scope.deviceMap = {};
    this.scope.entities = [];
    this.scope.tabs = [
      {
        'label': this.translate('MODULES.LOOPBACK.TAB.SWITCH'),
        'value': 'switch',
        'type': 'switch'
      },
      {
        'label': this.translate('MODULES.LOOPBACK.TAB.PORT'),
        'value': 'port',
        'type': 'port'
      }
    ];
    this.scope.tabSelected = null;
    this.scope.model = {
      'actionsShow': null,
      'rowActions': null,
      'schema': null,
      'provider': null,
      'api': null
    };
    
    this.initActions();
    this.init();

    let unsubscribes = [];
    unsubscribes.push(this.di.$rootScope.$on('device-lbd-refresh', () => {
      this.scope.model.api.queryUpdate();
    }));
    this.scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => cb());
    });
  }

  initActions() {
    this.scope.onTabChange = (tab) => {
      this.scope.tabSelected = tab;
      this.prepareTableData();
    };
       
    this.scope.onApiReady = ($api) => {
      this.scope.model.api = $api;
    };

    this.scope.onTableRowSelectAction = (event) => {
      if (this.scope.tabSelected.type === 'switch') {
        this.scope.$emit('update-device-lbd-wizard-show', event.data);
      }
      else {
        let status = event.action.value === "enable" ? true : false;
        this.di.loopbackDataManager.updatePortLoopbackStatus(event.data.deviceId, event.data.port, {'status': status}).then(
          () => {
            event.data.status = !event.data.status;
            event.data.status_display =  !event.data.status ? this.translate('MODULES.LOOPBACK.STATUS.DISABLE') : this.translate('MODULES.LOOPBACK.STATUS.ENABLE')
            this.scope.model.api.update();
          }, (error) => {
            this.di.notificationService.renderWarning(this.scope, error);
          });
      }
    };

    this.scope.onTableRowActionsFilter = (event) => {
      let filterActions = [];
      event.actions.forEach((action) => {
        if (!event.data.status && action.value === "enable") {
          filterActions.push(action);
        }
        if  (event.data.status && action.value === "disable") {
          filterActions.push(action);
        }
      });
      return filterActions;
    };
  }

  init() {
    this.scope.model.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
          this.getEntities().then((arr) => {
            this.dataFormat(arr[0]);
            defer.resolve({
              data: this.scope.entities
            });
          });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema:  this.scope.model.schema,
          index_name: 'session_id',
          rowCheckboxSupport: true,
          rowActionsSupport: true,
          authManage: {
            support: true,
            currentRole: this.scope.role
          }
        };
      }
    });

    this.scope.tabSelected = this.scope.tabs[0];
    this.scope.onTabChange(this.scope.tabSelected);
  }

  dataFormat(arr) {
    this.scope.entities = [];
    arr.forEach((item) => {
      switch(this.scope.tabSelected.type){
        case 'switch':
          this.scope.entities.push({
            'device': this.scope.deviceMap[item.deviceId] || item.deviceId,
            'deviceId': item.deviceId,
            'status_display': item.status === false ? this.translate('MODULES.LOOPBACK.STATUS.DISABLE') : this.translate('MODULES.LOOPBACK.STATUS.ENABLE'),
            'status': item.status,
            'interval': item.interval,
            'recover_display': item.recover === 0 ? this.translate('MODULES.LOOPBACK.STATUS.DISABLE') : item.recover,
            'recover': item.recover,
            'action_display': item.action === 'shutdown' ? this.translate('MODULES.LOOPBACK.ACTION.SHUTDOWN') 
              : item.action === 'none' ? this.translate('MODULES.LOOPBACK.ACTION.NONE') 
              : this.translate('MODULES.LOOPBACK.ACTION.BLOCK'),
            'action': item.action,  
            'trap_display': item.trap === 'none' ? this.translate('MODULES.LOOPBACK.TRAP.NONE')
              : item.trap === 'recover' ? this.translate('MODULES.LOOPBACK.TRAP.RECOVER')
              : item.trap === 'detect' ? this.translate('MODULES.LOOPBACK.TRAP.DETECT')
              : this.translate('MODULES.LOOPBACK.TRAP.BOTH'),
            'trap': item.trap  
          });
          break;
        case 'port':
          this.scope.entities.push({
            'device': this.scope.deviceMap[item.deviceId] || item.deviceId,
            'deviceId': item.deviceId,
            'port': item.port,
            'status_display': item.status === false ? this.translate('MODULES.LOOPBACK.STATUS.DISABLE') : this.translate('MODULES.LOOPBACK.STATUS.ENABLE'),
            'status': item.status,
            'operState': item.operState
          });
          break;  
      }
    });
  }

  prepareTableData() {
    this.scope.model.schema = this.getTableSchema();
    this.scope.model.actionsShow = this.di.deviceService.getLoopbackActionsShow();
    this.scope.model.rowActions = this.getTableRowActions();
  }

  getTableSchema() {
    let schema = null;
    switch(this.scope.tabSelected.type){
      case 'switch':
        schema = this.di.deviceService.getSwitchLoopbackSchema();
        break;
      case 'port':
        schema = this.di.deviceService.getPortLoopbackSchema();
        break;
    }
    return schema;
  }

  getTableRowActions() {
    let actions = null;
    switch (this.scope.tabSelected.type) {
      case 'switch':
        actions = this.di.deviceService.getSwitchLoopbackTableRowActions();
        break;
      case 'port':
        actions = this.di.deviceService.getPortLoopbackTableRowActions();
        break;
    }
    return actions;
  }

  getEntities() {
    let defer = this.di.$q.defer(),
        deviceDefer = this.di.$q.defer(),
        lbDefer = this.di.$q.defer();
    this.di.deviceDataManager.getDeviceConfigs().then((devices) => {
      devices.forEach((device) => {
        this.scope.deviceMap[device['id']] = device['name'];
      });
      deviceDefer.resolve();
    });    
    switch(this.scope.tabSelected.type){
      case 'switch':
        this.di.loopbackDataManager.getDeviceLoopbackDetectionList().then((res)=>{
          lbDefer.resolve(res.data.devices);
        });
        break;
      case 'port':
        this.di.loopbackDataManager.getPortLoopbackDetectionList().then((res)=>{
          lbDefer.resolve(res.data.ports);
        });
        break;
    }
    this.di.$q.all([lbDefer.promise, deviceDefer.promise]).then((arr) => {
      defer.resolve(arr);
    });
    return defer.promise;
  }
}
LbdCtrl.$inject = LbdCtrl.getDI();
LbdCtrl.$$ngIsClass = true;