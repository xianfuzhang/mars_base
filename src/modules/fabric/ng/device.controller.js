export class DeviceController {
  static getDI() {
    return [
      '$scope',
      '$log',
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
    DeviceController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.tabSelected = null;
    this.scope.tabs = this.di.deviceService.getTabSchema();
    this.scope.deviceModel = {
      actionsShow: this.di.deviceService.getDeviceActionsShow(),
      deviceProvider: null,
      deviceAPI: null
    };
    this.scope.portModel = {
      actionsShow: this.di.deviceService.getPortActionsShow(),
      portProvider: null,
      portAPI: null
    };
    this.scope.linkModel = {
      actionsShow: this.di.deviceService.getLinkActionsShow(),
      linkProvider: null,
      linkAPI: null
    };

    this.scope.onTabChange= (tab) => {
      this.di.$log.info(tab);
      if (tab){
        this.scope.tabSelected = tab;
      }
    };

    this.scope.onTableRowClick = (event) => {
      if (event.$data){
        switch (this.scope.tabSelected.type) {
          case 'device':
            this.scope.deviceModel.deviceAPI.setSelectedRow(event.$data.mac);
            break;
          case 'port':
            this.scope.portModel.portAPI.setSelectedRow(event.$data.port_mac);
            break;
        }
      }
    };

    this.scope.onDeviceAPIReady = ($api) => {
      this.scope.deviceModel.deviceAPI = $api;
    };

    this.scope.onPortApiReady = ($api) => {
      this.scope.portModel.portAPI = $api;
    };

    this.scope.onMenuClick = ($value, event) => {
      this.di.$log.info($value);
    };
    this.init();
  }

  init() {
    this.scope.deviceModel.deviceProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.deviceDataManager.getDevices(params).then((res) => {
          defer.resolve({
            data: this.getEntities(res.data.devices),
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
          rowActionsSupport: true,
          rowActions: this.di.deviceService.getDeviceTableRowActions(),
        };
      }
    });
    this.scope.portModel.portProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.deviceDataManager.getPorts(params).then((res) => {
          defer.resolve({
            data: this.getEntities(res.data.ports),
            count: res.data.total
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.deviceService.getPortTableSchema(),
          index_name: 'port_mac',
          rowCheckboxSupport: true,
          rowActionsSupport: true,
          rowActions: this.di.deviceService.getPortTableRowActions(),
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
          index_name: 'id',
          rowCheckboxSupport: false,
          rowActionsSupport: false,
          //rowActions: this.di.deviceService.getSwitchTableRowActions(),
        };
      }
    });
    this.scope.onTabChange(this.scope.tabs[0]);
  }

  getEntities(origins) {
    let entities = [];
    if(!Array.isArray(origins)) return entities;
    switch(this.scope.tabSelected.type) {
      case 'device':
        origins.forEach((item) => {
          let obj = {};
          obj.id = item.id;
          obj.switch_name = item.annotations.name;
          obj.ip = item.annotations.ipaddress;
          obj.mac = item.mac;
          obj.type = item.type;
          obj.role = item.role;
          obj.rack_id = item.rackId;
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
        break;

      case 'port':
        origins.forEach((port) => {
          let obj = {};
          obj.port_name = port.annotations.portName;
          obj.port_mac = port.annotations.portMac;
          obj.port_id = port.port;
          obj.link_status = port.annotations.linkStatus;
          obj.type = port.type;
          obj.speed = port.portSpeed;
          obj.device_name = port.device_name;
          obj.isEnabled = port.isEnabled;
          entities.push(obj);
        });
        break;

      case 'link':
        origins.forEach((link) => {
          let obj = {};
          obj.id = link.id;
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
        break;
    }
    return entities;
  }
}

DeviceController.$inject = DeviceController.getDI();
DeviceController.$$ngIsClass = true;