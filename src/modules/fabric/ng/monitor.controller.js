export class MonitorController {
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
    MonitorController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    scope.devices = [];
    scope.model = {
      'actionsShow':  this.di.deviceService.getMonitorActionsShow(),
      'rowActions': this.di.deviceService.getMonitorTableRowActions(),
      'provider': null
    };
    scope.role = this.di.roleService.getRole();

    scope.onAPIReady = ($api) => {
      scope.model.API = $api;
    };


    // scope.batchRemove = ($value) => {
    //   if (!$value.length) return;
    //   this.di.dialogService.createDialog('warning', this.translate('MODULES.FABRIC.MONITOR.DIALOG.BATCH.DELETE.WARNING'))
    //   .then(() =>{
    //       this.batchDeleteStorms($value);
    //     }, () => {
    //       scope.model.API.queryUpdate();
    //     });
    // };

    scope.addMonitor=()=>{
      if(scope.entities.length === 2){
        this.di.notificationService.renderWarning(scope, this.translate('MODULES.FABRIC.MONITOR.WARNING.MAX_SESSION'));
      } else {
        this.di.$rootScope.$emit('monitor-wizard-show');
      }
    };

    scope.onTableRowSelectAction = ($event) => {
      if (!$event.action || !$event.data) return;
      if ($event.action.value === 'delete') {
        this.di.dialogService.createDialog('warning', this.translate('MODULES.FABRIC.MONITOR.DIALOG.DELETE.WARNING'))
          .then(()=>{
            this.di.deviceDataManager.deleteMonitor($event.data.session_id).then(
              () => {
                this.di.notificationService.renderSuccess(scope, this.translate('MODULES.FABRIC.MONITOR.DELETE.SUCCESS'));
                scope.model.API.queryUpdate();
              },
              (msg) => {
                this.di.notificationService.renderWarning(scope, msg);
              }
            );
          },()=>{})
      } else if($event.action.value === 'edit'){
        this.di.$rootScope.$emit('monitor-wizard-show', $event.data.session_id);
      }
    };

    scope.onTableRowClick = ($event) => {
      scope.model.API.setSelectedRow($event.$data.session_id);
    };

    let init = () => {
      scope.model.provider = this.di.tableProviderFactory.createProvider({
        query: (params) => {
          let defer = this.di.$q.defer();
          this.di.deviceDataManager.getDeviceConfigs().then((configs)=>{
            scope.devices = configs;
            this.di.deviceDataManager.getAllMonitor().then((res) => {
              if(!res.data['sessions']){
                scope.entities = []
              } else {
                scope.entities = this.getEntities(res.data['sessions']);
              }

              defer.resolve({
                data: scope.entities
              });
            });
          });
          return defer.promise;
        },
        getSchema: () => {
          return {
            schema: this.di.deviceService.getMonitorSchema(),
            index_name: 'session_id',
            rowCheckboxSupport: true,
            rowActionsSupport: true,
            authManage: {
              support: true,
              currentRole: scope.role
            }
          };
        }
      });
    };

    init();


    let unsubscribes = [];
    unsubscribes.push(this.di.$rootScope.$on('monitor-list-refresh', ($event) => {
      this.di.notificationService.renderSuccess(scope, this.translate('MODULES.FABRIC.MONITOR.CREATE.SUCCESS'));
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

  translateDirection(direction){
    if(direction === 'tx'){
      return this.translate('MODULES.FABRIC.MONITOR.DISPLAY.TX')
    } else if(direction === 'rx'){
      return this.translate('MODULES.FABRIC.MONITOR.DISPLAY.RX')
    } else if(direction === 'both'){
      return this.translate('MODULES.FABRIC.MONITOR.DISPLAY.BOTH')
    } else {
      return '';
    }
  }

  getEntities(sessions) {
    let entities = [];

    sessions.forEach((item) => {
      let record = {};
      record['session_id'] = item['session'];
      record['source_switch'] = this.getDeviceName(item['src']['device_id']);
      record['source_port'] = item['src']['port'];
      record['direction'] = this.translateDirection(item['src']['direction']);
      record['dst_switch'] = this.getDeviceName(item['target']['device_id']);
      record['dst_port'] = item['target']['port'];
      entities.push(record);
    });
    return entities;
  }

  // batchDeleteStorms(storms) {
  //   let deferredArr = [];
  //   uplinks.forEach((item) => {
  //     let defer = this.di.$q.defer();
  //
  //     this.di.deviceDataManager.deleteStormControl(item._device_id).then(
  //       () => {
  //         defer.resolve();
  //       },
  //       (msg) => {
  //         defer.reject(msg);
  //       }
  //     );
  //     deferredArr.push(defer.promise);
  //   });
  //
  //   this.di.$q.all(deferredArr).then(() => {
  //     this.di.notificationService.renderSuccess(this.di.$scope, this.translate('MODULES.FABRIC.STORM.BATCH.DELETE.SUCCESS'));
  //     this.di.$scope.model.API.queryUpdate();
  //   }, (msg) => {
  //     this.di.notificationService.renderWarning(this.di.$scope, msg);
  //     this.di.$scope.model.API.queryUpdate();
  //   });
  // }
}


MonitorController.$inject = MonitorController.getDI();
MonitorController.$$ngIsClass = true;