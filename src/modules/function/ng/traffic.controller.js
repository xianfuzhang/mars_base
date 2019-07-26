export class TrafficCtrl {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$q',
      '$filter',
      '$timeout',
      'roleService',
      '_',
      'dialogService',
      'notificationService',
      'snoopService',
      'deviceDataManager',
      'functionDataManager',
      'tableProviderFactory'
    ];
  }
  constructor(...args){
    this.di = {};
    TrafficCtrl.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.scope.model = {
      'actionsShow': this.di.snoopService.getTrafficSegmentTableActionsShow(),
      'rowActions': this.di.snoopService.getTrafficSegmentTableRowActions(),
      'provider': null,
      'deviceMap': {},
      'devicePortsMap': {},
      'trafficDevicePortsMap': {}, //保存traffic交换机，ports信息
     // 'deviceSessionsMap': {}
    };
    this.scope.role = this.di.roleService.getRole();

    this.scope.onAPIReady = ($api) => {
      this.scope.model.API = $api;
    };

    this.scope.addTrafficSegment = () => {
      let devicePortsMap = {};//angular.copy(this.scope.model.devicePortsMap);
      for (let key in this.scope.model.devicePortsMap) {
        devicePortsMap[key] = {
          'name': this.scope.model.deviceMap[key] || key,
          'ports': angular.copy(this.scope.model.devicePortsMap[key]),
        };
      }
      for (let key in this.scope.model.trafficDevicePortsMap) {
        if (devicePortsMap[key]) {
          this.scope.model.trafficDevicePortsMap[key].forEach((p) => {
            let index = devicePortsMap[key]['ports'].indexOf(p);
            if (index > -1) devicePortsMap[key]['ports'].splice(index, 1);
          });
          if (devicePortsMap[key]['ports'].length === 0) {
            delete devicePortsMap[key];
          }
        }
      }
      this.scope.$emit('traffic-segment-wizard-show', devicePortsMap);
    };

    this.scope.onTableRowClick = ($event) => {
      this.scope.model.API.setSelectedRow($event.$data.id);
    };

    this.scope.onTableRowSelectAction = (event) => {

    };

    //获取交换机以及端口数信息
    this.di.deviceDataManager.getPorts().then((res) => {
      res.data.ports.forEach((port) => {
        if (!this.scope.model.devicePortsMap.hasOwnProperty(port.element)) {
          this.scope.model.devicePortsMap[port.element] = [];
        }
        this.scope.model.devicePortsMap[port.element].push(parseInt(port.port));
      });
    });
    this.init();
    let unsubscribes = [];
    unsubscribes.push(this.di.$rootScope.$on('traffic-segment-list-refresh', () => {
      this.scope.model.API.queryUpdate();
    }));
    this.scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => cb());
    });
  }

  init() {
    this.scope.model.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer(), 
            deviceConfig = this.di.$q.defer(),
            trafficDefer = this.di.$q.defer();
        this.di.deviceDataManager.getDeviceConfigs().then((devices)=>{
          devices.forEach((device) => {
            this.scope.model.deviceMap[device.id]  = device.name;
          });
          deviceConfig.resolve(null)
        });
        this.di.functionDataManager.getTrafficSegmentList().then((sessions)=>{
          trafficDefer.resolve(sessions);
        });
        this.di.$q.all([deviceConfig.promise, trafficDefer.promise]).then((arr) => {
          this.scope.entities = this.getEntities(arr[1]);
          defer.resolve({
            data: this.scope.entities
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.snoopService.getTrafficSegmentTableSchema(),
          index_name: 'id',
          rowCheckboxSupport: true,
          rowActionsSupport: true,
          authManage: {
            support: true,
            currentRole: this.scope.role
          }
        };
      }
    });
  }

  getEntities(sessions) {
    let result = [];
    sessions.forEach((session) => {
      if (!this.scope.model.trafficDevicePortsMap.hasOwnProperty(session['deviceId'])) {
        this.scope.model.trafficDevicePortsMap[session['deviceId']] = [];
      }
      this.scope.model.trafficDevicePortsMap[session['deviceId']] = this.scope.model.trafficDevicePortsMap[session['deviceId']].concat(
        session['uplinks'], session['downlinks']);
      result.push({
        'device_id': session['deviceId'],
        'device_name': this.scope.model.deviceMap[session['deviceId']] || session['deviceId'],
        'exclude_vlans': session['excludeVlans'] ? session['excludeVlans'].toString() : '-',
        'up_links': session['uplinks'].toString(),
        'down_links': session['downlinks'].toString()
      });
      /* if (!this.scope.model.deviceSessionsMap.hasOwnProperty(session['deviceId'])) {
        this.scope.model.deviceSessionsMap[session['deviceId']] = [];
      }
      this.scope.model.deviceSessionsMap[session['deviceId']].push(session.sessionId); */
    });
    return result;
  }
}
TrafficCtrl.$inject = TrafficCtrl.getDI();
TrafficCtrl.$$ngIsClass = true;