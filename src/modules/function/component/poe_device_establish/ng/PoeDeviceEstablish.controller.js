/**
 * Created by wls on 2018/6/7.
 */

export class PoeDeviceEstablishController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$log',
      '$q',
      '$timeout',
      '$filter',
      '_',
      'functionDataManager',
      'functionService'
    ];
  }

  constructor(...args) {
    this.di = {};
    PoeDeviceEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let unsubscribes = [];
    const scope = this.di.$scope;
    const functionDataManager = this.di.functionDataManager;
    const rootScope = this.di.$rootScope;
    this.translate = this.di.$filter('translate');

    scope.wizardHeight = {"height":'200px'};
    scope.isWizardCenter = true;

    let di = this.di;

    this.di.$scope.showWizard = false;
    this.di.$scope.title = this.translate('MODULES.FUNCTIONS.POE.DEVICE_ES.TITLE');
    this.di.$scope.steps = [
      {
        id: 'step1',
        title: 'info',
        content: require('../template/poe_device_establish.html'),
      }
    ];

    scope.data = null;
    scope.model = {};
    scope.model.threshold = '';

    let reset = () =>{
      scope.model.threshold = '';
    };
    this.di.$scope.open = (data) => {
      if(scope.showWizard) return;

      scope.data = data;
      reset();
      scope.model.threshold = scope.data.threshold+'';
      // console.log(scope.model.threshold + '《======')
      scope.showWizard = true;
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
      let inValidJson = {
        valid: false,
        errorMessage: ''
      };

      di.$rootScope.$emit('page_poe_device_es');
      if(!validCurrentDom('poe_device_establish')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson);
        });
      }

      return new Promise((resolve, reject) => {
        functionDataManager.putPoeMain(scope.data.deviceId,{ "threshold": parseInt(scope.model.threshold)}).then(res=>{
          rootScope.$emit('device-poe-refresh');
          resolve({valid: true, errorMessage: ''});
        }, err=>{
          inValidJson.errorMessage= err.data;
          resolve(inValidJson);
        });
      });
    };


    scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    unsubscribes.push(this.di.$rootScope.$on('update-device-poe-wizard-show', ($event, data) => {
      scope.open(data);
    }));

    this.di.$scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

PoeDeviceEstablishController.$inject = PoeDeviceEstablishController.getDI();
PoeDeviceEstablishController.$$ngIsClass = true;


