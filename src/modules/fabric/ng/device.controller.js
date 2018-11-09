export class DeviceController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$location',
      '$log',
      '$q',
      '$filter',
      '_',
      'dialogService',
      'appService',
      'deviceService',
      'notificationService',
      'deviceDataManager',
      'intentDataManager',
      'modalManager',
      'tableProviderFactory'
    ];
  }

  constructor(...args){
    this.di = {};
    DeviceController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    /*this.scope.tabSelected = null;
    this.scope.tabs = this.di.deviceService.getTabSchema();*/
    this.scope.page_title = this.translate('MODULES.SWITCHES.TAB.SCHEMA.SWITCH');
    this.scope.entities = [];
    this.scope.deviceModel = {
      actionsShow: this.di.deviceService.getDeviceActionsShow(),
      rowActions: this.di.deviceService.getDeviceTableRowActions(),
      deviceProvider: null,
      deviceAPI: null
    };
/*    this.scope.portModel = {
      actionsShow: this.di.deviceService.getPortActionsShow(),
      rowActions: this.di.deviceService.getPortTableRowActions(),
      portProvider: null,
      portAPI: null
    };
    this.scope.linkModel = {
      actionsShow: this.di.deviceService.getLinkActionsShow(),
      linkProvider: null,
      linkAPI: null
    };
    this.scope.endpointModel = {
      actionsShow: this.di.deviceService.getEndpointActionsShow(),
      rowActions: this.di.deviceService.getEndpointTableRowActions(),
      endpointProvider: null,
      endpointAPI: null
    };*/

    this.unsubscribers = [];

/*    this.scope.onTabChange= (tab) => {
      if (tab){
        this.scope.tabSelected = tab;
      }
    };*/

    this.scope.onTableRowClick = (event) => {
      if (event.$data){
        this.scope.deviceModel.deviceAPI.setSelectedRow(event.$data.mac);
      }
    };
/*
    this.scope.onPortTableRowActionsFilter = (event) =>{
      let filterActions = [];
      if (event.data) {
        event.actions.forEach((action) =>{
          if (event.data.isEnabled && action.value === 'disable') {
            filterActions.push(action);
          }
          else if (!event.data.isEnabled && action.value === 'enable') {
            filterActions.push(action);
          }
        });
      }
      return filterActions;
    };*/

    this.scope.onTableRowSelectAction = (event) => {
      if (event.data && event.action) {
        if (event.action.value === 'delete') {
          this.di.dialogService.createDialog('warning', this.translate('MODULES.SWITCHES.DIALOG.CONTENT.DELETE_SWITCH'))
          //this.confirmDialog(this.translate('MODULES.SWITCHES.DIALOG.CONTENT.DELETE_SWITCH'))
            .then((data) =>{
              this.di.deviceDataManager.deleteDevice(event.data.id)
                .then((res) =>{
                  this.scope.deviceModel.deviceAPI.queryUpdate();
                });
            }, (res) =>{
              this.di.$log.debug('delete switch dialog cancel');
            });
        }

        if (event.action.value === 'reboot') {
          this.di.dialogService.createDialog('confirm', this.translate('MODULES.SUMMARY.REBOOT.CONFORM'))
            .then((data)=>{
              this.di.deviceDataManager.rebootDevice(event.data.id);
            },(res)=>{
              // error
            })
        }

        if (event.action.value === 'intent') {
          if (this.scope.configDevices.length < 2) {
            this.scope.alert = {
              type: 'warning',
              msg: this.translate('MODULES.INTENT.CREATE.RESOURCE.INVALID')
            }
            this.di.notificationService.render(this.scope);
            return;
          }
          this.di.modalManager.open({
            template: require('../components/createIntent/template/createIntent.html'),
            controller: 'createIntentCtrl',
            windowClass: 'create-intent-modal',
            resolve: {
              dataModel: () => {
                return {
                  srcDevice: event.data,
                  devices: this.scope.configDevices,
                  from: 'device'
                };
              }
            }
          })
          .result.then((data) => {
            if (data && !data.canceled) {
              this.di.intentDataManager.createIntent(data.result).then(
                () => {
                  this.scope.alert = {
                    type: 'success',
                    msg: this.translate('MODULES.INTENT.CREATE.SUCCESS')
                  }
                  this.di.notificationService.render(this.scope);
                },
                (msg) => {
                  this.scope.alert = {
                    type: 'warning',
                    msg: msg
                  }
                  this.di.notificationService.render(this.scope);
                }
              );
            }
          });
        }

        // add by yazhou.miao
        if (event.action.value === 'edit') {
          this.di.$rootScope.$emit('switch-wizard-show', event.data.id);
        }

      /*  switch (this.scope.tabSelected.type) {
          case 'device':
            break;

          case 'port':
            let enabled = event.action.value === 'enable' ?  true : false;
            this.di.deviceDataManager.changePortState(event.data.element, event.data.port_id, {'enabled': enabled})
              .then((res) => {
                event.data.isEnabled = !event.data.isEnabled;
                this.scope.entities.forEach((item) => {
                  if (item.element === event.data.element && item.port_id === event.data.port_id) {
                    item.port_status = event.data.isEnabled === true ?
                      this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.ENABLE') :
                      this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.DISABLE');
                    this.scope.portModel.portAPI.update();
                  }
                });

                this.scope.$emit('change-device-port-state', {data: event.data});
            });
            break;
        }*/
      }
    };

    this.scope.onDeviceAPIReady = ($api) => {
      this.scope.deviceModel.deviceAPI = $api;
    };
/*
    this.scope.onPortApiReady = ($api) => {
      this.scope.portModel.portAPI = $api;
    };

    this.scope.onLinkApiReady = ($api) => {
      this.scope.linkModel.linkAPI = $api;
    };

    this.scope.onEndpointApiReady = ($api) => {
      this.scope.endpointModel.endpointAPI = $api;
    };*/

    this.scope.batchRemove = ($value) => {
      if ($value.length) {
        this.di.dialogService.createDialog('warning', this.translate('MODULES.SWITCHES.DIALOG.CONTENT.BATCH_DELETE_SWITCH'))
        //this.confirmDialog(this.translate('MODULES.SWITCHES.DIALOG.CONTENT.BATCH_DELETE_SWITCH'))
          .then((data) =>{
            this.batchDeleteDevices($value);
          }, (res) =>{
            this.di.$log.debug('delete switch dialog cancel');
          });
        /*switch (this.scope.tabSelected.type) {
          case 'device':
            this.confirmDialog(this.translate('MODULES.SWITCHES.DIALOG.CONTENT.BATCH_DELETE_SWITCH'))
              .then((data) =>{
                this.batchDeleteDevices($value);
              }, (res) =>{
                this.di.$log.debug('delete switch dialog cancel');
              });
            break;
          case 'endpoint':
            this.batchDeleteEndpoints($value);
            break
        }*/
      }
    };
    
    // add by yazhou.miao
    this.scope.addSwitch = () => {
      this.di.$rootScope.$emit('switch-wizard-show');
    }
    
    this.init();

    this.unsubscribers.push(this.di.$rootScope.$on('clickabletext', (event, params) => {
      //location path to device detail
      if (params && params.field === 'switch_name') {
        //this.di.$location.path('/devices/' + params.value).search({'id': params.object.id});
        this.di.$location.path('/devices/' + params.object.id);
      }
    }));
  
    // refresh the device list
    this.unsubscribers.push(this.di.$rootScope.$on('device-list-refresh', (event, params) => {
      this.scope.deviceModel.deviceAPI.queryUpdate();
    }));

    this.scope.$on('$destroy', () => {
      this.unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }

  init() {
    this.scope.deviceModel.deviceProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        let config_defer = this.di.$q.defer(),
            device_defer = this.di.$q.defer();

        this.di.deviceDataManager.getDeviceConfigs().then((configs)=>{
          config_defer.resolve(configs);
        });
        this.di.deviceDataManager.getDevices(params).then((res)=>{
          device_defer.resolve(res.data.devices);
        });
        this.di.$q.all([config_defer.promise, device_defer.promise]).then((arr) => {
          this.scope.configDevices = arr[0];
          this.scope.entities = [];
          this.scope.entities = this.getEntities(arr[0], arr[1]);
          let data = arr;
          defer.resolve({
            data: this.scope.entities
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.deviceService.getDeviceTableSchema(),
          index_name: 'mac',
          rowCheckboxSupport: true,
          rowActionsSupport: true
        };
      }
    });
   /* this.scope.portModel.portProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.deviceDataManager.getPorts(params).then((res) => {
          this.scope.entities = this.getEntities(res.data.ports);
          defer.resolve({
            data: this.scope.entities,
            count: res.data.total
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.deviceService.getPortTableSchema(),
          index_name: 'port_mac',
          rowCheckboxSupport: false,
          rowActionsSupport: true
        };
      }
    });
    this.scope.linkModel.linkProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.deviceDataManager.getLinks(params).then((res) => {
          defer.resolve({
            data: this.getEntities(res.data.links),
            count: res.data.total
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.deviceService.getLinkTableSchema(),
          index_name: 'id'
        };
      }
    });
    this.scope.endpointModel.endpointProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.deviceDataManager.getEndpoints(params).then((res) => {
          this.scope.entities = this.getEntities(res.data.hosts);
          defer.resolve({
            data: this.scope.entities,
            count: res.data.total
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.deviceService.getEndpointTableSchema(),
          index_name: 'id',
          rowCheckboxSupport: true,
          rowActionsSupport: true
        };
      }
    });
    this.scope.onTabChange(this.scope.tabs[0]);*/
  }

  getEntities(configDevices, originDevices) {
    let entities = [];
    configDevices.forEach((item) => {
      let obj = {};
      let origin = this.di._.find(originDevices, {'id': item.id});
      obj.id = item.id;
      obj.switch_name = item.name;
      obj.ip = item.mgmtIpAddress;
      obj.mac = item.mac;
      obj.type = item.type;
      obj.role = origin && origin.role || '-';
      obj.rack_id = origin && origin.rackId || '-';
      obj.available = item.available === true ? 'available' : 'unavailable';
      obj.protocol = item.protocol;
      obj.mfr = item.mfr || (origin &&origin.mfr);
      obj.serial = origin && origin.serial || '-';
      obj.hw = origin && origin.hw || '-';
      obj.sw = origin && origin.sw || '-';
      entities.push(obj);
    });

    originDevices.forEach((item) => {
      let origin = this.di._.find(entities, {'id': item.id});
      if (!origin) {
        let obj = {};
        obj.id = item.id;
        obj.switch_name = '-';
        obj.ip = item.annotations.managementAddress;
        obj.mac = item.mac;
        obj.type = 'unknown';
        obj.role = item.role;
        obj.rack_id = item.rackId;
        obj.available = item.available === true ? 'available' : 'unavailable';
        obj.protocol = item.annotations.protocol;
        obj.mfr = item.mfr;
        obj.serial = item.serial;
        obj.hw = item.hw;
        obj.sw = item.sw;
        entities.push(obj);
      }
    });
    return entities;
  }

  completedDetails(entities, details){
    this.di._.forEach(entities, (entity)=>{
      this.di._.forEach(details, (detail)=>{
        if(detail.id === entity.id){
          entity.role = detail.role;
          entity.chassisId = detail.chassisId;
          entity.serial = detail.serial;
          entity.hw = detail.hw;
          entity.sw = detail.sw;
        }
      })
    });
  }

  batchDeleteDevices(arr) {
    let deferredArr = [];
    arr.forEach((item) => {
      let defer = this.di.$q.defer();
      this.di.deviceDataManager.deleteDevice(item.id)
        .then(() => {
          defer.resolve();
        }, () => {
          defer.resolve();
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then(() => {
      this.scope.deviceModel.deviceAPI.queryUpdate();
    });

    this.scope.$emit('batch-delete-endpoints');
  }
}

DeviceController.$inject = DeviceController.getDI();
DeviceController.$$ngIsClass = true;