export class PoeController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '_',
      '$filter',
      '$q',
      '$log',
      '$location',
      'roleService',
      'dialogService',
      'appService',
      'notificationService',
      'tableProviderFactory',
      'functionDataManager',
      'deviceDataManager',
      'deviceService',
      'functionService'
    ];
  }

  constructor(...args) {
    this.di = {};
    PoeController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unSubscribers = [];
    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    scope.role = this.di.roleService.getRole();

    scope.tabSelected = null;
    scope.deviceMap = {};
    scope.entities = [];

    scope.tabs = [
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

    scope.poeModel = {
      'actionsShow': null,
      'rowActions': null,
      'schema': null,
      'provider': null,
      'api': null,
      // actionsShow: {
      //   'menu': {'enable': true, 'role': 2},
      //   'add': {'enable': false, 'role': 2},
      //   'remove': {'enable': true, 'role': 2},
      //   'refresh': {'enable': true, 'role': 2},
      //   'search': {'enable': false, 'role': 2}
      // },
      // rowActions: [
      //   {
      //     'label': this.translate('MODULES.ALERT.HISTORY.DELETE'),
      //     'role': 2,
      //     'value': 'delete'
      //   }
      // ],
      // alertTableProvider: null,
      // alertAPI: null
    };

    scope.onTableRowClick = (event) => {
      if (event.$data){
        scope.poeModel.alertAPI.setSelectedRow(event.$data.uuid);
      }
    };


    scope.onTabChange = (tab) => {
      scope.tabSelected = tab;
      prepareTableData();
    };

    scope.onAlertAPIReady = ($api) => {
      scope.poeModel.alertAPI = $api;
    };


    let getTableSchema = () =>{
      let schema = null;
      switch(scope.tabSelected.type){
        case 'switch':
          schema = this.di.functionService.getPoeDeviceTableSchema();
          break;
        case 'port':
          schema = this.di.functionService.getPoePortTableSchema();
          break;
      }
      return schema;
    };

    let getTableRowActions = ()  => {
      let actions = null;
      switch (scope.tabSelected.type) {
        case 'switch':
          actions = this.di.functionService.getSwitchPoeTableRowActions();
          break;
        case 'port':
          actions = this.di.functionService.getSwitchPortPoeTableRowActions();
          break;
      }
      return actions;
    };

    let prepareTableData = () => {
      scope.poeModel.schema = getTableSchema();
      scope.poeModel.actionsShow = this.di.functionService.getPoeActionsShow();
      scope.poeModel.rowActions = getTableRowActions();
    };

    scope.onTableRowSelectAction = (event) => {
      if (this.scope.tabSelected.type === 'switch') {
        this.scope.$emit('update-device-poe-wizard-show', event.data);
      } else {
        this.scope.$emit('update-port-poe-wizard-show', event.data);
        // let status = event.action.value === "enable" ? true : false;
        // this.di.loopbackDataManager.updatePortLoopbackStatus(event.data.deviceId, event.data.port, {'status': status}).then(
        //   () => {
        //     event.data.status = !event.data.status;
        //     event.data.status_display =  !event.data.status ? this.translate('MODULES.LOOPBACK.STATUS.DISABLE') : this.translate('MODULES.LOOPBACK.STATUS.ENABLE')
        //     this.scope.model.api.update();
        //   }, (error) => {
        //     this.di.notificationService.renderWarning(this.scope, error);
        //   });
      }
    };

    this.init();

    scope.$on('$destroy', () => {
      this.di._.each(unSubscribers, (unSubscribe) => {
        unSubscribe();
      });
    });
  }

  init(){
    let scope = this.di.$scope;
    let m = this.di.alertDataManager;
    scope.poeModel.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.getEntities().then((arr) => {
          this.dataFormat(arr[0]);
          defer.resolve({
            data: scope.entities
          });
        }, err=>{
          this.di.notificationService.renderWarning(scope, err.data.message|| err.data|| err);
          defer.resolve({
            data: []
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: scope.poeModel.schema,
          index_name: 'uuid',
          rowCheckboxSupport: true,
          rowActionsSupport: true,
          authManage: {
            support: true,
            currentRole: scope.role
          }
        };
      }
    });

    scope.tabSelected = scope.tabs[0];
    scope.onTabChange(scope.tabSelected);
  }


  getEntities() {
    let scope = this.di.$scope;
    let defer = this.di.$q.defer(),
      deviceDefer = this.di.$q.defer(),
      poeDefer = this.di.$q.defer();
    this.di.deviceDataManager.getDeviceConfigs().then((devices) => {
      devices.forEach((device) => {
        this.di.$scope.deviceMap[device['id']] = device['name'];
      });
      deviceDefer.resolve();
    });
    switch(scope.tabSelected.type){
      case 'switch':
        this.di.functionDataManager.getPoeMain().then((res)=>{
          poeDefer.resolve(res.data.devices);
        },
        (err)=>{
          poeDefer.reject(err);
        });
        break;
      case 'port':
        this.di.functionDataManager.getPoePorts().then((res)=>{
          poeDefer.resolve(res.data.ports);
        },
        (err)=>{
          poeDefer.reject(err);
        });
        break;
    }
    this.di.$q.all([poeDefer.promise, deviceDefer.promise]).then((arr) => {
      defer.resolve(arr);
    }, (err)=>{
      defer.reject(err);
    });
    return defer.promise;
  }

  dataFormat(arr) {
    let scope = this.di.$scope;
    scope.entities = [];
    arr.forEach((item) => {
      switch(scope.tabSelected.type){
        case 'switch':
          scope.entities.push({
            'device_name': scope.deviceMap[item.deviceId] || item.deviceId,
            'deviceId': item.deviceId,
            'uuid': item.deviceId,
            'group': item.group,
            'operStatus': item.operStatus,
            'consumptionPower': item.consumptionPower,
            'threshold': item.threshold,
            'notifyCtrl': item.notifyCtrl,
            'dllPowerType': item.dllPowerType,
            'dllPowerSource': item.dllPowerSource
          });
          break;
        case 'port':
          scope.entities.push({
            'deviceId': item.deviceId,
            'device_name': scope.deviceMap[item.deviceId] || item.deviceId,
            'port': item.port,
            'uuid': item.deviceId + ':' + item.port,
            'group': item.group,
            'status': item.status,
            'powerPairsControlAbility': item.powerPairsControlAbility,
            'powerPairs': item.powerPairs,
            'detectionStatus': item.detectionStatus,
            'priority': item.priority,
            'mpsAbsentCounter': item.mpsAbsentCounter,
            'powerClassifications': item.group,
            'mirroredDllPdReqPower': item.mirroredDllPdReqPower,
            'dllPseAllocatePower': item.dllPseAllocatePower,
            'maxPower': item.maxPower,
            'usedPower': item.usedPower,
            'timeRange': item.timeRange,
            'timeRangeActive': item.timeRangeActive,
          });
          break;
      }
    });
  }

}

PoeController.$inject = PoeController.getDI();
PoeController.$$ngIsClass = true;