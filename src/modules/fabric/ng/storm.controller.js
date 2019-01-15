export class StormController {
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
    StormController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    scope.devices = [];
    scope.model = {
    	'actionsShow':  this.di.deviceService.getStormActionsShow(),
    	'rowActions': this.di.deviceService.getStormTableRowActions(),
    	'provider': null
    };
    scope.role = this.di.roleService.getRole();

    scope.onAPIReady = ($api) => {
    	scope.model.API = $api;
    };


    scope.batchRemove = ($value) => {
    	if (!$value.length) return;
      this.di.dialogService.createDialog('warning', this.translate('MODULES.FABRIC.STORM.DIALOG.BATCH.DELETE.WARNING'))
      .then(() =>{
          this.batchDeleteStorms($value);
        }, () => {
          scope.model.API.queryUpdate();
        });
    };

    scope.addStorm=()=>{
      this.di.$rootScope.$emit('storm-wizard-show');
    };

    scope.onTableRowSelectAction = ($event) => {
      if (!$event.action || !$event.data) return;
      if ($event.action.value === 'delete') {
        this.di.dialogService.createDialog('warning', this.translate('MODULES.FABRIC.STORM.DIALOG.DELETE.WARNING'))
          .then(()=>{
            this.di.deviceDataManager.deleteStormControl($event.data._device_id).then(
              () => {
                this.di.notificationService.renderSuccess(scope, this.translate('MODULES.FABRIC.STORM.DELETE.SUCCESS'));
                scope.model.API.queryUpdate();
              },
              (msg) => {
                this.di.notificationService.renderWarning(scope, msg);
              }
            );
          },()=>{})
      } else if($event.action.value === 'edit'){
        this.di.$rootScope.$emit('storm-wizard-show', $event.data._device_id);
      }
    };

    scope.onTableRowClick = ($event) => {
    	scope.model.API.setSelectedRow($event.$data.device_name);
    };

    let init = () => {
      scope.model.provider = this.di.tableProviderFactory.createProvider({
        query: (params) => {
          let defer = this.di.$q.defer();
          this.di.deviceDataManager.getDeviceConfigs().then((configs)=>{
            scope.devices = configs;
            this.di.deviceDataManager.getAllStorm().then((res) => {
              scope.entities = this.getEntities(res.data['storm']);
              defer.resolve({
                data: scope.entities
              });
            });
          });
          return defer.promise;
        },
        getSchema: () => {
          return {
            schema: this.di.deviceService.getStormSchema(),
            index_name: 'device_name',
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
    unsubscribes.push(this.di.$rootScope.$on('storm-list-refresh', ($event) => {
      this.di.notificationService.renderSuccess(scope, this.translate('MODULES.FABRIC.STORM.CREATE.SUCCESS'));
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

  getEntities(storms) {
  	let entities = [];

    storms.forEach((item) => {
      let keys = this.di._.keys(item);
      this.di._.forEach(keys,(key)=>{
        let record = item[key];
        record['device_name'] = this.getDeviceName(key);
        record['_device_id'] = key;

        record['unicast_enabled'] = record['unicast_enabled'] === true ? 'available' : 'unavailable';
        record['bcast_enabled'] = record['bcast_enabled'] === true ? 'available' : 'unavailable';
        record['mcast_enabled'] = record['mcast_enabled'] === true ? 'available' : 'unavailable';

        entities.push(record);
      });
    });
    return entities;
  }

  batchDeleteStorms(storms) {
    let deferredArr = [];
    uplinks.forEach((item) => {
      let defer = this.di.$q.defer();

      this.di.deviceDataManager.deleteStormControl(item._device_id).then(
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
      this.di.notificationService.renderSuccess(this.di.$scope, this.translate('MODULES.FABRIC.STORM.BATCH.DELETE.SUCCESS'));
      this.di.$scope.model.API.queryUpdate();
    }, (msg) => {
      this.di.notificationService.renderWarning(this.di.$scope, msg);
      this.di.$scope.model.API.queryUpdate();
    });
  }
}


StormController.$inject = StormController.getDI();
StormController.$$ngIsClass = true;