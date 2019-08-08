export class DynamicVlanController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '_',
      '$filter',
      '$q',
      '$log',
      '$location',
      'roleService',
      'dialogService',
      'appService',
      'notificationService',
      'tableProviderFactory',
      'vlanDataManager',
      'deviceDataManager',
      'vlanService'
    ];
  }

  constructor(...args) {
    this.di = {};
    DynamicVlanController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unSubscribers = [];
    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    scope.role = this.di.roleService.getRole();
    this.CONST = {};
    this.CONST.ENABLE = 'enable';
    this.CONST.DISABLE = 'disable';


    scope.dynamicModel = {
      actionsShow: {
        'menu': {'enable': false, 'role': 2},
        'add': {'enable': false, 'role': 2},
        'remove': {'enable': false, 'role': 2},
        'refresh': {'enable': true, 'role': 2},
        'search': {'enable': true, 'role': 2}
      },
      rowActions: [
        {
          'label': this.translate('MODULES.VLAN.DYNAMIC.MENU.ACTIVE'),
          'role': 2,
          'value': 'active'
        },
        {
          'label': this.translate('MODULES.VLAN.DYNAMIC.MENU.DEACTIVE'),
          'role': 2,
          'value': 'deactive'
        }
      ],
      tableProvider: null,
      api: null
    };

    scope.onTableRowClick = (event) => {
      if (event.$data) {
        scope.dynamicModel.api.setSelectedRow(event.$data.uuid);
      }
    };


    scope.onAPIReady = ($api) => {
      scope.dynamicModel.api = $api;
    };

    this.init();

    scope.addVlanIp = () => {
      this.di.$rootScope.$emit('vlan-ip-wizard-show');
    };

    scope.batchEnable = () => {
      let selectedRows = scope.dynamicModel.api.getSelectedRows();
      if (selectedRows.length === 0) {
        return;
      }
      let postData = [];
      selectedRows.forEach(row => {
        let deviceData = postData.find(d=>{return d['device-id'] === row.device_id});
        if(!deviceData){
          postData.push({'device-id': row.device_id, 'dynamicvlans':[]})
          deviceData = postData.find(d=>{return d['device-id'] === row.device_id});
        };
        deviceData['dynamicvlans'].push({
          'port': parseInt(row.port),
          'dynamicVlan': this.CONST.ENABLE
        })
      });
      this.di.dialogService.createDialog('warning', this.translate('MODULES.VLAN.DYNAMIC.DIALOG.MESSAGE.BATCH_ACTIVE_CONFIRM'))
        .then((data) => {
          this.di.vlanDataManager.postVlanDynamic({'devices': postData})
            .then((res) => {
              this.di.notificationService.renderSuccess(scope, this.translate('MODULES.VLAN.DYNAMIC.DIALOG.MESSAGE.BATCH_ACTIVE_CONFIRM_SUCCESS'));
              scope.dynamicModel.api.resetSelectedRows();
              scope.dynamicModel.api.queryUpdate();
            }, (error) => {
              this.di.notificationService.renderWarning(scope, error)
            });
        }, (res) => {
          this.di.$log.debug('delete vlan ip mask dialog cancel');
        });
    }

    scope.batchDisable = () => {
      let selectedRows = scope.dynamicModel.api.getSelectedRows();
      if (selectedRows.length === 0) {
        return;
      }
      let postData = [];
      selectedRows.forEach(row => {
        let deviceData = postData.find(d=>{return d['device-id'] === row.device_id});
        if(!deviceData){
          postData.push({'device-id': row.device_id, 'dynamicvlans':[]})
          deviceData = postData.find(d=>{return d['device-id'] === row.device_id});
        };
        deviceData['dynamicvlans'].push({
          'port': parseInt(row.port),
          'dynamicVlan': this.CONST.DISABLE
        })
      });
      this.di.dialogService.createDialog('warning', this.translate('MODULES.VLAN.DYNAMIC.DIALOG.MESSAGE.BATCH_DEACTIVE_CONFIRM'))
        .then((data) => {
          this.di.vlanDataManager.postVlanDynamic({'devices': postData})
            .then((res) => {
              this.di.notificationService.renderSuccess(scope, this.translate('MODULES.VLAN.DYNAMIC.DIALOG.MESSAGE.BATCH_DEACTIVE_CONFIRM_SUCCESS'));
              scope.dynamicModel.api.resetSelectedRows();
              scope.dynamicModel.api.queryUpdate();
            }, (error) => {
              this.di.notificationService.renderWarning(scope, error)
            });
        }, (res) => {
          this.di.$log.debug('delete vlan ip mask dialog cancel');
        });
    }

    scope.onTableRowSelectAction = (event) => {
      if (event.data && event.action) {
        if (event.action.value === 'deactive') {
          this.di.dialogService.createDialog('warning', this.translate('MODULES.VLAN.DYNAMIC.DIALOG.MESSAGE.DEACTIVE_CONFIRM'))
            .then((data) => {
              const param = {
                'devices': [
                  {
                    'device-id': event.data.device_id,
                    'dynamicvlans': [
                      {
                        'port': parseInt(event.data.port),
                        'dynamicVlan': this.CONST.DISABLE
                      }
                    ]
                  }
                ]
              };
              this.di.vlanDataManager.postVlanDynamic(param)
                .then((res) => {
                  this.di.notificationService.renderSuccess(scope, this.translate('MODULES.VLAN.DYNAMIC.DIALOG.MESSAGE.DEACTIVE_CONFIRM_SUCCESS'));
                  scope.dynamicModel.api.queryUpdate();
                }, (error) => {
                  this.di.notificationService.renderWarning(scope, error)
                });
            }, (res) => {
              this.di.$log.debug('delete vlan ip mask dialog cancel');
            });
        }
        if (event.action.value === 'active') {
          this.di.dialogService.createDialog('warning', this.translate('MODULES.VLAN.DYNAMIC.DIALOG.MESSAGE.ACTIVE_CONFIRM'))
            .then((data) => {
              const param = {
                'devices': [
                  {
                    'device-id': event.data.device_id,
                    'dynamicvlans': [
                      {
                        'port': parseInt(event.data.port),
                        'dynamicVlan': this.CONST.ENABLE
                      }
                    ]
                  }
                ]
              }
              this.di.vlanDataManager.postVlanDynamic(param)
                .then((res) => {
                  this.di.notificationService.renderSuccess(scope, this.translate('MODULES.VLAN.DYNAMIC.DIALOG.MESSAGE.ACTIVE_CONFIRM_SUCCESS'));
                  scope.dynamicModel.api.queryUpdate();
                }, (error) => {
                  this.di.notificationService.renderWarning(scope, error)
                });
            }, (res) => {
              this.di.$log.debug('delete vlan ip mask dialog cancel');
            });
        }
      }
    };


    scope.onTableRowActionsFilter = (event) => {
      let filterActions = [];
      if (event.data) {
        event.actions.forEach((action) => {
          if (event.data.dynamic === this.CONST.ENABLE && action.value !== 'active') {
            filterActions.push(action);
          }

          if (event.data.dynamic !== this.CONST.ENABLE && action.value !== 'deactive') {
            filterActions.push(action);
          }
        });
      }
      return filterActions;
    };

    // scope.batchRemove = ($value) => {
    //   if ($value.length) {
    //     this.di.dialogService.createDialog('warning', this.translate('MODULES.ALERT.DIALOG.CONTENT.REMOVE_ALERT_HISTORIES'))
    //     //this.confirmDialog(this.translate('MODULES.ALERT.DIALOG.CONTENT.REMOVE_ALERT_HISTORIES'))
    //       .then((data) => {
    //         this.batchDeleteAlertHistory($value);
    //       }, (res) => {
    //         this.di.$log.debug('delete user account dialog cancel');
    //       });
    //   }
    // };

    unSubscribers.push(this.di.$rootScope.$on('vlan-ip-list-refresh', ($event, isAdd) => {
      if (isAdd) {

        this.di.notificationService.renderSuccess(scope, this.translate('MODULES.VLAN.IP.DIALOG.MESSAGE.ADD_VLAN_IP_SUCCESS'));
      } else {
        this.di.notificationService.renderSuccess(scope, this.translate('MODULES.VLAN.IP.DIALOG.MESSAGE.EDIT_VLAN_IP_SUCCESS'));
      }
      scope.dynamicModel.api.queryUpdate();
    }));


    scope.$on('$destroy', () => {
      this.di._.each(unSubscribers, (unSubscribe) => {
        unSubscribe();
      });
    });
  }

  init() {
    let m = this.di.alertDataManager;
    this.di.$scope.dynamicModel.tableProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();


        let deviceDefer = this.di.$q.defer();
        let portsDefer = this.di.$q.defer();
        let vlanDefer = this.di.$q.defer();
        let promises = [];

        this.di.deviceDataManager.getPorts().then((res) => {
          this.di.$scope.ports = res.data.ports;
          //   scope.ports = this.di._.groupBy(res.data.ports , "element");
          // }
          portsDefer.resolve();
        }, (err) => {
          portsDefer.reject(err);
        });
        promises.push(portsDefer.promise);

        this.di.deviceDataManager.getDeviceConfigs().then((configs) => {
          this.di.$scope.devices = configs;
          deviceDefer.resolve();
        }, (err) => {
          deviceDefer.reject(err);
        });
        promises.push(deviceDefer.promise);

        this.di.vlanDataManager.getVlanConfig().then((res) => {
          this.di.$scope.vlansConfig = res.data.devices;
          vlanDefer.resolve();
        }, (err) => {
          vlanDefer.reject(err);
        });
        promises.push(vlanDefer.promise);

        Promise.all(promises).then(() => {

          defer.resolve({
            data: this._formatVlanDynamics(this.di.$scope.ports, this.di.$scope.vlansConfig),
          });
        }, (err) => {

        });

        // this.di.deviceDataManager.getDeviceConfigs().then((configs)=> {
        //   this.di.$scope.devices = configs;
        //   this.di.vlanDataManager.getVlanConfig().then((res) => {
        //     let devicesConfig = res.data.devices;
        //     defer.resolve({
        //       data: this._formatVlanIps(devicesConfig),
        //     });
        //   });
        // })


        // let query = this.di.$location.search();
        // if (query.uuid) {
        //   this.di.$scope.ipSubnetModel.api.setSelectedRow(qeury.uuid);
        // }
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.vlanService.getVlanDynamicSchema(),
          index_name: 'uuid',
          rowCheckboxSupport: true,
          rowActionsSupport: true,
          authManage: {
            support: true,
            currentRole: this.di.$scope.role
          }
        };
      }
    });
  }

  _getDeviceName(deviceId) {
    let device = this.di.$scope.devices.find(device => device.id === deviceId);
    if (device) {
      return device.name;
    } else {
      return deviceId;
    }
  }


  _formatVlanDynamics(ports, vlansConfig) {
    let dynamics = [];

    let dynamicDict = {};
    vlansConfig.forEach(deviceCfg => {
      let deviceId = deviceCfg['device-id'];
      let vlan_ports = deviceCfg['ports'];
      vlan_ports.forEach(vlan_port => {
        dynamicDict[deviceId + '__' + vlan_port.port] = vlan_port['dynamicVlan'] ? vlan_port['dynamicVlan'] : this.CONST.ENABLE;
      });
    });


    ports.forEach(port => {
      const d = dynamicDict[port.element + '__' + port.port] ? dynamicDict[port.element + '__' + port.port] : this.CONST.ENABLE;
      if (port.element.toLocaleLowerCase().indexOf('rest') !== -1) {
        dynamics.push({
          'device_id': port.element,
          'device_name': this._getDeviceName(port.element),
          'port': port.port,
          'dynamic': d,
          'status': d === 'enable' ? 'done' : 'not_interested'
        })
      }


    });
    return dynamics;
  }
}

DynamicVlanController.$inject = DynamicVlanController.getDI();
DynamicVlanController.$$ngIsClass = true;