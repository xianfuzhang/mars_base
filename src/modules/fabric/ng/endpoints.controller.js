export class EndPointController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$q',
      '$filter',
      '_',
      'appService',
      'deviceService',
      'dialogService',
      'notificationService',
      'deviceDataManager',
      'modalManager',
      'tableProviderFactory'
    ];
  }

  constructor(...args){
    this.di = {};
    EndPointController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.page_title = this.translate('MODULES.SWITCHES.TAB.SCHEMA.ENDPOINT');
    this.scope.deviceObjects = {}; //id: name
    this.scope.entities = [];
    this.scope.endpointModel = {
      actionsShow: this.di.deviceService.getEndpointActionsShow(),
      rowActions: this.di.deviceService.getEndpointTableRowActions(),
      endpointProvider: null,
      API: null
    };

    this.scope.onTableRowClick = (event) => {
      if (event.$data){
        this.scope.endpointModel.API.setSelectedRow(event.$data.mac);
      }
    };

    this.scope.onEndpointApiReady = ($api) => {
      this.scope.endpointModel.API = $api;
    };
    
    this.scope.onTableRowSelectAction = (event) => {
      if (!event.action) return;
      if (event.action.value === 'intent') {
         this.di.$rootScope.$emit('create-intent-show', {srcEndpoint: event.data.mac, endpoints: this.scope.entities});
      }
      else if (event.action.value === 'delete') {
        this.di.deviceDataManager.deleteEndpoint(event.data.mac, event.data.segment_name).then(
          () => {
            this.scope.endpointModel.API.queryUpdate();
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
    };

    this.scope.batchRemove = ($value) => {
      if ($value.length) {
        this.di.dialogService.createDialog('warning', this.translate('MODULES.ENDPOINT.DIALOG.CONTENT.BATCH_DELETE'))
          .then(() =>{
            this.batchDeleteEndpoints($value);
          }, () =>{
            this.di.$log.debug('delete switch dialog cancel');
        });
      }    
    };

    this.scope.addEndpoint = () => {
      let devices = [];
      this.di._.forEach(this.scope.deviceObjects, (value, key) => {
        devices.push({'label': value, 'value': key});
      });
      if (!devices.length) {
        this.scope.alert = {
          type: 'warning',
          msg: this.translate('MODULES.ENDPOINT.CREATE.WARNING.NO_DEVICE')
        }
        this.di.notificationService.render(this.scope);
        return;
      }
      this.di.modalManager.open({
          template: require('../components/createEndpoint/template/createEndpoint.html'),
          controller: 'createEndpointCtrl',
          windowClass: 'create-endpoint-modal',
          resolve: {
            dataModel: () => {
              return {
                devices: devices
              };
            }
          }
        })
        .result.then((data) => {
        if (data && !data.canceled) {
          this.di.deviceDataManager.createEndpoint(data.result).then(
            () => {
              this.scope.endpointModel.API.queryUpdate();
            },
            (msg) => {
              this.scope.alert = {
                type: 'warning',
                msg: msg
              }
              this.di.notificationService.render(this.scope);
            }
          )
        }
      });
    };

    this.init();

    let unsubscribers = [];
    unsubscribers.push(this.di.$rootScope.$on('intent-list-refresh', (event) => {
      this.scope.endpointModel.API.queryUpdate();
    }));
    this.scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }

  init() {
    this.scope.endpointModel.endpointProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.scope.deviceObjects = {};
        this.di.deviceDataManager.getDeviceConfigs().then((devices)=> {
          if (devices) {
            devices.forEach((device) => {
              this.scope.deviceObjects[device.id] = device.name;
            });
          }
          this.di.deviceDataManager.getEndpoints(params).then((res) => {
            this.scope.entities = this.getEntities(res.data.hosts);
            defer.resolve({
              data: this.scope.entities,
              count: res.data.total
            });
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.deviceService.getEndpointTableSchema(),
          index_name: 'mac',
          rowCheckboxSupport: true,
          rowActionsSupport: true
        };
      }
    });
  }

  getEntities(origins) {
    let entities = [];
    if(!Array.isArray(origins)) return entities;
    origins.forEach((endpoint) => {
      let obj = {};
      obj.id = endpoint.id;
      obj.mac = endpoint.mac;
      //obj.tenant_name = endpoint.tenant;
      obj.segment_name = endpoint.segment || endpoint.vlan;
      obj.ip = (endpoint.ip_addresses && endpoint.ip_addresses.join(" | ")) 
              || (endpoint.ipAddresses && endpoint.ipAddresses.join(" | "));
      let locals = [];
      endpoint.locations.forEach((location) => {
        let device_name = (location.device_id && this.scope.deviceObjects[location.device_id]) 
                        || (location.elementId && this.scope.deviceObjects[location.elementId]);
        locals.push(device_name + '/' + location.port);
      });
      obj.location = locals.join(" | ");
        entities.push(obj);
    });
    return entities;
  }

  batchDeleteEndpoints(arr) {
    let deferredArr = [];
    arr.forEach((item) => {
      let defer = this.di.$q.defer();
      let segment = item.segment_name, mac = item.mac;
      this.di.deviceDataManager.deleteEndpoint(mac, segment)
        .then(() => {
          defer.resolve();
        }, () => {
          defer.resolve();
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then(() => {
      this.scope.endpointModel.API.queryUpdate();
    });

    this.scope.$emit('batch-delete-endpoints');
  }
}

EndPointController.$inject = EndPointController.getDI();
EndPointController.$$ngIsClass = true;