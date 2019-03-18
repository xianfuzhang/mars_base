/**
 * Created by wls on 2018/6/7.
 */

export class TenantEstablishController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$log',
      '$q',
      '$timeout',
      '$filter',
      '_',
      'notificationService',
      'logicalDataManager',
      'logicalService'
    ];
  }

  constructor(...args) {
    this.di = {};
    TenantEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let unsubscribes = [];
    const scope = this.di.$scope;
    const logicalDataManager = this.di.logicalDataManager;
    const rootScope = this.di.$rootScope;
    this.translate = this.di.$filter('translate');

    scope.wizardHeight = {"height":'200px'};

    let di = this.di;

    scope.showWizard = false;
    scope.title = this.translate('MODULES.LOGICAL.TENANT.TABLE.ADD');
    scope.steps = [
      {
        id: 'step1',
        title: 'info',
        content: require('../template/tenant_establish'),
      }
    ];

    scope.tenantTypeLabel = {
      options: [
        {'label': 'System', 'value': 'System'},
        {'label': 'Normal', 'value': 'Normal'},
        // {'label': 'Monitor', 'value': 'Monitor'}
        ]
    };
    scope.tenantEsModel= {};

    scope.tenantEsModel.name = "";
    scope.tenantEsModel.type = scope.tenantTypeLabel.options[0];
    scope.isEdit = false;


    let _getType = (type) =>{
      return this.di._.find(scope.tenantTypeLabel.options,{ 'value': type})
    };

    this.di.$scope.open = (tenant) => {
      if(scope.showWizard) return;

      scope.tenantEsModel.name = "";
      scope.tenantEsModel.type = scope.tenantTypeLabel.options[0];;

      if(tenant){
        scope.isEdit = true;
        scope.tenantEsModel.name = tenant.name;
        scope.tenantEsModel.type = _getType(tenant.type)
      } else{
        scope.isEdit = false;
      }

      scope.showWizard = true;
    };


    let inValidJson = {
      valid: false,
      errorMessage: ''
    };


    let validJson = {
      valid: true,
      errorMessage: ''
    };

    function validCurrentDom(dom_class) {
      let out = document.getElementsByClassName(dom_class);
      if(out && out.length === 1){
        let invalidDoms = out[0].getElementsByClassName('mdc-text-field--invalid');
        if(invalidDoms && invalidDoms.length > 0){
          return false;
        }
      }
      return true;
    }

    let translate = this.translate;

    scope.submit = function() {
      let inValidJson_Copy = angular.copy(inValidJson);

      di.$rootScope.$emit('page_tenant_es');
      if(!validCurrentDom('tenant_establish')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }

      return new Promise((resolve, reject) => {
        logicalDataManager.postTenant({'name':scope.tenantEsModel.name, 'type':scope.tenantEsModel.type.value})
          .then((res) => {
            rootScope.$emit('tenent-refresh',true);
            resolve(validJson);
          }, (error) => {
            inValidJson_Copy.errorMessage = error.data.message;
            resolve(inValidJson_Copy);
          });
      });
    };


    scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    unsubscribes.push(this.di.$rootScope.$on('tenant-wizard-show', ($event, tenant) => {
      scope.open(tenant);
    }));

    this.di.$scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

TenantEstablishController.$inject = TenantEstablishController.getDI();
TenantEstablishController.$$ngIsClass = true;


