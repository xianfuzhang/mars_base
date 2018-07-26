export class DeviceController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$location',
      '$log',
      '$q',
      '$filter',
      '$uibModal',
      'appService',
      'deviceService',
      'deviceDataManager',
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
        /*switch (this.scope.tabSelected.type) {
          case 'device':
            this.scope.deviceModel.deviceAPI.setSelectedRow(event.$data.mac);
            break;
          case 'port':
            this.scope.portModel.portAPI.setSelectedRow(event.$data.port_mac);
            break;
          case 'link':
            this.scope.linkModel.linkAPI.setSelectedRow(event.$data.id);
            break;
        }*/
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
          this.confirmDialog(this.translate('MODULES.SWITCHES.DIALOG.CONTENT.DELETE_SWITCH'))
            .then((data) =>{
              this.di.deviceDataManager.deleteDevice(event.data.id)
                .then((res) =>{
                  this.scope.deviceModel.deviceAPI.queryUpdate();
                });
            }, (res) =>{
              this.di.$log.debug('delete switch dialog cancel');
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

          case 'endpoint':
            let tenant = event.data.tenant_name, segment = event.data.segment_name, mac = event.data.mac;
            this.di.deviceDataManager.deleteEndpoint(tenant, segment, mac)
              .then((res) =>{
                this.scope.endpointModel.endpointAPI.queryUpdate();
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
        this.confirmDialog(this.translate('MODULES.SWITCHES.DIALOG.CONTENT.BATCH_DELETE_SWITCH'))
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
        this.di.deviceDataManager.getDevices(params).then((res) => {
          this.scope.entities = this.getEntities(res.data.devices);
          defer.resolve({
            data: this.scope.entities,
            count: res.data.total
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

  getEntities(origins) {
    let entities = [];
    if(!Array.isArray(origins)) return entities;
    //switch(this.scope.tabSelected.type) {
      //case 'device':
        origins.forEach((item) => {
          let obj = {};
          obj.id = item.id;
          obj.switch_name = item.annotations.name;
          obj.ip = item.annotations.ipaddress;
          obj.mac = item.mac;
          obj.type = item.type;
          obj.role = item.role;
          obj.rack_id = item.rack_id;
          obj.available = item.available;
          //obj.ports = item.ports.length;
          obj.chassisId = item.chassisId;
          obj.protocol = item.annotations.protocol;
          obj.mfr = item.mfr;
          obj.serial = item.serial;
          obj.hw = item.hw;
          obj.sw = item.sw;
          entities.push(obj);
        });
      //  break;
/*
      case 'port':
        origins.forEach((port) => {
          let obj = {};
          obj.element = port.element;
          obj.port_name = port.annotations.portName;
          obj.port_mac = port.annotations.portMac;
          obj.port_id = port.port;
          obj.link_status = port.annotations.linkStatus;
          obj.type = port.type;
          obj.speed = port.portSpeed;
          obj.device_name = port.device_name;
          obj.isEnabled = port.isEnabled;
          obj.port_status = port.isEnabled === true ?
            this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.ENABLE') :
            this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.DISABLE');
          entities.push(obj);
        });
        break;

      case 'link':
        origins.forEach((link) => {
          let obj = {};
          obj.id = link.src.device + '_' + link.src.port;
          obj.src_device = link.src.device;
          obj.src_port = link.src.port;
          obj.dst_device = link.dst.device;
          obj.dst_port = link.dst.port;
          obj.state = link.state;
          obj.type = link.type;
          obj.duration = link.annotations.durable;
          obj.protocol = link.annotations.protocol;
          obj.latency = link.annotations.latency;
          entities.push(obj);
        });
        break;

      case 'endpoint':
        origins.forEach((endpoint) => {
          let obj = {};
          obj.id = endpoint.id;
          obj.mac = endpoint.mac;
          obj.tenant_name = endpoint.tenant;
          obj.segment_name = endpoint.segment;
          obj.ip = endpoint.ip_addresses.join(" | ");
          let locals = [];
          endpoint.locations.forEach((location) => {
            locals.push(location.device_id + '/' + location.port);
          });
          obj.location = locals.join(" | ");
            entities.push(obj);
        });
        break;*/
    //}
    return entities;
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

  batchDeleteEndpoints(arr) {
    let deferredArr = [];
    arr.forEach((item) => {
      let defer = this.di.$q.defer();
      let tenant = item.tenant_name, segment = item.segment_name, mac = item.mac;
      this.di.deviceDataManager.deleteEndpoint(tenant, segment, mac)
        .then(() => {
          defer.resolve();
        }, () => {
          defer.resolve();
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then(() => {
      this.scope.endpointModel.endpointAPI.queryUpdate();
    });

    this.scope.$emit('batch-delete-endpoints');
  }

  confirmDialog(content) {
    let defer = this.di.$q.defer();
    this.di.$uibModal
      .open({
        template: require('../../../components/mdc/templates/dialog.html'),
        controller: 'dialogCtrl',
        backdrop: true,
        resolve: {
          dataModel: () => {
            return {
              type: 'warning',
              headerText: this.translate('MODULES.SWITCHES.DIALOG.HEADER'),
              contentText: content,
            };
          }
        }
      })
      .result.then((data) => {
        if(data) {
          defer.resolve(data);
        }
        else {
          defer.reject(null);
        }
    });

    return defer.promise;
  }
}

DeviceController.$inject = DeviceController.getDI();
DeviceController.$$ngIsClass = true;