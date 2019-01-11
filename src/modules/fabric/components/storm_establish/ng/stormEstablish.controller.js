export class StormEstablishController {
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
    StormEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unsubscribes = [];
    this.scope = this.di.$scope;
    let scope = this.di.$scope;
    let rootScope = this.di.$rootScope;
    let di = this.di;
    let deviceDataManager = this.di.deviceDataManager;
    this.translate = this.di.$filter('translate');

    // 500-14880000
    scope.pps_regex = '^[5-9][0-9]{2}|[1-9][0-9]{3,6}|1[0-3][0-9]{5}|14[0-7][0-9]{4}|148[0-7][0-9]{3}|14880000$';
    scope.deviceId = null;
    scope.isEdit = false;
    scope.wizardHeight = {"height":'400px'};

    scope.showWizard = false;
    scope.title = this.translate("MODULES.FABRIC.STORM.WIZARD");

    scope.steps = [
      {
        id: 'step1',
        title: this.translate('MODULES.FABRIC.STORM.WIZARD'),
        content: require('../template/storm_establish'),
      }

    ];

    scope.stormModel = {
      device_id: '',
      device: null,
      unicast_enabled: null,
      unicast: '500',
      bcast_enabled: null,
      bcast: '500',
      mcast_enabled: null,
      mcast: '500'
    };

    scope.displayLabel = {
      device:{'options':[]},
      status:{'options':[
          {'label': this.translate('MODULES.FABRIC.STORM.ES.DISPLAY.ENABLED'), 'value': true},
          {'label': this.translate('MODULES.FABRIC.STORM.ES.DISPLAY.DISABLED'), 'value': false}
        ]
      }
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
        let invalidDoms = out[0].getElementsByClassName('ng-invalid');
        if(invalidDoms && invalidDoms.length > 0){
          return false;
        }
      }
      return true;
    }


    scope.cancel = function(){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };


    scope.submit = function() {
      let inValidJson_Copy = angular.copy(inValidJson);

      let params = {};
      params['unicast_enabled'] = scope.stormModel.unicast_enabled.value;
      params['unicast'] = parseInt(scope.stormModel.unicast);
      params['bcast_enabled'] = scope.stormModel.bcast_enabled.value;
      params['bcast'] = parseInt(scope.stormModel.bcast);
      params['mcast_enabled'] = scope.stormModel.mcast_enabled.value;
      params['mcast'] = parseInt(scope.stormModel.mcast);

      if(scope.stormModel.device_id === ''){
        scope.stormModel.device_id = scope.stormModel.device.value;
      }

      di.$rootScope.$emit('page_storm_es');
      if(!validCurrentDom('storm_establish')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });

      }

      if(scope.stormModel.device_id === ""){
        inValidJson_Copy['errorMessage'] = "请选择交换机!";
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }


      return new Promise((resolve, reject) => {
        deviceDataManager.postStormControl(scope.stormModel.device_id, params)
          .then(() => {
            rootScope.$emit('storm-list-refresh');
            resolve({valid: true, errorMessage: ''});
          }, (err) => {
            // scope.switch = _.cloneDeep(initSwitch);
            resolve({valid: false, errorMessage: err});
          });
      });
    };



    scope.open = (deviceId) => {
      if(scope.showWizard) return;

      scope.isEdit = false;
      scope.displayLabel.device = {'options':[]};
      scope.title = this.translate("MODULES.FABRIC.STORM.WIZARD");
      scope.stormModel = {
        device_id: '',
        device: null,
        unicast_enabled: null,
        unicast: '500',
        bcast_enabled: null,
        bcast: '500',
        mcast_enabled: null,
        mcast: '500'
      };

      if(deviceId){
        scope.isEdit = true;
        scope.stormModel.device_id = deviceId;
        scope.title = this.translate("MODULES.FABRIC.STORM.WIZARD.EDIT");
      }

      deviceDataManager.getDeviceConfigs().then((configs)=>{
        this.di._.forEach(configs,(config)=>{
          // if(config['id'].toLocaleLowerCase().indexOf('grpc') !== -1 || config['id'].toLocaleLowerCase().indexOf('rest') !== -1){
          scope.displayLabel.device.options.push({'label':config['name'], 'value':config['id']})
          // }
        });

        if(scope.isEdit){
          let index = this.di._.findIndex(scope.displayLabel.device.options,{'value': scope.stormModel.device_id});
          scope.stormModel.device = scope.displayLabel.device.options[index];
          deviceDataManager.getStormControl(scope.stormModel.device_id).then((res)=>{
            let data = res.data;
            scope.stormModel.unicast = data['unicast'];
            scope.stormModel.bcast = data['bcast'];
            scope.stormModel.mcast = data['mcast'];

            scope.stormModel.unicast_enabled = this.di._.find(scope.displayLabel.status.options, {'value':data['unicast_enabled']});
            scope.stormModel.bcast_enabled = this.di._.find(scope.displayLabel.status.options, {'value':data['bcast_enabled']});
            scope.stormModel.mcast_enabled = this.di._.find(scope.displayLabel.status.options, {'value':data['mcast_enabled']});
            scope.showWizard = true;
          },(err)=>{
            scope.showWizard = true;
            this.di.$timeout(function () {
              scope.errorMessage = JSON.stringify(err.data.message);
            })
          })

        } else {
          scope.stormModel.device = scope.displayLabel.device.options[0];
          scope.showWizard = true;
        }
      }, (err) => {
        this.di.$timeout(function () {
          scope.errorMessage = JSON.stringify(err.data.message);
        });
        scope.showWizard = true;
      });
    };

    unsubscribes.push(this.di.$rootScope.$on('storm-wizard-show', ($event, deviceId) => {
      scope.open(deviceId);
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });
	}
}
StormEstablishController.$inject = StormEstablishController.getDI();
StormEstablishController.$$ngIsClass = true;