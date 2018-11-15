export class TenantController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '_',
      '$http',
      '$filter',
      '$q',
      '$log',
      '$uibModal',
      'appService',
      'logicalService',
      'logicalDataManager',
      'tableProviderFactory',
      'notificationService',
      'roleService',
      'dialogService',
    ];
  }

  constructor(...args) {
    this.di = {};
    TenantController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unSubscribers = [];
    let scope = this.di.$scope;

    this.translate = this.di.$filter('translate');

    scope.regex = {
      ttl_regex: '^[1-9]$|^[1-9][0-9]$|^1[0-9]{2}$|^2[0-4][0-9]$|^25[0-5]$',
      delay_regex: '^([2-9]|10)$',
      timeout_regex: '^(1[5-9][0-9]|2[0-9]{2}|300)$',
      dhcp_int_regex: '^([0-9]|[1-9][0-9]{0,5}|1[0-9]{6}|2[0-4][0-9]{5}|25[0-8][0-9]{4}|259[0-1]{3}|2592000)$'
    };

    scope.role = this.di.roleService.getRole();

    scope.onTenantTableRowSelectAction = (event) => {
      if (event.data && event.action) {
        if (event.action.value === 'delete') {
          this.di.dialogService.createDialog('warning', this.translate('MODULES.LOGICAL.TENANT.TABLE.REMOVE_TENANT'))
            .then((data) =>{
              this.di.logicalDataManager.deleteTenant(event.data.name)
                .then((res) =>{
                  this.di.notificationService.renderSuccess(scope,this.translate('MODULES.LOGICAL.TENANT.DELETE.SUCCESS'));
                  scope.tenantModel.tenantAPI.queryUpdate();
                },(err)=>{
                  this.di.notificationService.renderWarning(scope, err);
                });

            }, (res) =>{
              this.di.$log.debug('delete macip binding dialog cancel');
            });
        } else {
          this.di.$rootScope.$emit('tenant-wizard-show', event.data);
        }
      }
    };

    scope.tenantModel = {
        actionsShow: {
          'menu': {'enable': false, 'role': 2},
          'add': {'enable': true, 'role': 2},
          'remove': {'enable': true, 'role': 2},
          'refresh': {'enable': true, 'role': 2},
          'search': {'enable': false, 'role': 2}
        },
        rowActions:[
          {
            'label': this.translate('MODULES.LOGICAL.TENANT.TABLE.EDIT'),
            'value': 'edit',
            'role': 2,
          },
          {
            'label': this.translate('MODULES.LOGICAL.TENANT.TABLE.DELETE'),
            'value': 'delete',
            'role': 2,
          }

        ],
      tenantTableProvider:null,
      tenantAPI: "",
    };


    scope.addTenant = () =>{
      this.di.$rootScope.$emit('tenant-wizard-show');
    };

    scope.batchRemove = ($value) => {
      if (!$value.length) return;
      this.di.dialogService.createDialog('warning', this.translate('MODULES.LOGICAL.TENANT.TABLE.BATCH_DELETE_TENANT'))
        .then(() =>{
          batchDeleteTenants($value);
        }, () => {
          scope.tenantModel.tenantAPI.queryUpdate();
        });
    };

    let batchDeleteTenants = (tenants) => {
      let deferredArr = [];
      tenants.forEach((item) => {
        let defer = this.di.$q.defer();
        this.di.logicalDataManager.deleteTenant(item.name)
          .then(() => {
            defer.resolve();
          }, (msg) => {
            defer.reject(msg);
          });
        deferredArr.push(defer.promise);
      });

      this.di.$q.all(deferredArr).then(() => {
        this.di.notificationService.renderSuccess(scope,this.translate('MODULES.LOGICAL.TENANT.BATCH.DELETE.SUCCESS'));
        scope.tenantModel.tenantAPI.queryUpdate();
      }, (msg) => {
        this.di.notificationService.renderWarning(scope, msg);
        scope.tenantModel.tenantAPI.queryUpdate();
      });
    };

    scope.tenantModel.tenantTableProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.logicalDataManager.getTenants().then((res) => {
            defer.resolve({
              data: res.data.tenants,
              count: undefined
            });
        },(error)=>{
          this.di.notificationService.renderWarning(scope, error);
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.logicalService.getTenantTableSchema(),
          index_name: 'name',
          rowCheckboxSupport: true,
          rowActionsSupport: true,
          authManage: {
            support: true,
            currentRole: scope.role
          }
        };
      }
    });

    scope.onTableRowClick = (event) => {
      if (event.$data){
        scope.tenantModel.tenantAPI.setSelectedRow(event.$data.name);
      }
    };

    scope.onTenantAPIReady = ($api) => {
      scope.tenantModel.tenantAPI = $api;
    };

    let init = () =>{
    };

    init();


    let unsubscribes = [];
    unsubscribes.push(this.di.$rootScope.$on('tenent-refresh', ($event, succeed) => {
      if(succeed === true){
        this.di.notificationService.renderSuccess(scope,this.translate('MODULES.LOGICAL.TENANT.CREATE.SUCCESS'));
      }
      scope.tenantModel.tenantAPI.queryUpdate();
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })

  }




}

TenantController.$inject = TenantController.getDI();
TenantController.$$ngIsClass = true;