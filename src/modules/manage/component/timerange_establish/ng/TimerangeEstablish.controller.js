/**
 * Created by wls on 2018/6/7.
 */

export class TimeRangeEstablishController {
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
    TimeRangeEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let unsubscribes = [];
    const scope = this.di.$scope;
    const manageDataManager = this.di.manageDataManager;
    const rootScope = this.di.$rootScope;
    this.translate = this.di.$filter('translate');

    scope.wizardHeight = {"height": '600px'};

    let di = this.di;

    this.di.$scope.showWizard = false;
    this.di.$scope.title = this.translate('MODULES.TIMERANGES.ESTABLISH.NAME');
    this.di.$scope.steps = [
      {
        id: 'step1',
        title: 'info',
        content: require('../template/timerange_establish.html'),
      }
    ];
    // ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "daily", "weekdays", "weekend"]

    scope.device = null;
    scope.tsEsDisplay = {
      modeDisplay: {'options': [{'label': '固定区间', 'value': 'absolute'}, {'label': '周期区间', 'value': 'periodic'}]},
      periodicDisplay:{
        // 'hint':'周期范围',
        'options':[
          {'label': 'sunday', 'value': 'sunday'},
          {'label': 'monday', 'value': 'monday'},
          {'label': 'tuesday', 'value': 'tuesday'},
          {'label': 'wednesday', 'value': 'wednesday'},
          {'label': 'thursday', 'value': 'thursday'},
          {'label': 'friday', 'value': 'friday'},
          {'label': 'saturday', 'value': 'saturday'},
          {'label': 'daily', 'value': 'daily'},
          {'label': 'weekdays', 'value': 'weekdays'},
          {'label': 'weekend', 'value': 'weekend'},
        ]
      }
    };

    scope.tsEsModel = {
      mode: null,
      name: null,
      ab_start_need: false,
      ab_start: {
        date: null,
        hour: null,
        minute: null
      },
      ab_end: {
        date: null,
        hour: null,
        minute: null
      },
      per_start: {
        date: null,
        hour: null,
        minute: null
      },
      per_end: {
        date: null,
        hour: null,
        minute: null
      }
    };

    let reset = () => {
      scope.tsEsModel = {
        mode: null,
        name: null,
        ab_start_need: false,
        ab_start: {
          date: null,
          hour: null,
          minute: null
        },
        ab_end: {
          date: null,
          hour: null,
          minute: null
        },
        per_start: {
          date: null,
          hour: null,
          minute: null
        },
        per_end: {
          date: null,
          hour: null,
          minute: null
        }
      };
      scope.tsEsModel.mode = scope.tsEsDisplay.modeDisplay.options[0];
    };

    scope.open = (device, name) => {
      if (scope.showWizard) return;

      reset();

      scope.device = device;
      scope.tsEsModel.name = name;

      scope.showWizard = true;
    };


    scope.periodStartTypeChange = ($value) =>{
      // {'label': 'daily', 'value': 'daily'},
      // {'label': 'weekdays', 'value': 'weekdays'},
      // {'label': 'weekend', 'value': 'weekend'},
      if($value.value === 'daily' || $value.value === 'weekdays' || $value.value === 'weekend'){
        scope.tsEsModel.per_end.date = angular.copy($value);
      } else {
        let endValue = scope.tsEsModel.per_end.date.value;
        if(endValue === 'daily' || endValue === 'weekdays' || endValue === 'weekend'){
          scope.tsEsModel.per_end.date = angular.copy($value);
        }
      }
    };

    scope.periodEndTypeChange = ($value) =>{
      if($value.value === 'daily' || $value.value === 'weekdays' || $value.value === 'weekend'){
        scope.tsEsModel.per_start.date = angular.copy($value);
      } else {
        let endValue = scope.tsEsModel.per_start.date.value;
        if(endValue === 'daily' || endValue === 'weekdays' || endValue === 'weekend'){
          scope.tsEsModel.per_start.date = angular.copy($value);
        }
      }
    };

    function validCurrentDom(dom_class) {
      let out = document.getElementsByClassName(dom_class);

      if (out && out.length === 1) {
        let invalidDoms = out[0].getElementsByClassName('mdc-text-field--invalid');
        if (invalidDoms && invalidDoms.length > 0) {
          return false;
        }
      }
      return true;
    }

    let translate = this.translate;

    this.di.$scope.submit = function () {
      let inValidJson = {
        valid: false,
        errorMessage: ''
      };

      di.$rootScope.$emit('page_timerange_es');
      if (!validCurrentDom('timerange_establish')) {
        return new Promise((resolve, reject) => {
          resolve(inValidJson);
        });
      }
      let param = {'name': scope.tsEsModel.name.value};
      if (scope.tsEsModel.mode.value === 'absolute') {
        param['absolute'] = {
          'end': {
            'year': scope.tsEsModel.ab_end.date.getFullYear(),
            'month': scope.tsEsModel.ab_end.date.getMonth() + 1,
            'day': scope.tsEsModel.ab_end.date.getDate(),
            'hour': scope.tsEsModel.ab_end.hour,
            "minute": scope.tsEsModel.ab_end.minute,
          }
        };
        if (scope.tsEsModel.ab_start_need) {
          param['absolute']['start'] = {
            'year': scope.tsEsModel.ab_start.date.getFullYear(),
            'month': scope.tsEsModel.ab_start.date.getMonth() + 1,
            'day': scope.tsEsModel.ab_start.date.getDate(),
            'hour': scope.tsEsModel.ab_start.hour,
            "minute": scope.tsEsModel.ab_start.minute
          }
        }
      } else {
        param['periodic'] = [{
          'start': {
            'day': scope.tsEsModel.per_start.date.value,
            'hour': scope.tsEsModel.per_start.hour,
            "minute": scope.tsEsModel.per_start.minute,
          },
          'end': {
            'day': scope.tsEsModel.per_end.date.value,
            'hour': scope.tsEsModel.per_end.hour,
            "minute": scope.tsEsModel.per_end.minute,
          }
        }];
      }
      return new Promise((resolve, reject) => {

        manageDataManager.postTimeRangeByDevice(scope.device.value, param).then(
          res => {
            rootScope.$emit('timerange-name-refresh');
            resolve({valid: true, errorMessage: ''});
          },
          err => {
            inValidJson.errorMessage = err.data;
            resolve(inValidJson);
          }
        );

        // manageDataManager.getTimeRangeByDevice(scope.device.value).then(res=>{
        //   let nameList = res.data[scope.device.value];
        //   let index = nameList.findIndex(function (range) {
        //     return range.name === scope.tsEsModel.name
        //   })
        //   if(index !==  -1){
        //     inValidJson.errorMessage= translate('MODULES.TIMERANGES.ESTABLISH.MESSAGE.NAME_EXIST');
        //     resolve(inValidJson);
        //     return;
        //   }
        //   manageDataManager.postTimeRangeByDevice(scope.device.value, {
        //     'name': scope.tsEsModel.name
        //   }).then((res)=>{
        //     rootScope.$emit('timerange-name-refresh');
        //     resolve({valid: true, errorMessage: ''});
        //   }, err=>{
        //     inValidJson.errorMessage= err.data;
        //     resolve(inValidJson);
        //   })
        // });
      });
    }


    scope.cancel = function (formData) {
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    unsubscribes.push(this.di.$rootScope.$on('timerange-wizard-show', ($event, device, time_name) => {
      scope.open(device, time_name);
    }));

    this.di.$scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

TimeRangeEstablishController.$inject = TimeRangeEstablishController.getDI();
TimeRangeEstablishController.$$ngIsClass = true;


