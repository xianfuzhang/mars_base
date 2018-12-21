export class PfcEstablishController {
	static getDI() {
		return [
			'$scope',
      '$rootScope',
      '$filter',
      '$timeout',
      '_',
      'deviceDataManager',
		];
	}
	constructor(...args){
		this.di = {};
    PfcEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unsubscribes = [];
    this.scope = this.di.$scope;
    let scope = this.di.$scope;
    let rootScope = this.di.$rootScope;
    let di = this.di;
    let deviceDataManager = this.di.deviceDataManager;
    this.translate = this.di.$filter('translate');
    let inValidJson = {
      valid: false,
      errorMessage: ''
    };

    scope.queue_regex = '^[0-7]$';
    scope.deviceId = null;
    scope.isEdit = false;

    scope.wizardHeight = {"height":'200px'};

    scope.showWizard = false;
    scope.title = this.translate("MODULES.SWITCH.DETAIL.PFC.CREATE");
    scope.steps = [
      {
        id: 'step1',
        title: this.translate('MODULES.SWITCH.DETAIL.PFC'),
        content: require('../template/pfc_establish'),
      }

    ];

    this.scope.pfcModel = {
      port:'',
      singleQueue: '',
      queue:[]
    };


    scope.addQueue = () => {
      let regexp = new RegExp(scope.queue_regex);

      if(!regexp.test(scope.pfcModel.singleQueue)
        || scope.pfcModel.queue.indexOf(scope.pfcModel.singleQueue) > -1)
        return;

      scope.pfcModel.queue.push(scope.pfcModel.singleQueue);
    };

    scope.removeSelectedQueue = (queue) => {
      let index = scope.pfcModel.queue.indexOf(queue);
      if(index > -1) {
        scope.pfcModel.queue.splice(index, 1);
      }
      scope.pfcModel.singleQueue = queue;
    };

    scope.cancel = function(){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    scope.submit = function() {
      let inValidJson_Copy = angular.copy(inValidJson);

      let params = {};
      params['port'] = parseInt(scope.pfcModel.port);

      if(scope.pfcModel.queue.length === 0){
        inValidJson_Copy['errorMessage'] = "请至少添加一个Queue!";
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }

      params['queues'] = di._.map(scope.pfcModel.queue, (queue)=>{return parseInt(queue)});

      return new Promise((resolve, reject) => {
        deviceDataManager.postPFC(scope.deviceId, params)
          .then(() => {
            rootScope.$emit('pfc-list-refresh');
            resolve({valid: true, errorMessage: ''});
          }, (err) => {
            // scope.switch = _.cloneDeep(initSwitch);
            resolve({valid: false, errorMessage: err});
          });
      });
    };


    let reset = () =>{
      scope.pfcModel.singleQueue = '';
      scope.pfcModel.queue = [];
      scope.pfcModel.port = '';
      // scope.title = '添加PFC';
      scope.title = this.translate("MODULES.SWITCH.DETAIL.PFC.CREATE");
      scope.isEdit = false;
    };

    scope.open = (deviceId, port) => {
      if(scope.showWizard) return;

      reset();
      scope.deviceId = deviceId;

      if(port) {
        scope.isEdit = true;
        scope.title = this.translate("MODULES.SWITCH.DETAIL.PFC.UPDATE");
        deviceDataManager.getPFCListByDeviceId(scope.deviceId).then(
          (res) => {
            let pfcs =  res.data['pfcs'];
            this.di._.map(pfcs,(pfc)=>{
              pfc['port'] = pfc['port'] + '';
              return pfc;
            });
            let pfc = this.di._.find(pfcs, {'port': port + ''});
            if(!pfc){
              console.error(error);
            } else {
              scope.pfcModel.queue = this.di._.map(pfc['queues'],(queue)=>{
                return queue+'';
              });
            }
            scope.pfcModel.port = port + '';
          }, (error) => {
            console.error(error)
          })
      }

      this.di.$timeout(() => {
        scope.showWizard = true;
      });
    };

    unsubscribes.push(this.di.$rootScope.$on('pfc-wizard-show', ($event,deviceId, port) => {
      scope.open(deviceId, port);
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });
	}
}
PfcEstablishController.$inject = PfcEstablishController.getDI();
PfcEstablishController.$$ngIsClass = true;