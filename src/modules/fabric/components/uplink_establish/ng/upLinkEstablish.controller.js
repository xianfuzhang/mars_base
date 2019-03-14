export class UpLinkEstablishController {
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
    UpLinkEstablishController.getDI().forEach((value, index) => {
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
    scope.isOpenFlow = false;


    scope.showWizard = false;
    scope.title = this.translate("MODULES.FABRIC.UPLINK.WIZARD");
    scope.steps = [
      {
        id: 'step1',
        title: this.translate('MODULES.FABRIC.UPLINK.WIZARD'),
        content: require('../template/uplink_establish'),
      }

    ];

    scope.upLinkModel = {
      segment_name: '',
      device: null,
      vlan: '',
      gateway: '',
      gateway_mac:'',
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
      this.di._.remove(scope.upLinkModel.ports, function(n) {
        return n.type === port.type && n.number === port.number;
      });
    };

    scope.addNormalPorts =() =>{
      scope.upLinkModel.ports.push({'type':'port','number':'', 'tagValue': scope.displayLabel.tag.options[0]})
    };

    scope.addLogicalPorts = () =>{
      scope.upLinkModel.ports.push({'type':'trunk','number':'', 'tagValue': scope.displayLabel.tag.options[0]})
    };

    scope.cancel = function(){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    let genPortValue4Sub = () =>{
      let ports = [];
      this.di._.forEach(scope.upLinkModel.ports, (port)=>{
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


    scope.submit = function() {
      let inValidJson_Copy = angular.copy(inValidJson);

      let params = {};
      params['segment_name'] = scope.upLinkModel.segment_name;
      params['vlan'] = parseInt(scope.upLinkModel.vlan);
      params['device_id'] = scope.upLinkModel.device.value || '';
      params['gateway'] = scope.upLinkModel.gateway;
      params['gateway_mac'] = scope.upLinkModel.gateway_mac;
      params['ip_address'] = scope.upLinkModel.ip_address;
      params['ports'] = genPortValue4Sub();


      di.$rootScope.$emit('page_uplink_es');
      if(!validCurrentDom('uplink_establish')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });

      }

      if(params['ports'].length === 0){
        inValidJson_Copy['errorMessage'] = "请至少添加一个端口!";
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }

      if(params['device_id'] === ""){
        inValidJson_Copy['errorMessage'] = "请选择一个交换机!";
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }


      return new Promise((resolve, reject) => {
        deviceDataManager.postUpLink(params)
          .then(() => {
            rootScope.$emit('uplink-list-refresh');
            resolve({valid: true, errorMessage: ''});
          }, (err) => {
            // scope.switch = _.cloneDeep(initSwitch);
            resolve({valid: false, errorMessage: err});
          });
      });
    };



    scope.open = (deviceId, port) => {
      if(scope.showWizard) return;

      scope.displayLabel.device = {'options':[]};
      scope.upLinkModel = {
        segment_name: '',
        device: null,
        vlan: '',
        gateway: '',
        ip_address: '',
        ports: []
      };
      deviceDataManager.getDeviceConfigs().then((configs)=>{
        this.di._.forEach(configs,(config)=>{
          // if(config['id'].toLocaleLowerCase().indexOf('grpc') != -1 || config['id'].toLocaleLowerCase().indexOf('rest') != -1){
          if(config['type'] === 'leaf') {
            scope.displayLabel.device.options.push({'label': config['name'], 'value': config['id']})
          }
          // }

        });
        scope.upLinkModel.device = scope.displayLabel.device.options[0];

        scope.showWizard = true;
      }, (error) => {
        scope.showWizard = true;
      });
    };

    unsubscribes.push(this.di.$rootScope.$on('uplink-wizard-show', ($event) => {
      scope.open();
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });
  }
}
UpLinkEstablishController.$inject = UpLinkEstablishController.getDI();
UpLinkEstablishController.$$ngIsClass = true;