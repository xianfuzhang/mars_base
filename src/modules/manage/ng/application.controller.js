export class ApplicationController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '_',
      '$http',
      '$timeout',
      '$filter',
      '$q',
      '$log',
      '$uibModal',
      'roleService',
      'appService',
      'notificationService',
      'manageService',
      'manageDataManager',
      'tableProviderFactory',
      'dialogService',
    ];
  }

  constructor(...args) {
    this.di = {};
    ApplicationController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unSubscribers = [];
    let scope = this.di.$scope;
    scope.role = this.di.roleService.getRole();
    this.translate = this.di.$filter('translate');

    scope.applicationModel = {
      actionsShow: this.di.manageService.getApplicationTableActionsShow(),
      rowActions: this.di.manageService.getApplicationTableRowActions(),
      applicationTableProvider: null,
      api: null,
    };


    // {
    //   "category": "Drivers",
    //   "description": "Adds support for Juniper devices.",
    //   "features": [
    //   "onos-drivers-juniper"
    // ],
    //   "featuresRepo": "mvn:org.onosproject/onos-drivers-juniper/1.13.2-rc3/xml/features",
    //   "id": 101,
    //   "name": "org.onosproject.drivers.juniper",
    //   "origin": "ONOS Community",
    //   "permissions": [],
    //   "readme": "Adds support for Juniper devices.",
    //   "requiredApps": [
    //   "org.onosproject.netconf"
    // ],
    //   "state": "INSTALLED",
    //   "url": "http://onosproject.org",
    //   "version": "1.13.2.rc3"
    // }
    let _formatData = (res) =>{
      let apps = res['applications'];
      let retApps = [];
      this.di._.forEach(apps, (app)=>{
        let item = {};
        item['status'] = app['state'] === 'ACTIVE' ? 'available' : null;
        item['_state'] = app['state'];
        item['app_id'] = app['name'];
        item['_app_id'] = app['name'];
        item['title'] = app['description'];
        item['version'] = app['version'];
        item['category'] = app['category'];
        item['origin'] = app['origin'];
        retApps.push(item);
      });

      return retApps;
    };

    scope._apps = [];

    scope.applicationModel.applicationTableProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.manageDataManager.getAllApplications().then((res) => {
          scope._apps = _formatData(res.data);
          defer.resolve({
            data: scope._apps,
            count: undefined
          });
        },(err)=>{
          this.di.notificationService.renderWarning(scope, err);
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.manageService.getApplicationTableSchema(),
          index_name: 'app_id',
          rowCheckboxSupport: false,
          rowActionsSupport: true,
          authManage: {
            support: true,
            currentRole: scope.role
          }
        };
      }
    });

    scope.add = () =>{
      this.di.$rootScope.$emit('application-wizard-show');
    }

    scope.onTableRowSelectAction = (event) => {
      if (event.data && event.action) {
        if (event.action.value === 'delete') {
          this.di.dialogService.createDialog('warning', this.translate('MODULES.MANAGE.APPLICATION.REMOVE_APPLICATION'))
            .then((data) =>{
              this.di.manageDataManager.deleteApplication(event.data._app_id).then((res) => {
                this.di.notificationService.renderSuccess(scope, this.translate('MODULES.MANAGE.APPLICATION.REMOVE_APPLICATION.SUCCESS'));
                scope.applicationModel.api.queryUpdate();
              },(err)=>{
                this.di.notificationService.renderWarning(scope, err.data);
              });
            }, (res) =>{
              this.di.$log.debug('delete application dialog cancel');
            });
        } else if(event.action.value === 'active'){
          this.di.manageDataManager.activeApplication(event.data._app_id).then((res) => {
            this.di.notificationService.renderSuccess(scope, this.translate('MODULES.MANAGE.APPLICATION.ACTIVE_APPLICATION.SUCCESS'));
            _update_single_item(event.data._app_id);
          },(err)=>{
            this.di.notificationService.renderWarning(scope, err.data);
          });
        } else if(event.action.value === 'deactive'){
          this.di.manageDataManager.deActiveApplication(event.data._app_id).then((res) => {
            this.di.notificationService.renderSuccess(scope, this.translate('MODULES.MANAGE.APPLICATION.DEACTIVE_APPLICATION.SUCCESS'));
            _update_single_item(event.data._app_id);
          },(err)=>{
            this.di.notificationService.renderWarning(scope, err.data);
          });
        } else {
          console.log("Error table select action: " + event.action.value);
        }
      }
    };

    //更新单行的数据
    let _update_single_item = (app_id) =>{
      this.di.manageDataManager.getApplication(app_id).then((res) => {
        this.di._.forEach(scope._apps, (app)=>{
          if(app.app_id === app_id){
            app['status'] = res.data['state'] === 'ACTIVE' ? 'available' : null;
            app['_state'] = res.data['state'];
          }
        });
        scope.applicationModel.api.update();
      },(err)=>{
        console.log("Error occur when getApplication in _update_single_item " + JSON.stringify(err))
      });
    };


    scope.onTableRowClick = (event) =>{
      if (event.$data){
        scope.applicationModel.api.setSelectedRow(event.$data.app_id);
      }
    };

    scope.onTableRowActionsFilter = (event) =>{
      let filterActions = [];
      if (event.data) {
        event.actions.forEach((action) =>{
          if (event.data._state === 'ACTIVE' && action.value !== 'active') {
            filterActions.push(action);
          }

          if (event.data._state !== 'ACTIVE' && action.value!== 'deactive') {
            filterActions.push(action);
          }
        });
      }
      return filterActions;
    };

    scope.onAPIReady = ($api) => {
      scope.applicationModel.api = $api;
    };

    let unsubscribes = [];

    unsubscribes.push(this.di.$rootScope.$on('application-refresh', ($event) => {
      this.di.notificationService.renderSuccess(scope, this.translate('MODULES.MANAGE.APPLICATION.ADD_APPLICATION.SUCCESS'));
      scope.applicationModel.api.queryUpdate();
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });
  }
}

ApplicationController.$inject = ApplicationController.getDI();
ApplicationController.$$ngIsClass = true;