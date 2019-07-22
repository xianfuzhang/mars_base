export class snoopCtrl {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$q',
      '$filter',
      'roleService',
      'snoopService',
      'notificationService',
      'deviceDataManager',
      'snoopDataManager',
      'tableProviderFactory'
    ];
  }
  constructor(...args){
    this.di = {};
    snoopCtrl.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.role = this.di.roleService.getRole();
    this.scope.deviceMap = {};
    this.scope.createFlag = true;
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
    unsubscribes.push(this.di.$rootScope.$on('dhcp-snoop-list-refresh', () => {
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

    this.scope.createDHCPSnooping = () => {
      this.scope.createFlag = true;
      this.scope.$emit('dhcp-snoop-wizard-show');
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
            'device_name': this.scope.deviceMap[item.deviceId] || item.deviceId,
            'deviceId': item.deviceId,
            'delegate': item.basic.isDelegate ? this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.DELEGATE.TRUE') : this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.DELEGATE.FALSE'),
            'global_status': item.basic.globalStatus ? this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.STATUS.ENABLE') : this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.STATUS.DISABLE'),
            'info_status': item.basic.infoStatus ? this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.STATUS.ENABLE') : this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.STATUS.DISABLE'),
            'mac_verify': item.basic.macVerify ? this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.STATUS.ENABLE') : this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.STATUS.DISABLE'),
            'macVerify': item.basic.macVerify,
            'infoStatus': item.basic.infoStatus,
            'globalStatus': item.basic.globalStatus,
            'isDelegate': item.basic.isDelegate,
            'vlan': item.basic.vlans.toString()
          });
          break;
        case 'port':
          item.ports.forEach((p) => {
            this.scope.entities.push({
              'device_name': this.scope.deviceMap[item.deviceId] || item.deviceId,
              'deviceId': item.deviceId,
              'port': p.port,
              'circuitId': p.circuitId,
              'trusted_display': p.trusted ? this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.DELEGATE.TRUE') :  this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.DELEGATE.FALSE'),
              'trusted': p.trusted
            });
          });
          break;  
      }
    });
  }

  prepareTableData() {
    this.scope.model.schema = this.getTableSchema();
    this.scope.model.actionsShow = this.getTableActionsShow();
    this.scope.model.rowActions = this.getTableRowActions();
  }

  getTableSchema() {
    let schema = null;
    switch(this.scope.tabSelected.type){
      case 'switch':
        schema = this.di.snoopService.getDeviceSnoopTableSchema();
        break;
      case 'port':
        schema = this.di.snoopService.getPortSnoopTableSchema();
        break;
    }
    return schema;
  }

  getTableActionsShow() {
    let actions = null;
    switch(this.scope.tabSelected.type){
      case 'switch':
      actions = this.di.snoopService.getDeviceSnoopTableActionsShow();
        break;
      case 'port':
      actions = this.di.snoopService.getPortSnoopTableActionsShow();
        break;
    }
    return actions;
  }

  getTableRowActions() {
    let actions = null;
    switch (this.scope.tabSelected.type) {
      case 'switch':
        actions = this.di.snoopService.getDeviceSnoopTableRowActions();
        break;
      case 'port':
        actions = this.di.snoopService.getPortSnoopTableRowActions();
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
    this.di.snoopDataManager.getDeviceSnoopList().then((res)=>{
      lbDefer.resolve(res.data.devices);
    });
    this.di.$q.all([lbDefer.promise, deviceDefer.promise]).then((arr) => {
      defer.resolve(arr);
    });
    return defer.promise;
  }
}
snoopCtrl.$inject = snoopCtrl.getDI();
snoopCtrl.$$ngIsClass = true;