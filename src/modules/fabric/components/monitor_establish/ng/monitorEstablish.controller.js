export class MonitorEstablishController {
	static getDI() {
		return [
			'$scope',
      '$rootScope',
      '$filter',
      '$timeout',
      '_',
      'deviceDataManager',
      'notificationService'
		];
	}
	constructor(...args){
		this.di = {};
    MonitorEstablishController.getDI().forEach((value, index) => {
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
    scope.deviceId = null;
    scope.isEdit = false;
    scope.wizardHeight = {"height":'300px'};

    scope.showWizard = false;
    scope.title = this.translate("MODULES.FABRIC.MONITOR.WIZARD");

    scope.steps = [
      {
        id: 'step1',
        title: this.translate('MODULES.FABRIC.MONITOR.WIZARD'),
        content: require('../template/monitor_establish'),
      }

    ];

    scope.displayLabel = {
      dst_device: {'options': [], 'hint': this.translate('MODULES.FABRIC.MONITOR.COLUMN.DST_SWITCH')},
      src_device: {'options': [], 'hint': this.translate('MODULES.FABRIC.MONITOR.COLUMN.SOURCE_SWITCH')},
      direction: {
        'options': [
          {'label': this.translate('MODULES.FABRIC.MONITOR.DISPLAY.BOTH'), 'value': 'both'},
          {'label': this.translate('MODULES.FABRIC.MONITOR.DISPLAY.RX'), 'value': 'rx'},
          {'label': this.translate('MODULES.FABRIC.MONITOR.DISPLAY.TX'), 'value': 'tx'},
        ],
        'hint': this.translate('MODULES.FABRIC.MONITOR.COLUMN.DIRECTION')
      }
    };

    scope.monitorModel = {
      session_id: null,
      source_swt: null,
      source_port: '',
      direction: scope.displayLabel.direction.options[0],
      dst_switch: null,
      dst_port: '',
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


    scope.cancel = function(){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };


    scope.submit = function() {
      let inValidJson_Copy = angular.copy(inValidJson);

      let params = {'src':{},'target':{}};
      params['src']['device_id'] = scope.monitorModel.source_swt.value;
      params['src']['port'] = parseInt(scope.monitorModel.source_port);
      params['src']['direction'] = scope.monitorModel.direction.value;
      params['target']['device_id'] = scope.monitorModel.dst_switch.value;
      params['target']['port'] = parseInt(scope.monitorModel.dst_port);

      params['session'] = parseInt(scope.monitorModel.session_id);

      di.$rootScope.$emit('page_monitor_establish');
      if(!validCurrentDom('monitor_establish')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });

      }

      if(!params['src']['device_id']){
        inValidJson_Copy['errorMessage'] = "请选择源交换机!";
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }

      if(!params['target']['device_id']){
        inValidJson_Copy['errorMessage'] = "请选择目的交换机!";
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }


      return new Promise((resolve, reject) => {
        deviceDataManager.postMonitor(params)
          .then(() => {
            rootScope.$emit('monitor-list-refresh');
            resolve({valid: true, errorMessage: ''});
          }, (err) => {
            // scope.switch = _.cloneDeep(initSwitch);
            resolve({valid: false, errorMessage: err});
          });
      });
    };



    scope.open = (session_id) => {
      if(scope.showWizard) return;

      scope.isEdit = false;
      scope.title = this.translate("MODULES.FABRIC.MONITOR.WIZARD");
      scope.displayLabel.src_device.options = [];
      scope.displayLabel.dst_device.options = [];
      scope.monitorModel = {
        session_id: null,
        source_swt: null,
        source_port: '',
        direction: scope.displayLabel.direction.options[0],
        dst_switch: null,
        dst_port: '',
      };

      if(session_id){
        scope.monitorModel.session_id = session_id;
        scope.isEdit = true;
        scope.title = this.translate("MODULES.FABRIC.MONITOR.WIZARD.EDIT");
      }

      deviceDataManager.getDeviceConfigs().then((configs)=>{
        this.di._.forEach(configs,(config)=>{
          scope.displayLabel.src_device.options.push({'label':config['name'], 'value':config['id']})
          scope.displayLabel.dst_device.options.push({'label':config['name'], 'value':config['id']})
        });

        if(scope.isEdit){
          deviceDataManager.getMonitor(session_id).then((res)=>{
            let data = res.data;

            let src_device_index = this.di._.findIndex(scope.displayLabel.src_device.options,{'value': data['src']['device_id']});
            scope.monitorModel.source_swt = scope.displayLabel.src_device.options[src_device_index];

            scope.monitorModel.source_port = data['src']['port'] + '';

            let src_direction_index = this.di._.findIndex(scope.displayLabel.direction.options,{'value': data['src']['direction']});
            scope.monitorModel.direction = scope.displayLabel.direction.options[src_direction_index];

            let dst_device_index = this.di._.findIndex(scope.displayLabel.dst_device.options,{'value': data['target']['device_id']});
            scope.monitorModel.dst_switch = scope.displayLabel.dst_device.options[dst_device_index];

            scope.monitorModel.dst_port = data['target']['port'] + '';
            scope.showWizard = true;
          },(err)=>{
            scope.showWizard = true;
            this.di.$timeout(function () {
              scope.errorMessage = JSON.stringify(err.data.message);
            })
          })
        } else {
          deviceDataManager.getAllMonitor().then((res)=>{
            let monitors = res.data['sessions'];
            let session_id = null;
            if(!monitors){
              scope.monitorModel.session_id = 1;
            }else if(monitors.length >= 2 ){
              // this.di.$timeout(function () {
                this.di.notificationService.renderWarning(scope, this.translate('MODULES.FABRIC.MONITOR.WARNING.MAX_SESSION'));
                // scope.errorMessage = "目前系统已达到最大会话数！";
                scope.showWizard = false;
                return;
              // });
            } else if(monitors.length === 0){
              scope.monitorModel.session_id = 1;
            } else if(monitors.length === 1){
              if(parseInt(monitors[0]['session']) === 1){
                scope.monitorModel.session_id = 2;
              } else {
                scope.monitorModel.session_id = 1;
              }
            }
            scope.monitorModel.source_swt = scope.displayLabel.src_device.options[0];
            scope.monitorModel.dst_switch = scope.displayLabel.dst_device.options[0];
            scope.showWizard = true;
          },(err)=>{

          });

        }
      }, (err) => {
        this.di.$timeout(function () {
          scope.errorMessage = JSON.stringify(err.data.message);
        });
        scope.showWizard = true;
      });
    };

    unsubscribes.push(this.di.$rootScope.$on('monitor-wizard-show', ($event, session_id) => {
      scope.open(session_id);
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });
	}
}
MonitorEstablishController.$inject = MonitorEstablishController.getDI();
MonitorEstablishController.$$ngIsClass = true;