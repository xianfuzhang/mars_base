/**
 * Created by wls on 2018/6/7.
 */

export class IpmacEstablishController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$log',
      '$q',
      '$timeout',
      '$filter',
      '_',
      'manageDataManager',
      'manageService'
    ];
  }

  constructor(...args) {
    this.di = {};
    IpmacEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let unsubscribes = [];
    const scope = this.di.$scope;
    const manageDataManager = this.di.manageDataManager;
    const rootScope = this.di.$rootScope;
    this.translate = this.di.$filter('translate');

    scope.wizardHeight = {"height":'200px'};
    let di = this.di;

    this.di.$scope.showWizard = false;
    this.di.$scope.title = '添加IP/MAC映射';
    this.di.$scope.steps = [
      {
        id: 'step1',
        title: 'info',
        content: require('../template/ipmac_establish'),
      }
    ];
    scope.ipmacModel= {};

    scope.ipmacModel.mac = "";
    scope.ipmacModel.ip = "";
    scope.isEdit = false;
    this.di.$scope.open = (mac) => {
      if(scope.showWizard) return;



      scope.ipmacModel.mac = "";
      scope.ipmacModel.ip = "";

      if(mac){
        scope.isEdit = true;
        scope.ipmacModel.mac = mac;
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

    this.di.$scope.submit = function() {
      let inValidJson_Copy = angular.copy(inValidJson);

      di.$rootScope.$emit('page_ipmac');
      if(!validCurrentDom('ip_mac_establish')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }

      return new Promise((resolve, reject) => {
        manageDataManager.postMacAndIpBindings({'mac':scope.ipmacModel.mac, 'ip':scope.ipmacModel.ip})
          .then((res) => {
            rootScope.$emit('ipmac-refresh');
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

    unsubscribes.push(this.di.$rootScope.$on('ipmac-wizard-show', ($event, mac) => {
      scope.open(mac);
    }));

    this.di.$scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

IpmacEstablishController.$inject = IpmacEstablishController.getDI();
IpmacEstablishController.$$ngIsClass = true;


