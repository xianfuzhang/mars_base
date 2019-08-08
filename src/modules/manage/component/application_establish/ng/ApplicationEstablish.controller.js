/**
 * Created by wls on 2018/6/7.
 */

export class ApplicationEstablishController {
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
    ApplicationEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let unsubscribes = [];
    const scope = this.di.$scope;
    const manageDataManager = this.di.manageDataManager;
    const rootScope = this.di.$rootScope;
    this.translate = this.di.$filter('translate');
    let translate = this.translate;
    scope.wizardHeight = {"height":'200px'};

    this.di.$scope.showWizard = false;
    this.di.$scope.title = this.translate('MODULES.MANAGE.APPLICATION.ADD.TITLE');
    this.di.$scope.steps = [
      {
        id: 'step1',
        title: 'info',
        content: require('../template/application_establish'),
      }
    ];

    scope.appesModel = {
      isEnabled: null,
      file: null
    };

    scope.diaplayLabel = {'options':[
      {label:translate('MODULES.MANAGE.APPLICATION.ES.ACTIVE.ENABLE'), value: true},
      {label:translate('MODULES.MANAGE.APPLICATION.ES.ACTIVE.DISABLE'), value: false}
    ]};

    let reset = () =>{
      scope.appesModel = {
        isEnabled: scope.diaplayLabel.options[0],
        file: null
      };
    };

    scope.open = () => {
      if(scope.showWizard) return;

      reset();
      scope.showWizard = true;
    };


    let di = this.di;
    scope.submit = function() {
      let inValidJson = {
        valid: false,
        errorMessage: ''
      };

      if(scope.appesModel.file === null){
        inValidJson.errorMessage = translate('MODULES.MANAGE.APPLICATION.ES.FILE.SELECT');
        return new Promise((resolve, reject) => {
          resolve(inValidJson);
        });
      }

      return new Promise((resolve, reject) => {
        manageDataManager.postApplication(scope.appesModel.isEnabled.value, scope.appesModel.file).then((res)=>{
          di.$rootScope.$emit('application-refresh');
          resolve({valid: true, errorMessage: ''})
        },(err)=>{
          inValidJson.errorMessage = JSON.stringify(err.data.message);
          resolve(inValidJson);
        });
      });
    };

    scope.changeEvent = (event) =>{
        var reader = new FileReader();
        reader.onload = function (loadEvent) {
          scope.$apply(function () {
            scope.appesModel.file = reader.result;
          });
        };
        reader.readAsArrayBuffer(event.target.files[0]);
    };

    scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    unsubscribes.push(this.di.$rootScope.$on('application-wizard-show', ($event) => {
      scope.open();
    }));

    this.di.$scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

ApplicationEstablishController.$inject = ApplicationEstablishController.getDI();
ApplicationEstablishController.$$ngIsClass = true;


