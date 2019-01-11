export class InterfaceGroupController {
  static getDI() {
    return [
      '$scope',
      '$filter',
      '$q',
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
        let defer = this.di.$q.defer();
        this.di.deviceDataManager.getLogicalPortsList().then((ports)=>{
          this.scope.entities = this.getEntities(ports);
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
        this.scope.$emit('trunk-wizard-show', {'edit': true});
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
      this.scope.$emit('trunk-wizard-show', {});
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

  getEntities(entities)  {
    let arr = [];
    entities.forEach((item) => {
      let obj = {};
      obj['id'] = item.name;
      obj['name'] = item.name;
      obj['group'] = item.group;
      obj['members'] = item.members;
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
            let deviceDefer = this.di.$q.defer(), portsDefer = this.di.$q.defer();
            this.di.deviceDataManager.getDeviceConfig(members[0]['device_id']).then((device) => {
              deviceDefer.resolve(device && device.name || members[0]['device_id']);
            });
            this.di.deviceDataManager.getDevicePorts(members[0]['device_id']).then((res) => {
              portsDefer.resolve(res.data.ports);
            });
            this.di.$q.all([deviceDefer.promise, portsDefer.promise]).then((arr) => {
              let deviceName = arr[0], ports = arr[1] ,member_ports = [], result = [];
              members.forEach((member) => {
                member_ports.push(member.port);
              });
              ports.forEach((port) => {
                if (member_ports.includes(parseInt(port.port))) {
                  result.push({
                    'device': deviceName,
                    'port': port.port,
                    'status': port.isEnabled ? 'available' : 'unavailable'
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
}

InterfaceGroupController.$inject = InterfaceGroupController.getDI();
InterfaceGroupController.$$ngIsClass = true;