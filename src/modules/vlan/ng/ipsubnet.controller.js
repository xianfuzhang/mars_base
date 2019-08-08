export class VlanIpSubnetController {
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
    VlanIpSubnetController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unSubscribers = [];
    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    scope.role = this.di.roleService.getRole();

    scope.ipSubnetModel = {
      actionsShow: {
        'menu': {'enable': false, 'role': 2},
        'add': {'enable': true, 'role': 2},
        'remove': {'enable': false, 'role': 2},
        'refresh': {'enable': true, 'role': 2},
        'search': {'enable': false, 'role': 2}
      },
      rowActions: [
        {
          'label': this.translate('MODULES.VLAN.IP.MENU.EDIT'),
          'role': 2,
          'value': 'edit'
        },
        {
          'label': this.translate('MODULES.VLAN.IP.MENU.DELETE'),
          'role': 2,
          'value': 'delete'
        }
      ],
      tableProvider: null,
      api: null
    };

    scope.onTableRowClick = (event) => {
      if (event.$data) {
        scope.ipSubnetModel.api.setSelectedRow(event.$data.uuid);
      }
    };


    scope.onAPIReady = ($api) => {
      scope.ipSubnetModel.api = $api;
    };

    this.init();

    scope.addVlanIp = () =>{
      this.di.$rootScope.$emit('vlan-ip-wizard-show');
    };


    scope.onTableRowSelectAction = (event) => {
      if (event.data && event.action) {
        if (event.action.value === 'delete') {
          this.di.dialogService.createDialog('warning', this.translate('MODULES.VLAN.IP.DIALOG.MESSAGE.REMOVE_VLAN_IP'))
            .then((data) => {
              this.di.vlanDataManager.removeVlanIp(event.data.device_id, event.data.vlan)
                .then((res) => {
                  this.di.notificationService.renderSuccess(scope, this.translate('MODULES.VLAN.IP.DIALOG.MESSAGE.REMOVE_VLAN_IP_SUCCESS'));
                  scope.ipSubnetModel.api.queryUpdate();
                }, (error) => {
                  this.di.notificationService.renderWarning(scope, error)
                });
            }, (res) => {
              this.di.$log.debug('delete vlan ip mask dialog cancel');
            });
        }
        if (event.action.value === 'edit') {
          this.di.$rootScope.$emit('vlan-ip-wizard-show', event.data);
        }
      }
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
      if(isAdd){

        this.di.notificationService.renderSuccess(scope,this.translate('MODULES.VLAN.IP.DIALOG.MESSAGE.ADD_VLAN_IP_SUCCESS'));
      } else {
        this.di.notificationService.renderSuccess(scope,this.translate('MODULES.VLAN.IP.DIALOG.MESSAGE.EDIT_VLAN_IP_SUCCESS'));
      }
      scope.ipSubnetModel.api.queryUpdate();
    }));


    scope.$on('$destroy', () => {
      this.di._.each(unSubscribers, (unSubscribe) => {
        unSubscribe();
      });
    });
  }

  init() {
    let m = this.di.alertDataManager;
    this.di.$scope.ipSubnetModel.tableProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.deviceDataManager.getDeviceConfigs().then((configs)=> {
          this.di.$scope.devices = configs;
          this.di.vlanDataManager.getVlanConfig().then((res) => {
            let devicesConfig = res.data.devices;
            defer.resolve({
              data: this._formatVlanIps(devicesConfig),
            });
          });
        })


        let query = this.di.$location.search();
        if (query.uuid) {
          this.di.$scope.ipSubnetModel.api.setSelectedRow(qeury.uuid);
        }
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.vlanService.getVlanIpsSchema(),
          index_name: 'uuid',
          rowCheckboxSupport: false,
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
    if(device){
      return device.name;
    } else {
      return null;
    }
  }


  _formatVlanIps(devicesConfig) {
    let ips = [];
    devicesConfig.forEach(deviceCfg => {
      let deviceId = deviceCfg['device-id'];
      let vlans = deviceCfg['vlans'].filter(vlan => (vlan['ip'] !== '' && vlan['ip'] !== null));

      vlans.map(vlan => {
          let deviceName =  this._getDeviceName(deviceId);
          vlan['device_name'] = deviceName === null? deviceId: deviceName;
          vlan['device_id'] = deviceId;
          vlan['uuid'] = deviceId + vlan['vlan'];
        }
      );
      ips = ips.concat(vlans)
    });
    return ips;
  }

  /**
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
              headerText: this.translate('MODULES.ALERT.DIALOG.HEADER'),
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
   **/

  // batchDeleteAlertHistory(arr) {
  //   let uuids = [];
  //   arr.forEach((item) => {
  //     uuids.push(item.uuid)
  //   });
  //   let scope = this.di.$scope;
  //   let defer = this.di.$q.defer();
  //   this.di.alertDataManager.deleteAlertHistoriesSelected(uuids)
  //     .then(() => {
  //       this.di.notificationService.renderSuccess(scope, this.translate('MODULES.ALERT.DIALOG.CONTENT.REMOVE_ALERT_HISTORIES.SUCCESS'));
  //       scope.ipSubnetModel.api.queryUpdate();
  //       defer.resolve();
  //     }, (error) => {
  //       this.di.notificationService.renderWarning(scope, error);
  //       scope.ipSubnetModel.api.queryUpdate();
  //       defer.resolve();
  //     });
  // }
}

VlanIpSubnetController.$inject = VlanIpSubnetController.getDI();
VlanIpSubnetController.$$ngIsClass = true;