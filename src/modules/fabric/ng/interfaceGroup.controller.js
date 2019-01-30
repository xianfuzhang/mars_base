export class InterfaceGroupController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$filter',
      '$q',
      '_',
      'roleService',
      'deviceService',
      'notificationService',
      'dialogService',
      'deviceDataManager',
      'tableProviderFactory'
    ];
  }
  constructor(...args){
    this.di = {};
    InterfaceGroupController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.role = this.di.roleService.getRole();
    this.scope.selectedLogicalPort = null;
    this.scope.entities = [];
    this.scope.model = {
      'actionsShow':  this.di.deviceService.getLogicalPortActionsShow(),
      'rowActions': this.di.deviceService.getLogicalPortTableRowActions(),
      'provider': null
    };
    this.scope.memberModel = {
      'provider': null
    };

    this.initActions();
    this.scope.model.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer(), portsDefer = this.di.$q.defer(), logicalDefer = this.di.$q.defer();
        this.di.deviceDataManager.getPorts().then((res) => {
          portsDefer.resolve(res.data.ports);
        });
        this.di.deviceDataManager.getLogicalPortsList().then((ports)=>{
          logicalDefer.resolve(ports);
        });
        this.di.$q.all([portsDefer.promise, logicalDefer.promise]).then((arr) => {
          this.transformPortsState(arr[0]);
          this.scope.entities = this.getEntities(arr[1]);
          defer.resolve({
            data: this.scope.entities
          });
          this.selectEntity();
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.deviceService.getLogicalPortTableSchema(),
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

    this.scope.$on('port-selected', (event, params) => {
      this.scope.selectedLogicalPort = params.port;
      this.scope.model.API.setSelectedRow(params.port.name);
      this.portMembersQuery();
    });

    let unsubscribers = [];
    unsubscribers.push(this.di.$rootScope.$on('trunk-list-refresh', () => {
      this.scope.model.API.queryUpdate();
    }));

    this.scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }

  initActions() {
    this.scope.onAPIReady = ($api) => {
      this.scope.model.API = $api;
    };

    this.scope.onMemberApiReady = ($api) =>{
      this.scope.memberModel.API = $api;
    };

    this.scope.onTableRowClick = ($event) => {
      this.scope.selectedLogicalPort = $event.$data;
      this.scope.model.API.setSelectedRow($event.$data.id);
      this.portMembersQuery();
    };

    this.scope.onTableRowSelectAction = ($event) => {
      if (!$event.action || !$event.data) return;
      if ($event.action.value === 'edit') {
        this.getAvailableMemberDevices().then((result) => {
          this.scope.$emit('trunk-wizard-show', {
            'edit': true, 
            'trunk': $event.data,
            'availableDevices': result.availableDevices
          });
        }, () => {
          this.scope.alert = {
            type: 'warning',
            msg: this.translate('MODULES.PORT.MEMBERS.NO_AVAILABLE_DEVICES')
          }
          this.di.notificationService.render(this.scope);
        });
      }
      else if ($event.action.value === 'delete') {
        this.di.deviceDataManager.deleteLogicalPort($event.data.name).then(() => {
          this.scope.alert = {
            type: 'success',
            msg: this.translate('MODULES.PORT.DELETE.SUCCESS')
          }
          this.di.notificationService.render(this.scope);
          this.scope.model.API.queryUpdate();
        }, (msg) => {
          this.scope.alert = {
            type: 'warning',
            msg: msg
          }
          this.di.notificationService.render(this.scope);
        }); 
      }
    };

    this.scope.addLogicalPort = () => {
      this.getAvailableMemberDevices().then((result) => {
        this.scope.$emit('trunk-wizard-show', {
          'edit': false, 
          'availableDevices': result.availableDevices,
          'leafGroups': result.leafGroups
          //'deviceMapping': result.deviceMapping
        });
      }, () => {
        this.scope.alert = {
          type: 'warning',
          msg: this.translate('MODULES.PORT.MEMBERS.NO_AVAILABLE_DEVICES')
        }
        this.di.notificationService.render(this.scope);
      });
    };

    this.scope.batchRemove = ($value) => {
      if (!$value.length) return;
      this.di.dialogService.createDialog('warning', this.translate('MODULES.PORT.DIALOG.BATCH.DELETE.WARNING'))
      .then(() =>{
          this.batchDeleteLogicalPorts($value);
        }, () => {
          this.scope.model.API.queryUpdate();
        });
    };
  }

  getEntities(ports) {
    let arr = [];
    ports.forEach((item) => {
      let obj = {};
      obj['id'] = item.name;
      obj['name'] = item.name;
      obj['mlag'] = item.is_mlag ? this.translate('MODULES.PORT.MLAG.ENABLE') : this.translate('MODULES.PORT.MLAG.DISABLE');
      obj['group'] = item.group;
      obj['members'] = item.members;
      obj['state'] = this.getLogicalPortState(item.members);
      obj['member_count'] = item.members.length;
      arr.push(obj);
    });
    return arr;
  }

  selectEntity() {
    if (this.scope.entities.length === 0) {
      this.scope.selectedLogicalPort = null;
      return;
    }
    this.scope.$emit('port-selected', {
      port: this.scope.entities[0]
    });
  }

  portMembersQuery() {
    if (!this.scope.initPortMembers) {
      this.scope.memberModel.provider = this.di.tableProviderFactory.createProvider({
        query: (params) => {
          let defer = this.di.$q.defer();
          let members =  this.scope.selectedLogicalPort.members;
          if (members.length === 0) {
            defer.resolve({
              data: []
            });
          }
          else {
            let deferArr = [], memberDevices = [];
            members.forEach((member) => {
              memberDevices.includes(member.device_id) ? null : memberDevices.push(member.device_id);
            });
            memberDevices.forEach((device_id) => {
              let deviceDefer = this.di.$q.defer(), portsDefer = this.di.$q.defer();
              this.di.deviceDataManager.getDeviceConfig(device_id).then((device) => {
                deviceDefer.resolve({
                  'device_id': device_id,
                  'device_name': device && device.name || device_id
                });
              });
              this.di.deviceDataManager.getDevicePorts(device_id).then((res) => {
                portsDefer.resolve({
                  'device_id': device_id,
                  'ports': res.data.ports
                });
              });
              deferArr.push(deviceDefer.promise);
              deferArr.push(portsDefer.promise);
            });
            
            this.di.$q.all(deferArr).then((arr) => {
              //let deviceName = arr[0], ports = arr[1] ,member_ports = [], result = [];
              let result = [];
              members.forEach((member) => {
                //member_ports.push(member.port);
                let device_name_ports = arr.filter(item => member.device_id === item.device_id);
                if (device_name_ports.length === 2) {
                  let port = device_name_ports[1]['ports'].find(port => parseInt(port.port) === member.port);
                  result.push({
                    'device': device_name_ports[0]['device_name'],
                    'port': port && port.port || member.port,
                    'status': port && port.annotations.linkStatus === 'UP' ? 'available' : 'unavailable'
                  });
                }
                else {
                  result.push({
                    'device': member.device_id,
                    'port': member.port,
                    'status': 'unavailable'
                  });
                }
              });
              
              defer.resolve({
                data: result
              });
            });
          }
          return defer.promise;
        },
        getSchema: () => {
          return {
            schema: this.di.deviceService.getLogicalPortMembersTableSchema(),
          };
        }
      });
      this.scope.initPortMembers = true;
    }
    else {
      this.scope.memberModel.API.queryUpdate();
    }
  }

  batchDeleteLogicalPorts(ports) {
    let deferredArr = [];
    ports.forEach((item) => {
      let defer = this.di.$q.defer();
      this.di.deviceDataManager.deleteLogicalPort(item.name)
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
        msg: this.translate('MODULES.PORT.BATCH.DELETE.SUCCESS')
      }
      this.di.notificationService.render(this.scope);
    }, (msg) => {
      this.scope.alert = {
        type: 'warning',
        msg: msg
      }
      this.di.notificationService.render(this.scope);
    })
    .finally(() => {
      this.scope.model.API.queryUpdate();
    });
  }

  getAvailableMemberDevices() {
    let defer = this.di.$q.defer(),
      deviceDefer = this.di.$q.defer(), portDefer = this.di.$q.defer(), mappingDefer = this.di.$q.defer();
    this.di.deviceDataManager.getDeviceConfigs().then((devices) => {  
      deviceDefer.resolve(devices);
    });
    this.di.deviceDataManager.getPorts().then((res) => {
      portDefer.resolve(res.data.ports);
    });
    this.di.deviceDataManager.getLogicalPortMapping().then((ports) => {
      mappingDefer.resolve(ports);
    });

    let availableDevices = [], logicalMapping = [], leafGroups = {};
    this.di.$q.all([deviceDefer.promise, portDefer.promise, mappingDefer.promise]).then((arr) => {
      logicalMapping = arr[2];
      arr[0].forEach((device) => {
        if (device['leafGroup']['name']) {
          if (!leafGroups.hasOwnProperty(device['leafGroup']['name'])) {
            leafGroups[device.leafGroup.name] = [];
          }  
          leafGroups[device.leafGroup.name].push({
            'device_id': device.id,
            'port': device.leafGroup.switch_port
          });
        }
        let ports = [];
        arr[1].forEach((port) => {
          if (port.element === device.id) {
            ports.push(parseInt(port.port));
          }
        });
        availableDevices.push({
          'id': device.id, 
          'name': device.name,
          'protocol': device.protocol,
          'ports': ports,
          'groups': []
        });
      });
    })
    .finally(() => {
      let deviceMapping = {};
      logicalMapping.forEach((item) => {
        if (deviceMapping.hasOwnProperty(item.device_id)) {
          deviceMapping[item.device_id]['ports'].push(item.port);
          deviceMapping[item.device_id]['groups'].includes(item.group) ? null :
            deviceMapping[item.device_id]['groups'].push(item.group);
        } 
        else {
          deviceMapping[item.device_id] = {
            'id': item.device_id,
            'groups': [item.group],
            'ports': [item.port]
          };
        } 
      });
      availableDevices.forEach((device) => {
        if (!deviceMapping.hasOwnProperty(device.id)) {
          let i = 1;
          while (i <= 26) {
            device.groups.push(i);
            i++;
          }
        }
        else if (deviceMapping.hasOwnProperty(device.id)) {
          let i = 1, j = 0;
          while (i <= 26) {
            deviceMapping[device.id]['groups'].includes(i) ? null : device.groups.push(i);
            i++;
          }
          while (j < deviceMapping[device.id]['ports'].length) {
            let index = device.ports.indexOf(deviceMapping[device.id]['ports'][j]);
            if (index > -1) device.ports.splice(index, 1);
            j++;
          }
        }
      });
      let arr = this.di._.filter(availableDevices, (item) => {
        return item.groups.length > 0 && item.ports.length > 0;
      });
      availableDevices = arr;
      availableDevices.length > 0 ? 
        defer.resolve({
          'availableDevices': availableDevices, 
          'deviceMapping': deviceMapping,
          'leafGroups': leafGroups
        }) : defer.reject(null);
    });
    return defer.promise;
  }

  transformPortsState(ports) {
    this.scope.ports = {};
    ports.forEach((port) => {
      let key = port.element + ':' + port.port;
      this.scope.ports[key] = port.annotations.linkStatus;
    });
  }

  getLogicalPortState(members) {
    let state = 'Down';
    for(let i=0; i< members.length; i++) {
      let key = members[i]['device_id'] + ':' + members[i]['port'];
      if (this.scope.ports.hasOwnProperty(key) && this.scope.ports[key] === 'UP') {
        state = 'Up';
        break;
      }
    }  
    return state;
  }
}

InterfaceGroupController.$inject = InterfaceGroupController.getDI();
InterfaceGroupController.$$ngIsClass = true;