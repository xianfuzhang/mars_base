/**
 * Created by wls on 2018/6/7.
 */

export class NtpEstablishController {
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
    NtpEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let unsubscribes = [];
    const scope = this.di.$scope;
    const manageDataManager = this.di.manageDataManager;
    const rootScope = this.di.$rootScope;
    this.translate = this.di.$filter('translate');

    scope.wizardHeight = {"height":'100px'};

    let di = this.di;

    this.di.$scope.showWizard = false;
    this.di.$scope.title = '添加NTP Server';
    this.di.$scope.steps = [
      {
        id: 'step1',
        title: 'info',
        content: require('../template/ntp_establish'),
      }
    ];

    scope.ntpesmodel = {};
    scope.ntpesmodel.server = '';

    let reset = () =>{
      scope.ntpesmodel.server = '';
    };
    this.di.$scope.open = () => {
      if(scope.showWizard) return;

      reset();
      scope.showWizard = true;
    };

    function validCurrentDom(dom_class) {
      let out = document.getElementsByClassName(dom_class);

      if(out && out.length === 1){
        let invalidDoms = out[0].getElementsByClassName('ng-invalid');
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

      di.$rootScope.$emit('page_ntp_es');
      if(!validCurrentDom('ntp_establish')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson);
        });
      }

      return new Promise((resolve, reject) => {
        manageDataManager.getNTP().then((res)=>{
          let ntp= res.data;
          if(!ntp['ntp_servers']){
            ntp['ntp_servers'] = [];
          }
          ntp['ntp_servers'].push(scope.ntpesmodel.server);

          manageDataManager.putNTP(ntp).then((res)=>{
            rootScope.$emit('ntp-refresh');
            resolve({valid: true, errorMessage: ''});
          },(err)=>{
            inValidJson.errorMessage = err.data.message;
            resolve(inValidJson);
          })
        },(err)=>{
          inValidJson.errorMessage = err.data.message;
          resolve(inValidJson);
        });
      });
    };


    scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    unsubscribes.push(this.di.$rootScope.$on('ntp-wizard-show', ($event) => {
      scope.open();
    }));

    this.di.$scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

NtpEstablishController.$inject = NtpEstablishController.getDI();
NtpEstablishController.$$ngIsClass = true;


