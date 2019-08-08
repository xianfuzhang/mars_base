export class UpLinkController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$q',
      '$filter',
      'roleService',
      '_',
      'deviceService',
      'dialogService',
      'notificationService',
      'intentDataManager',
      'deviceDataManager',
      'tableProviderFactory'
    ];
  }
  constructor(...args){
    this.di = {};
    UpLinkController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    scope.devices = [];
    scope.model = {
      'actionsShow':  this.di.deviceService.getUpLinkActionsShow(),
      'rowActions': this.di.deviceService.getUpLinkTableRowActions(),
      'provider': null
    };
    scope.role = this.di.roleService.getRole();

    scope.onAPIReady = ($api) => {
      scope.model.API = $api;
    };


    scope.batchRemove = ($value) => {
      if (!$value.length) return;
      this.di.dialogService.createDialog('warning', this.translate('MODULES.FABRIC.UPLINK.DIALOG.BATCH.DELETE.WARNING'))
      .then(() =>{
          this.batchDeleteUpLinks($value);
        }, () => {
          scope.model.API.queryUpdate();
        });
    };

    scope.addUpLink=()=>{
      this.di.$rootScope.$emit('uplink-wizard-show');
    };

    scope.onTableRowSelectAction = ($event) => {
      if (!$event.action || !$event.data) return;
      if ($event.action.value === 'delete') {
        this.di.dialogService.createDialog('warning', this.translate('MODULES.FABRIC.UPLINK.DIALOG.DELETE.WARNING'))
          .then(()=>{
            this.di.deviceDataManager.deleteUpLink($event.data.segment_name).then(
              () => {
                this.di.notificationService.renderSuccess(scope, this.translate('MODULES.FABRIC.UPLINK.DELETE.SUCCESS'));
                scope.model.API.queryUpdate();
              },
              (msg) => {
                this.di.notificationService.renderWarning(scope, msg);
              }
            );
          },()=>{})
      }
    };

    scope.onTableRowClick = ($event) => {
      scope.model.API.setSelectedRow($event.$data.id);
    };

    let init = () => {
      scope.model.provider = this.di.tableProviderFactory.createProvider({
        query: (params) => {
          let defer = this.di.$q.defer();
          this.di.deviceDataManager.getDeviceConfigs().then((configs)=>{
            scope.devices = configs;
            this.di.deviceDataManager.getUpLink().then((res) => {
              scope.entities = this.getEntities(res.data['uplinkSegments']);
              defer.resolve({
                data: scope.entities
              });
            });
          });
          return defer.promise;
        },
        getSchema: () => {
          return {
            schema: this.di.deviceService.getUpLinkSchema(),
            index_name: 'segment_name',
            rowCheckboxSupport: true,
            rowActionsSupport: true,
            authManage: {
              support: true,
              currentRole: scope.role
            }
          };
        }
      });
    }

    init();


    let unsubscribes = [];
    unsubscribes.push(this.di.$rootScope.$on('uplink-list-refresh', ($event) => {
      this.di.notificationService.renderSuccess(scope, this.translate('MODULES.FABRIC.UPLINK.CREATE.SUCCESS'));
      scope.model.API.queryUpdate();
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })

  }





  getDeviceName(deviceId){
    let device =  this.di._.find(this.di.$scope.devices,{"id": deviceId});
    if(device) return device['name'];
    else return '';
  }

  getEntities(intents) {
    let entities = [];

    intents.forEach((item) => {
      let obj = {};
      obj.segment_name = item.segment_name;
      obj.device_id = this.getDeviceName(item.device_id);
      obj.vlan = item.vlan;
      obj.gateway = item.gateway;
      obj.gateway_mac = item.gateway_mac;
      obj.ip_address = item.ip_address;
      obj.ports = Array.isArray(item.ports)?item.ports.join(', '):"";
      entities.push(obj);
    });
    return entities;
  }

  batchDeleteUpLinks(uplinks) {
    let deferredArr = [];
    uplinks.forEach((item) => {
      let defer = this.di.$q.defer();

      this.di.deviceDataManager.deleteUpLink(item.segment_name).then(
        () => {
          defer.resolve();
        },
        (msg) => {
          defer.reject(msg);
        }
      );
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then(() => {
      this.di.notificationService.renderSuccess(this.di.$scope, this.translate('MODULES.FABRIC.UPLINK.BATCH.DELETE.SUCCESS'));
      this.di.$scope.model.API.queryUpdate();
    }, (msg) => {
      this.di.notificationService.renderWarning(this.di.$scope, msg);
      this.di.$scope.model.API.queryUpdate();
    });
  }
}


UpLinkController.$inject = UpLinkController.getDI();
UpLinkController.$$ngIsClass = true;