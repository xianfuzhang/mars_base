export class sFlowsController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$q',
      '$filter',
      'roleService',
      '_',
      'deviceDetailService',
      'dialogService',
      'notificationService',
      'deviceDataManager',
      'modalManager',
      'tableProviderFactory'
    ];
  }
  constructor(...args){
    this.di = {};
    sFlowsController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.types = {
      'HostToHostIntent': this.translate('MODULES.FABRIC.INTENT.HOST_TYPE'), 
      'PointToPointIntent': this.translate('MODULES.FABRIC.INTENT.POINT_TYPE')
    };
    this.scope.devices = [];
    this.scope.model = {
      'actionsShow':  this.di.deviceDetailService.getSFlowActionsShow(),
      'rowActions': this.di.deviceDetailService.getSFlowTableRowActions(),
      'provider': null
    };
    this.scope.role = this.di.roleService.getRole();

    this.scope.onAPIReady = ($api) => {
      this.scope.model.API = $api;
    };

    this.scope.addFlow = () => {
      let portsDefer = this.di.$q.defer(), devicesDefer = this.di.$q.defer();
      this.di.deviceDataManager.getPorts().then((res) => {
        portsDefer.resolve(res.data.ports);
      });
      this.di.deviceDataManager.getDeviceConfigs().then((devices)=> {
        devicesDefer.resolve(devices);
      });
      this.di.$q.all([devicesDefer.promise, portsDefer.promise]).then((arr) => {
        let  filterDevices = this.filterSflowDevices(arr[0]);
        if (filterDevices.length === 0) {
          this.scope.alert = {
            type: 'warning',
            msg: this.translate('MODULES.SWITCH.SFLOW.NO_AVAILABLE_DEVICE')
          }
          this.di.notificationService.render(this.scope);
          return;
        }
        filterDevices.forEach((device) => {
          if (!device.hasOwnProperty('ports')) {
            device['ports'] = [];
          }
          arr[1].forEach((port) => {
            if (port.element === device.id) {
              device['ports'].push(parseInt(port.port));
            }
          });
          device['ports'].sort((a, b) => a - b);
        });
        this.scope.$emit('sflow-wizard-show', {'devices': filterDevices});
      });
    };

    this.scope.batchRemove = ($value) => {
      if (!$value.length) return;
      this.di.dialogService.createDialog('warning', this.translate('MODULES.SWITCH.FLOW.DIALOG.CONTENT.BATCH_DELETE_FLOWS'))
      .then(() =>{
        this.batchDeleteFlows($value);
      }, () => {
        this.scope.model.API.queryUpdate();
      });
    };

    this.scope.onTableRowSelectAction = ($event) => {
      if (!$event.action || !$event.data) return;
      if ($event.action.value === 'delete') {
        this.di.deviceDataManager.deleteSFlowByDeviceId($event.data.device_id).then(
          () => {
            this.scope.alert = {
              type: 'success',
              msg: this.translate('MODULES.SWITCH.SFLOW.DELETE.SUCCESS')
            }
            this.di.notificationService.render(this.scope);
            this.scope.model.API.queryUpdate();
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

    this.scope.onTableRowClick = ($event) => {
      this.scope.model.API.setSelectedRow($event.$data.id);
    };

    this.init();

    let unsubscribers = [];
    unsubscribers.push(this.di.$rootScope.$on('sflow-list-refresh', () => {
      this.scope.model.API.queryUpdate();
    }));

    this.scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }

  init() {
    this.scope.model.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.deviceDataManager.getDeviceConfigs().then((configs)=>{
          this.scope.devices = configs;
          this.di.deviceDataManager.getAllSFlows(params).then((data) => {
            this.scope.entities = this.getEntities(data);
              defer.resolve({
                data: this.scope.entities
            });
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.deviceDetailService.getDeviceSFlowsSchema(),
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

  getEntities(data) {
    let entities = [];

    data.forEach((item) => {
      let obj = {}, device = this.scope.devices.find(device => item.device_id === device.id);
      obj.id = item.device_id + ':' + item.collector_ip;
      obj.device = device && device.name || item.device_id;
      obj.device_id = item.device_id;
      obj.port = item.ports.length === 0 ? '-' : item.ports.join(',');
      obj.ip = item.collector_ip;
      obj.payload = item.max_payload_length;
      obj.header = item.max_header_length;
      obj.interval = item.polling_interval;
      obj.rate = item.sample_rate;
      obj.duration = item.duration === 0 ? this.translate('MODULES.SWITCH.DETAIL.FLOW.DURATION.ALWAYS') : item.duration;
      entities.push(obj);
    });
    return entities;
  }

  batchDeleteFlows(flows) {
    let deferredArr = [];
    flows.forEach((item) => {
      let defer = this.di.$q.defer();
      this.di.deviceDataManager.deleteSFlowByDeviceId(item.device_id)
        .then(() => {
          defer.resolve();
        }, (msg) => {
          defer.reject(msg);
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then(() => {
      this.scope.alert = {
        type: 'success',
        msg: this.translate('MODULES.SWITCH.SFLOW.BATCH.DELETE.SUCCESS')
      }
      this.di.notificationService.render(this.scope);
      this.scope.model.API.queryUpdate();
    }, (msg) => {
      this.scope.alert = {
        type: 'warning',
        msg: msg
      }
      this.di.notificationService.render(this.scope);
      this.scope.model.API.queryUpdate();
    });
  }

  filterSflowDevices(devices) {
    let result = [];

    devices.forEach((device) => {
      let exist = this.scope.entities.find(item => item.device_id === device.id);
      if (!exist) result.push(device);
    });
    return result;
  }
}

sFlowsController.$inject = sFlowsController.getDI();
sFlowsController.$$ngIsClass = true;