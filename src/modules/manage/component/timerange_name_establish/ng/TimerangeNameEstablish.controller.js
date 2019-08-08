/**
 * Created by wls on 2018/6/7.
 */

export class TimeRangeNameEstablishController {
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
    TimeRangeNameEstablishController.getDI().forEach((value, index) => {
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
    this.di.$scope.title = this.translate('MODULES.TIMERANGES.ESTABLISH.NAME');
    this.di.$scope.steps = [
      {
        id: 'step1',
        title: 'info',
        content: require('../template/timerange_name_establish.html'),
      }
    ];

    scope.device = null;
    scope.tsEsModel = {};
    scope.tsEsModel.name = '';

    let reset = () =>{
      scope.tsEsModel.name = '';
    };
    this.di.$scope.open = (device) => {
      if(scope.showWizard) return;

      scope.device = device;
      reset();
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

      di.$rootScope.$emit('page_timerange_name_es');
      if(!validCurrentDom('timerange_name_establish')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson);
        });
      }

      return new Promise((resolve, reject) => {

        manageDataManager.getTimeRangeByDevice(scope.device.value).then(res=>{
          let nameList = res.data[scope.device.value];
          let index = nameList.findIndex(function (range) {
            return range.name === scope.tsEsModel.name
          })
          if(index !==  -1){
            inValidJson.errorMessage= translate('MODULES.TIMERANGES.ESTABLISH.MESSAGE.NAME_EXIST');
            resolve(inValidJson);
            return;
          }
          manageDataManager.postTimeRangeByDevice(scope.device.value, {
            'name': scope.tsEsModel.name
          }).then((res)=>{
            rootScope.$emit('timerange-name-refresh');
            resolve({valid: true, errorMessage: ''});
          }, err=>{
            inValidJson.errorMessage= err.data;
            resolve(inValidJson);
          })
        });


        // manageDataManager.getNTP().then((res)=>{
        //   let ntp= res.data;
        //   if(!ntp['ntp_servers']){
        //     ntp['ntp_servers'] = [];
        //   }
        //   ntp['ntp_servers'].push(scope.ntpesmodel.server);
        //
        //   manageDataManager.putNTP(ntp).then((res)=>{
        //     rootScope.$emit('ntp-refresh');
        //     resolve({valid: true, errorMessage: ''});
        //   },(err)=>{
        //     inValidJson.errorMessage = err.data.message;
        //     resolve(inValidJson);
        //   })
        // },(err)=>{
        //   inValidJson.errorMessage = err.data.message;
        //   resolve(inValidJson);
        // });
      });
    };


    scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    unsubscribes.push(this.di.$rootScope.$on('timerange-name-wizard-show', ($event, device) => {
      scope.open(device);
    }));

    this.di.$scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

TimeRangeNameEstablishController.$inject = TimeRangeNameEstablishController.getDI();
TimeRangeNameEstablishController.$$ngIsClass = true;


