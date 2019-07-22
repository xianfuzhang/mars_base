/**
 * Created by wls on 2018/6/7.
 */

export class PoePortEstablishController {
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
      'functionDataManager',
      'functionService',
      'applicationService',
      'notificationService',
    ];
  }

  constructor(...args) {
    this.di = {};
    PoePortEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let unsubscribes = [];
    const scope = this.di.$scope;
    const functionDataManager = this.di.functionDataManager;
    const rootScope = this.di.$rootScope;
    this.translate = this.di.$filter('translate');

    scope.maxpower_valid_regex = '^3[0-9]{3}|[1-2][0-9]{4}|30000$';
    scope.maxpower_valid_message = this.translate('MODULES.FUNCTIONS.POE.PORT_ES.POWER.MESSAGE');

    scope.wizardHeight = {"height":'450px'};
    scope.isWizardCenter = true;

    let di = this.di;

    this.di.$scope.showWizard = false;
    this.di.$scope.title = this.translate('MODULES.FUNCTIONS.POE.PORT_ES.TITLE');
    this.di.$scope.steps = [
      {
        id: 'step1',
        title: 'info',
        content: require('../template/poe_port_establish.html'),
      }
    ];

    scope.data = null;

    scope.display = {
      statusDisplay:{
        options:[
          {'label':this.translate('MODULES.FUNCTIONS.POE.PORT_ES.STATUS.ENABLE'),'value':true},
          {'label':this.translate('MODULES.FUNCTIONS.POE.PORT_ES.STATUS.DISABLE'),'value':false}
          ]
      },
      priorityDisplay:{
        options:[
          {'label':this.translate('MODULES.FUNCTIONS.POE.PRIORITY_LEVEL.CRITICAL'),'value':1},
          {'label':this.translate('MODULES.FUNCTIONS.POE.PRIORITY_LEVEL.HIGH'), 'value':2},
          {'label':this.translate('MODULES.FUNCTIONS.POE.PRIORITY_LEVEL.LOW'), 'value':3}]
      },
      timeRangeDisplay: {
        options:[{'label':this.translate('MODULES.TIMERANGES.DISPLAY.SELECT_NAME'), 'value': null}]
      }
    }
    scope.model = {
      timeRange:null,
      maxPower: 30000,
      priority:null,
      status: null
    };
    scope.isTimeRangeEnable = false;

    let reset = () =>{
      scope.model = {
        timeRange:null,
        maxPower: 30000,
        priority:null,
        status: null
      };
    };
    this.di.$scope.open = (data) => {
      if(scope.showWizard) return;


      scope.isTimeRangeEnable = this.di.applicationService.getAppsState()['com.nocsys.timerange'] === 'ACTIVE';
      scope.data = angular.copy(data);

      reset();
      scope.model.status = scope.display.statusDisplay.options.find((option)=>{return option.value === scope.data.status});
      scope.model.priority = scope.display.priorityDisplay.options.find((option)=>{return option.value === scope.data.priority});


      scope.model.maxPower = scope.data.maxPower;
      if(scope.isTimeRangeEnable){
        scope.display.timeRangeDisplay.options = [{'label':this.translate('MODULES.TIMERANGES.DISPLAY.SELECT_NAME'), 'value': null}];
        this.di.manageDataManager.getTimeRangeByDevice(scope.data.deviceId).then(res=>{
          let rangeList = res.data[scope.data.deviceId];
          if(Array.isArray(rangeList) && rangeList.length > 0){
            rangeList.forEach(range=>{
              scope.display.timeRangeDisplay.options.push({'label': range.name, 'value':range.name})
            })
          }
          if(scope.data.timeRange !== null && scope.data.timeRange !== ''){
            scope.model.timeRange = scope.display.timeRangeDisplay.options.find((option)=>{return option.value === scope.data.timeRange});
          } else {
            scope.model.timeRange = scope.display.timeRangeDisplay.options[0];
          }
          scope.showWizard = true;
        },err=>{
          this.di.notificationService.renderWarning(scope, err.data.message|| err.data|| err);
          scope.showWizard = false;
        });
      } else {
        if(scope.data.timeRange !== null && scope.data.timeRange !== ''){
          scope.model.timeRange = scope.display.timeRangeDisplay.options.find((option)=>{return option.value === scope.data.timeRange});
        } else {
          scope.model.timeRange = scope.display.timeRangeDisplay.options[0];
        }
        scope.showWizard = true;
      }


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

      di.$rootScope.$emit('page_poe_port_es');
      if(!validCurrentDom('poe_port_establish')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson);
        });
      }
      let param = {
        status: scope.model.status.value,
        priority: scope.model.priority.value,
        maxPower: parseInt(scope.model.maxPower),
      };
      if(scope.model.timeRange.value){
        param.timeRange = scope.model.timeRange.value;
      }

      return new Promise((resolve, reject) => {
        functionDataManager.putPoePort(scope.data.deviceId,scope.data.port, param).then(res=>{
          rootScope.$emit('port-poe-refresh');
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

    unsubscribes.push(this.di.$rootScope.$on('update-port-poe-wizard-show', ($event, data) => {
      scope.open(data);
    }));

    this.di.$scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

PoePortEstablishController.$inject = PoePortEstablishController.getDI();
PoePortEstablishController.$$ngIsClass = true;


