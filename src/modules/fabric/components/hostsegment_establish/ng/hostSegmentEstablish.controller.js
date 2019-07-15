export class HostSegmentEstablishController {
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
    HostSegmentEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unsubscribes = [];
    this.scope = this.di.$scope;
    let scope = this.di.$scope;
    let rootScope = this.di.$rootScope;
    let di = this.di;
    let deviceDataManager = this.di.deviceDataManager;
    this.translate = this.di.$filter('translate');

    scope.queue_regex = '^[0-7]$';
    scope.deviceId = null;
    scope.isEdit = false;


    scope.showWizard = false;
    scope.title = this.translate("MODULES.FABRIC.HOSTSEGMENT.WIZARD");
    scope.steps = [
      {
        id: 'step1',
        title: this.translate('MODULES.FABRIC.HOSTSEGMENT.WIZARD'),
        content: require('../template/hostsegment_establish'),
      }

    ];

    scope.hostSegmentModel = {
      segment_name: '',
      device: null,
      vlan: '',
      ip_address: '',
      ports: []
    };

    scope.displayLabel = {
      device:{'options':[]},
      tag:{'options':[
          {'label': 'Tag', 'value': 'tag'},
          {'label': 'Untag', 'value':'untag'}
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


    scope.deletePorts = (port) =>{
      this.di._.remove(scope.hostSegmentModel.ports, function(n) {
        return n.type === port.type && n.number === port.number;
      });
    };

    scope.addNormalPorts =() =>{
      scope.hostSegmentModel.ports.push({'type':'port','number':'', 'tagValue': scope.displayLabel.tag.options[0]})
    };

    scope.addLogicalPorts = () =>{
      scope.hostSegmentModel.ports.push({'type':'trunk','number':'', 'tagValue': scope.displayLabel.tag.options[0]})
    };

    scope.cancel = function(){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    let genPortValue4Sub = () =>{
      let ports = [];
      this.di._.forEach(scope.hostSegmentModel.ports, (port)=>{
        let portStr = '';
        if(port.type === 'port'){
          portStr = port.number +  '/' + port.tagValue.value;
        } else {
          portStr = 'trunk' + port.number +  '/' + port.tagValue.value;
        }
        ports.push(portStr)
      })
      return ports;
    };


    let translate = this.translate;
    scope.submit = function() {
      let inValidJson_Copy = angular.copy(inValidJson);
      let ip_arr = scope.hostSegmentModel.ip_address.split('/');
      let params = {};
      params['segment_name'] = scope.hostSegmentModel.segment_name;
      params['vlan'] = parseInt(scope.hostSegmentModel.vlan);
      params['device_id'] = scope.hostSegmentModel.device.value || '';
      params['ip_address'] = ip_arr[0];
      params['prefix_len'] = parseInt(ip_arr[1]);
      params['ports'] = genPortValue4Sub();


      di.$rootScope.$emit('page_hostsegment_es');
      if(!validCurrentDom('hostsegment_establish')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });

      }

      if(params['ports'].length === 0){
        inValidJson_Copy['errorMessage'] = translate('MODULES.FABRIC.HOSTSEGMENT.MSG.SELECT_ONE_PORT');
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }

      if(params['device_id'] === ""){
        inValidJson_Copy['errorMessage'] =  translate('MODULES.FABRIC.HOSTSEGMENT.MSG.SELECT_ONE_SWT');
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }


      return new Promise((resolve, reject) => {
        deviceDataManager.postHostSegment(params)
          .then(() => {
            rootScope.$emit('hostsegment-list-refresh');
            resolve({valid: true, errorMessage: ''});
          }, (err) => {
            // rootScope.$emit('hostsegment-list-refresh');
            // resolve({valid: true, errorMessage: ''});
            resolve({valid: false, errorMessage: err.data.message});
          });
      });
    };



    scope.open = (deviceId, port) => {
      if(scope.showWizard) return;

      scope.displayLabel.device = {'options':[]};
      scope.hostSegmentModel = {
        segment_name: '',
        device: null,
        vlan: '',
        gateway: '',
        ip_address: '',
        ports: []
      };
      deviceDataManager.getDeviceConfigs().then((configs)=>{
        this.di._.forEach(configs,(config)=>{
          // 顺网只允许openflow，主线目前也只允许openflow
          if(config['id'].toLocaleLowerCase().indexOf('of') === 0 && config['type'] === 'leaf') {
            // if(config['id'].toLocaleLowerCase().indexOf('grpc') != -1 || config['id'].toLocaleLowerCase().indexOf('rest') != -1){
            scope.displayLabel.device.options.push({'label': config['name'], 'value': config['id']})
            // }
          }
        });
        scope.hostSegmentModel.device = scope.displayLabel.device.options[0];

        scope.showWizard = true;
        }, (error) => {
        scope.showWizard = true;
        });
    };

    unsubscribes.push(this.di.$rootScope.$on('hostsegment-wizard-show', ($event) => {
      scope.open();
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });
  }
}
HostSegmentEstablishController.$inject = HostSegmentEstablishController.getDI();
HostSegmentEstablishController.$$ngIsClass = true;