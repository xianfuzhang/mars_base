export class VlanController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$filter',
      '$q',
      '_',
      'deviceService',
      'roleService',
      'notificationService',
      'dialogService',
      'deviceDataManager',
      'tableProviderFactory'
    ];
  };
  constructor(...args) {
    this.di = {};
    VlanController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    let unsubscribers = [];
    scope.role = this.di.roleService.getRole();
    scope.tabSwitch = false;
    scope.tabSelected = null;
    scope.tabs = this.di.deviceService.getVlanTabSchema();
    scope.model = {
      provider: null,
      api: null,
      actionsShow: null,
      rowActions: null,
      entities: [],
    };

    scope.onTabChange = (tab) => {
      // if (tab && !this.scope.tabSwitch){
      //   this.scope.model.subRelayIps = null;
      //   this.scope.tabSelected = tab;
      //   this.scope.tabSwitch = true;
      //   this.prepareTableData();
      // }
      if (tab){
        this.scope.tabSelected = tab;
        this.prepareTableData();
      }
    };

    scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
        cb();
      });
    });

    this.init();
  }

  init() {
    //TODO:
    this.scope.onTabChange(this.scope.tabs[0]);
  }

  prepareTableData() {

    // TODO: ports group test
    this.scope.portsList = [
      {
        id: 1,
        title: 1,
        selected: false
      }, {
        id: 2,
        title: 2,
        selected: true
      }, {
        id: 3,
        title: 3,
        selected: true
      }, {
        id: 4,
        title: 4,
        selected: false
      }, {
        id: 5,
        title: 5,
        selected: true
      }, {
        id: 6,
        title: 6,
        selected: false
      }, {
        id: 7,
        title: 7,
        selected: false
      }, {
        id: 8,
        title: 8,
        selected: true
      }, {
        id: 9,
        title: 9,
        selected: false
      }, {
        id: 10,
        title: 10,
        selected: false
      }, {
        id: 11,
        title: 11,
        selected: false
      }, {
        id: 12,
        title: 12,
        selected: true
      }, {
        id: 13,
        title: 13,
        selected: false
      }, {
        id: 14,
        title: 14,
        selected: false
      }, {
        id: 15,
        title: 15,
        selected: true
      }, {
        id: 16,
        title: 16,
        selected: false
      }, {
        id: 17,
        title: 17,
        selected: false
      }, {
        id: 18,
        title: 18,
        selected: true
      }, {
        id: 19,
        title: 19,
        selected: false
      }, {
        id: 20,
        title: 20,
        selected: false
      }, {
        id: 21,
        title: 21,
        selected: true
      }, {
        id: 22,
        title: 22,
        selected: false
      }, {
        id: 23,
        title: 23,
        selected: true
      }, {
        id: 24,
        title: 24,
        selected: false
      }, {
        id: 25,
        title: 25,
        selected: false
      }, {
        id: 26,
        title: 26,
        selected: false
      }, {
        id: 27,
        title: 27,
        selected: true
      }, {
        id: 28,
        title: 28,
        selected: false
      }];

      setTimeout(() => {
        this.di.$rootScope.$emit('ports-selected', '1,3-25')
      }, 20 * 1000);
  }

  getEntities(params) {
    let defer = this.di.$q.defer();
    switch (this.scope.tabSelected.type) {
      case 'default':
        this.di.deviceDataManager.getDHCPRelayDefault().then((data) => {
          defer.resolve({'data': data});
        });
        break;
      case 'indirect':
        this.di.deviceDataManager.getDHCPRelayIndirect().then((data) => {
          defer.resolve({'data': data});
        });
        break;
      case 'interface':
        this.di.deviceDataManager.getDHCPRelayInterface().then((data) => {
          defer.resolve({'data': data});
        });
        break;
      case 'counter':
        this.di.deviceDataManager.getDHCPRelayCounters().then((data) => {
          defer.resolve({'data': data});
        });
        break;
    }
    return defer.promise;
  }

  formatSubTableValue(relayAgentIps){
    let entities = [];
    if(!relayAgentIps){
      return [];
    }
    let keys = Object.keys(relayAgentIps);
    keys.forEach((key) => {
      let agent = relayAgentIps[key];
      let obj = {};
      obj['device'] = this.getDeviceName(key);
      obj['ipv4'] = agent.ipv4 ? agent.ipv4 : null;
      obj['ipv6'] = agent.ipv6 ? agent.ipv6 : null;
      entities.push(obj)
    });
    return entities;
  }

  entityStandardization(entities) {
    this.scope.model.entities = [];
    switch (this.scope.tabSelected.type) {
      case 'default':
        entities.forEach((entity) => {
          let obj = {};
          obj['id'] = entity.dhcpServerConnectPoint;
          let pointArr = entity.dhcpServerConnectPoint.split('/');
          obj['point_device'] = pointArr[0];
          obj['point_port'] = pointArr[1];
          obj['dhcpServerConnectPoint'] = this.getDeviceName(pointArr[0]) + '/' + pointArr[1] ;
          obj['serverIps'] = Array.isArray(entity.serverIps)?entity.serverIps.join(', '):"";
          obj['gatewayIps'] = Array.isArray(entity.gatewayIps)?entity.gatewayIps.join(', '):"";
          obj['relayAgentIps'] = entity.relayAgentIps;
          this.scope.model.entities.push(obj);
        });
        break;
      case 'indirect':
        entities.forEach((entity) => {
          let obj = {};
          obj['id'] = entity.dhcpServerConnectPoint;
          let pointArr = entity.dhcpServerConnectPoint.split('/');
          obj['point_device'] = pointArr[0];
          obj['point_port'] = pointArr[1];
          obj['dhcpServerConnectPoint'] = this.getDeviceName(pointArr[0]) + '/' + pointArr[1] ;
          obj['serverIps'] = Array.isArray(entity.serverIps)?entity.serverIps.join(', '):"";
          obj['gatewayIps'] = Array.isArray(entity.gatewayIps)?entity.gatewayIps.join(', '):"";
          obj['relayAgentIps'] = entity.relayAgentIps;
          this.scope.model.entities.push(obj);
        });
        break;
      case 'interface':
        entities.forEach((entity) => {
          let obj = {};
          obj['id'] = entity.connectPoint;
          let pointArr = entity.connectPoint.split('/');
          obj['point_device'] = pointArr[0];
          obj['point_port'] = pointArr[1];
          obj['connectPoint'] = this.getDeviceName(pointArr[0]) + '/' + pointArr[1] ;
          obj['ip'] = entity.ip;
          obj['mac'] = entity.mac;
          let vlanArr = entity.vlan.split('/');
          obj['vlan_id'] = vlanArr[0];
          obj['vlan_type'] = vlanArr[1];
          obj['vlan'] = entity.vlan
          this.scope.model.entities.push(obj);
        });
        break;
      case 'counter':
        if(entities){
          entities.forEach((entity)=>{
            let obj = {};

            obj['host'] = entity.host;
            obj['location'] = this.getDeviceName(entity.location.deviceId) + '/' + entity.location.port;
            obj['id'] = obj['host'] + obj['location'];
            obj['solicit'] = entity.solicit;
            obj['request'] = entity.request;
            obj['advertise'] = entity.advertise;
            obj['renew'] = entity.renew;
            obj['reply'] = entity.reply;
            this.scope.model.entities.push(obj);
          });
        }

    }
  }

  getSchema() {
    let schema;
    switch(this.scope.tabSelected.type) {
      case 'default':
        schema = this.di.deviceService.getDHCPRelayDefaultTableSchema();
        break;
      case 'indirect':
        schema = this.di.deviceService.getDHCPRelayDefaultTableSchema();
        break;
      case 'interface':
        schema = this.di.deviceService.getDHCPRelayInterfaceTableSchema();
        break;
      case 'counter':
        schema = this.di.deviceService.getDHCPRelayCounterTableSubSchema();
        break;
    }
    return schema;
  }

  getActionsShow() {
    let actions;
    switch (this.scope.tabSelected.type) {
      case 'default':
        actions = this.di.deviceService.getDHCPRelayActionsShow();
        break;
      case 'indirect':
        actions = this.di.deviceService.getDHCPRelayActionsShow();
        break;
      case 'interface':
        actions = this.di.deviceService.getDHCPRelayActionsShow();
        break;
      case 'counter':
        actions = this.di.deviceService.getDHCPRelayCounterActionsShow();
        break;
    }

    return actions;
  }

  getRowActions() {
    let actions;
    switch (this.scope.tabSelected.type) {
      case 'default':
        actions = this.di.deviceService.getDHCPRelayTableRowActions();
        break;
      case 'indirect':
        actions = this.di.deviceService.getDHCPRelayTableRowActions();
        break;
      case 'interface':
        actions = this.di.deviceService.getDHCPRelayTableRowActions();
        break;
      case 'counter':
        actions = [];
        break;
    }

    return actions;
  }

  getDataType() {
    let schema = {};
    schema['authManage'] = {
      support: true,
      currentRole: this.scope.role
    };
    schema['index_name'] = 'id';
    if(this.scope.tabSelected.type === 'counter'){
      schema['rowActionsSupport'] = false;
      schema['rowCheckboxSupport'] = false;
    } else {
      schema['rowActionsSupport'] = true;
      schema['rowCheckboxSupport'] = true;
    }

    return schema;
  }

  getDeviceName(deviceId){
    let device =  this.di._.find(this.di.$scope.devices,{"id": deviceId});
    if(device) return device['name'];
    else return deviceId;
  }
}

VlanController.$inject = VlanController.getDI();
VlanController.$$ngIsClass = true;