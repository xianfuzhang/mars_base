export class AclController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$location',
      '$log',
      '$q',
      '$filter',
      '_',
      'dialogService',
      'roleService',
      'aclService',
      'notificationService',
      'modalManager',
      'functionDataManager',
      'tableProviderFactory'
    ];
  }

  constructor(...args){
    this.di = {};
    AclController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    /*this.scope.tabSelected = null;
    this.scope.tabs = this.di.aclService.getTabSchema();*/
    this.scope.page_title = this.translate('MODULES.SWITCHES.TAB.SCHEMA.SWITCH');
    this.scope.role = this.di.roleService.getRole();
    this.scope.entities = [];
    this.scope.model = {
      actionsShow: this.di.aclService.getTableActionsShow(),
      rowActions: this.di.aclService.getTableRowActions(),
      provider: null,
      API: null
    };

    this.unsubscribers = [];

    this.scope.onTableRowClick = (event) => {
      if (event.$data){
        this.scope.model.API.setSelectedRow(event.$data.mac);
      }
    };

    this.scope.onTableRowActionsFilter = (event) =>{
      let filterActions = [];
      if (event.data) {
        event.actions.forEach((action) =>{
          if (event.data.type !== 'unknown') {
            filterActions.push(action);
          }
          if(event.data.type === 'unknown' && action.value === 'delete'){
            filterActions.push(action);
          }
        });
      }
      return filterActions;
    };

    this.scope.onTableRowSelectAction = (event) => {
      if (event.data && event.action) {
        if (event.action.value === 'delete') {
          this.di.dialogService.createDialog('warning', this.translate('MODULES.SWITCHES.DIALOG.CONTENT.DELETE_SWITCH'))
          //this.confirmDialog(this.translate('MODULES.SWITCHES.DIALOG.CONTENT.DELETE_SWITCH'))
            .then((data) =>{
              this.di.functionDataManager.deleteAcl(event.data.id)
                .then((res) =>{
                  this.scope.model.API.queryUpdate();
                });
            }, (res) =>{
              this.di.$log.debug('delete switch dialog cancel');
            });
        }

        //
        // if (event.action.value === 'intent') {
        //   if (this.scope.configDevices.length < 2) {
        //     this.scope.alert = {
        //       type: 'warning',
        //       msg: this.translate('MODULES.INTENT.CREATE.RESOURCE.INVALID')
        //     }
        //     this.di.notificationService.render(this.scope);
        //     return;
        //   }
        //   this.di.modalManager.open({
        //     template: require('../components/createIntent/template/createIntent.html'),
        //     controller: 'createIntentCtrl',
        //     windowClass: 'create-intent-modal',
        //     resolve: {
        //       dataModel: () => {
        //         return {
        //           srcDevice: event.data,
        //           devices: this.scope.configDevices,
        //           from: 'device'
        //         };
        //       }
        //     }
        //   })
        //   .result.then((data) => {
        //     if (data && !data.canceled) {
        //       this.di.intentDataManager.createIntent(data.result).then(
        //         () => {
        //           this.scope.alert = {
        //             type: 'success',
        //             msg: this.translate('MODULES.INTENT.CREATE.SUCCESS')
        //           }
        //           this.di.notificationService.render(this.scope);
        //         },
        //         (msg) => {
        //           this.scope.alert = {
        //             type: 'warning',
        //             msg: msg
        //           }
        //           this.di.notificationService.render(this.scope);
        //         }
        //       );
        //     }
        //   });
        // }

        if (event.action.value === 'edit') {
          this.di.$rootScope.$emit('switch-wizard-show', event.data.id);
        }
      }
    };

    this.scope.onAPIReady = ($api) => {
      this.scope.model.API = $api;
    };

    this.scope.batchRemove = ($value) => {
      if ($value.length) {
        this.di.dialogService.createDialog('warning', this.translate('MODULES.SWITCHES.DIALOG.CONTENT.BATCH_DELETE_SWITCH'))
          .then((data) =>{
            this.batchDeleteDevices($value);
          }, (res) =>{
            this.scope.model.API.queryUpdate();
            this.di.$log.debug('delete switch dialog cancel');
          });
      }
    };
    
    this.scope.addAcl = () => {
      this.di.$rootScope.$emit('switch-wizard-show');
    }
    
    this.init();

    this.unsubscribers.push(this.di.$rootScope.$on('clickabletext', (event, params) => {
      //location path to device detail
      if (params && params.field === 'switch_name') {
        //this.di.$location.path('/devices/' + params.value).search({'id': params.object.id});
        this.di.$location.path('/devices/' + params.object.id);
      }
    }));
  
    this.unsubscribers.push(this.di.$rootScope.$on('device-list-refresh', (event, params) => {
      this.scope.model.API.queryUpdate();
    }));

    this.scope.$on('$destroy', () => {
      this.unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }

  init() {
    this.scope.model.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();

        this.di.functionDataManager.getAcl().then((configs)=>{
          this.scope.entities = [];
          this.scope.entities = this.di.aclService.getAllAcls();
          let data = arr;
          defer.resolve({
            data: this.scope.entities
          });
        });

        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.aclService.getTableSchema(),
          index_name: 'mac',
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

  completedDetails(entities, details){
    this.di._.forEach(entities, (entity)=>{
      this.di._.forEach(details, (detail)=>{
        if(detail.id === entity.id){
          entity.role = detail.role;
          entity.chassisId = detail.chassisId;
          entity.serial = detail.serial;
          entity.hw = detail.hw;
          entity.sw = detail.sw;
        }
      })
    });
  }

  batchDeleteDevices(arr) {
    let deferredArr = [];
    arr.forEach((item) => {
      let defer = this.di.$q.defer();
      this.di.deviceDataManager.deleteDevice(item.id)
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
        msg: this.translate('MODULES.SWITCHES.BATCH.DELETE.SUCCESS')
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
}

AclController.$inject = AclController.getDI();
AclController.$$ngIsClass = true;