export class PfcController {
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
      'applicationService',
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
    PfcController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unSubscribers = [];
    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    scope.role = this.di.roleService.getRole();

    scope.deviceMap = {};
    scope.entities = [];


    scope.pfcModel = {
      'actionsShow': null,
      'rowActions': null,
      'schema': null,
      'provider': null,
      'api': null
    };

    scope.onTableRowClick = (event) => {
      if (event.$data){
        scope.pfcModel.api.setSelectedRow(event.$data.uuid);
      }
    };



    scope.onApiReady = ($api) => {
      scope.pfcModel.api = $api;
    };


    let getTableSchema = () =>{
      return this.di.functionService.getPFCSchema();
    };

    let getTableRowActions = ()  => {
      return this.di.functionService.getPFCTableRowActions();;
    };

    let prepareTableData = () => {
      scope.pfcModel.schema = getTableSchema();
      scope.pfcModel.actionsShow = this.di.functionService.getPFCActionsShow();
      scope.pfcModel.rowActions = getTableRowActions();
    };

    scope.onTableRowSelectAction = (event) => {
        // scope.$emit('update-port-poe-wizard-show', event.data);
      if (event.action.value === 'edit'){
        this.di.$rootScope.$emit('pfc-wizard-show', event.data.deviceId, event.data.port, event.data.device_name);
      } else if(event.action.value === 'delete'){
        this.di.dialogService.createDialog('warning', this.translate('MODULES.SWITCH.DETAIL.DIALOG.CONTENT.DELETE_PFC'))
          .then(() =>{
            this.di.deviceDataManager.deletePFC(event.data.deviceId, event.data.port)
              .then((res) => {
                this.di.notificationService.renderSuccess(scope, this.translate('MODULES.SWITCH.DETAIL.PFC.DELETE.SUCCESS'));
                scope.pfcModel.api.queryUpdate();
              }, (res) => {
                this.di.notificationService.renderWarning(scope, res.data.message|| res.data|| res);
              });
          }, () =>{
            this.di.$log.debug('delete switch pfc cancel');
          });
      }

    };

    scope.onTableRowClick = (event) => {
      if (event.$data){
        scope.pfcModel.api.setSelectedRow(event.$data.uuid);
      }
    };

    scope.addPfc = () =>{
      this.di.$rootScope.$emit('pfc-wizard-show');
    };

    prepareTableData();
    this.init();

    unSubscribers.push(this.di.$rootScope.$on('pfc-list-refresh',()=>{
      this.di.notificationService.renderSuccess(scope, this.translate('MODULES.SWITCH.DETAIL.PFC.CREATE.SUCCESS'));
      scope.pfcModel.api.queryUpdate();
    }));

    scope.$on('$destroy', () => {
      this.di._.each(unSubscribers, (unSubscribe) => {
        unSubscribe();
      });
    });
  }

  init(){
    let scope = this.di.$scope;
    scope.pfcModel.provider = this.di.tableProviderFactory.createProvider({
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
          schema: scope.pfcModel.schema,
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

  }


  getEntities() {
    let scope = this.di.$scope;
    let defer = this.di.$q.defer(), deviceDefer = this.di.$q.defer(), pfcDefer = this.di.$q.defer();
    this.di.deviceDataManager.getDeviceConfigs().then((devices) => {
      devices.forEach((device) => {
        this.di.$scope.deviceMap[device['id']] = device['name'];
      });
      deviceDefer.resolve();
    });

    this.di.functionDataManager.getPfc().then((res) => {
        // this.di.functionDataManager.testGetPoeMain().then((res)=>{
        pfcDefer.resolve(res.data.pfcs);
      },
      (err) => {
        pfcDefer.reject(err);
      });

    this.di.$q.all([pfcDefer.promise, deviceDefer.promise]).then((arr) => {
      defer.resolve(arr);
    }, (err) => {
      defer.reject(err);
    });
    return defer.promise;
  }

  dataFormat(arr) {
    let scope = this.di.$scope;
    scope.entities = [];
    arr.forEach((item) => {

      scope.entities.push({
        'device_name': scope.deviceMap[item.deviceId] || item.deviceId,
        'deviceId': item.deviceId,
        'port': item.port,
        'uuid': item.deviceId + item.port,
        'queues': item['queues'] && Array.isArray(item['queues'])?item.queues.join(', '):''
      });
    });
  }

}

PfcController.$inject = PfcController.getDI();
PfcController.$$ngIsClass = true;