export class EndPointController {
  static getDI() {
    return [
      '$scope',
      '$q',
      '$filter',
      'appService',
      'deviceService',
      'deviceDataManager',
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
      //rowActions: this.di.deviceService.getEndpointTableRowActions(),
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
    
    // add by yazhou.miao
    /*this.scope.addSwitch = () => {
      this.di.$rootScope.$emit('switch-wizard-show');
    }*/
    this.init();
    this.scope.$on('$destroy', () => {
    });
  }

  init() {
    this.scope.endpointModel.endpointProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
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
          rowCheckboxSupport: false,
          rowActionsSupport: false
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
      obj.tenant_name = endpoint.tenant;
      obj.segment_name = endpoint.segment;
      obj.ip = endpoint.ip_addresses.join(" | ");
      let locals = [];
      endpoint.locations.forEach((location) => {
        locals.push((this.scope.deviceObjects[location.device_id]||location.device_id) + '/' + location.port);
      });
      obj.location = locals.join(" | ");
        entities.push(obj);
    });
    return entities;
  }

/*  batchDeleteEndpoints(arr) {
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
  }*/
}

EndPointController.$inject = EndPointController.getDI();
EndPointController.$$ngIsClass = true;