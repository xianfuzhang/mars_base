export class ScheduleEstablishController {
  static getDI() {
    return [
      '$scope',
      '$filter',
      '_',
      '$rootScope',
      'logicalDataManager'
    ];
  }
  constructor(...args){
    this.di = {};
    ScheduleEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.scope.showWizard = false;
    this.scope.weight_regex ='^[0-9]|1[0-5]$';
    this.scope.steps = [
      {
        id: 'step1',
        title: '',
        content: require('../template/schedule_establish'),
      }
    ];
    this.scope.queuesLabel = {
      options: [
        {'label': '0', 'value': 0},
        {'label': '1', 'value': 1},
        {'label': '2', 'value': 2},
        {'label': '3', 'value': 3},
        {'label': '4', 'value': 4},
        {'label': '5', 'value': 5},
        {'label': '6', 'value': 6},
        {'label': '7', 'value': 7}
      ]
    };
    this.scope.model = {
      queueObject: null,
      weight: null,
      update: false,
      weightHelper: {
        'id': 'weightHelp',
        'persistent': 'true',
        'content': this.di.$filter('translate')('MODULES.LOGICAL.QOS.TAB.SCHEDULE.WEIGHT.HELP')
      },
      weightDisplayLabel: {
        'id': 'weightLabel'
      }
    };

    this.scope.open = (data)  => {
      if(this.scope.showWizard) return;

      this.scope.model.weightHelper.persistent = 'true';
      this.scope.model.weightHelper.validation = 'false';

      this.scope.title = this.di.$filter('translate')('MODULES.LOGICAL.WEIGHT.UPDATE_WEIGHT');
      this.scope.model.update = true;
      this.scope.model.queueObject = this.di._.find(this.scope.queuesLabel.options, {'value': data.queue});
      this.scope.model.weight = data.weight.toString();

      this.scope.showWizard = true;
    };

    let unsubscribes = [];
    unsubscribes.push(this.di.$rootScope.$on('schedule-wizard-show', ($event, data) => {
      this.scope.open(data);
    }));

    this.scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });
    this.initActions();
  }



  initActions() {
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


    this.scope.submit = () => {
      return new Promise((resolve, reject) => {

        this.di.$rootScope.$emit('page_qos_schedule');
        if(!validCurrentDom('qos_schedule_establish')) {
          this.scope.model.weightHelper.validation = 'true';
          resolve({valid: false, errorMessage: ''});
        }
        else {
          this.scope.model.weightHelper.validation = 'false';
          this.di.logicalDataManager.getScheduleList().then((data)=>{
            let param = null;
            data.forEach((item)=>{
              if(item.name === 'bandwidth'){
                param = angular.copy(item);
                return true;
              }
            });
            if(parseInt(this.scope.model.weight) === 0){
              let zeroIndex = param.queue_weight.findIndex((n)=> n === 0);
              if(zeroIndex !== -1 && zeroIndex !== this.scope.model.queueObject.value){
                resolve({valid: false, errorMessage: 
                  this.translate('MODULES.LOGICAL.WEIGHT.ERROR_MESSAGE', {'queueId': zeroIndex})});
                return false;
              }
            }

            param.queue_weight[this.scope.model.queueObject.value] = parseInt(this.scope.model.weight);

            this.di.logicalDataManager.putScheduleList(param)
              .then(() => {
                this.di.$rootScope.$emit('schedule-list-refresh');
                resolve({valid: true, errorMessage: ''});
              }, (err) => {
                resolve({valid: false, errorMessage: err});
              });
          });
        }
      });
    };

    this.scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };
  }

  validateWeight() {
    const WEIGHT_REG = /^([0-9]|1[0-5])$/;
    return WEIGHT_REG.test(this.scope.model.weight);
  }
}

ScheduleEstablishController.$inject = ScheduleEstablishController.getDI();
ScheduleEstablishController.$$ngIsClass = true;