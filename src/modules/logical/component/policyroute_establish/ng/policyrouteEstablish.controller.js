/**
 * Created by wls on 2018/6/7.
 */

export class PolicyRouteEstablishController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$log',
      '$q',
      '$timeout',
      '$filter',
      '_',
      'notificationService',
      'logicalDataManager',
      'manageDataManager',
      'deviceDataManager',
      'logicalService'
    ];
  }

  constructor(...args) {
    this.di = {};
    PolicyRouteEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let unsubscribes = [];
    const scope = this.di.$scope;
    const logicalDataManager = this.di.logicalDataManager;
    const rootScope = this.di.$rootScope;
    this.translate = this.di.$filter('translate');
    // scope.wizardHeight = {"height":'300px'};

    let di = this.di;

    scope.selected = {};
    scope.isTrunkEnable = false;

    scope.actionDisplayLabel = {'options':
        [{'label': this.translate('MODULES.LOGICAL.POLICY_ROUTER.PERMIT'),'value':'permit'},
          {'label': this.translate('MODULES.LOGICAL.POLICY_ROUTER.DENY'),'value':'deny'}]};
    scope.protocolDisplayLabel = {
      icmpLabel: {
        id: 'icmp',
        label: this.translate('MODULES.LOGICAL.TENANT.POLICY.PROTOCOL.ICMP'),
      },
      tcpLabel: {
        id: 'tcp',
        label: this.translate('MODULES.LOGICAL.TENANT.POLICY.PROTOCOL.TCP'),
      },
      udpLabel: {
        id: 'udp',
        label: this.translate('MODULES.LOGICAL.TENANT.POLICY.PROTOCOL.UDP'),
      }
    }

    scope.policyRouteEsModel = {
      name :null,
      segments: [],
      sequence_no: null,
      action: scope.actionDisplayLabel.options[0],
      curProtocol:null,
      curDevice:null,
      curPort: null,
      ingress_ports:[],
      protocol:{
        icmp: null,
        tcp:null,
        udp:null
      },
      match_ip:null,
      nexthop : null
    };

    scope.segmentDisplayLabel = {'options':[]};
    scope.deviceDisplayLabel = {'options':[]};
    scope.portDisplayLabel = {'options':[]};


    scope.showWizard = false;
    scope.title = this.translate('MODULES.LOGICAL.TENANT.POLICYROUTE.ADD');
    scope.steps = [
      {
        id: 'step1',
        title: 'info',
        content: require('../template/policyroute_establish'),
      }
    ];
    scope.isEdit = false;


    scope.addSegment = () =>{
      scope.policyRouteEsModel.segments.push(scope.policyRouteEsModel.curSegment.value);
      this.di._.remove(scope.segmentDisplayLabel.options, (item)=>{
        return scope.policyRouteEsModel.curSegment.value === item.value;
      });
      if(scope.segmentDisplayLabel.options.length > 0)
        scope.policyRouteEsModel.curSegment = scope.segmentDisplayLabel.options[0];
    };

    scope.removeSelectedSegment = (segment) => {
      scope.segmentDisplayLabel.options.push({'label':segment, 'value':segment});
      this.di._.remove(scope.policyRouteEsModel.segments, (item)=>{
        return segment === item;
      });
      if(scope.segmentDisplayLabel.options.length > 0)
        scope.policyRouteEsModel.curSegment = scope.segmentDisplayLabel.options[0];
    };


    scope.addDevicePort = () =>{
      if(scope.policyRouteEsModel.curDevice.value === null){
        return
      }
      if(scope.policyRouteEsModel.curPort.value === null){
        return
      }
      scope.policyRouteEsModel.ingress_ports.push({device: angular.copy(scope.policyRouteEsModel.curDevice),port: angular.copy(scope.policyRouteEsModel.curPort) });
    };

    scope.removeSelectedDevicePort = (ingress_port) => {
      this.di._.remove(scope.policyRouteEsModel.ingress_ports, (item)=>{
        return ingress_port.device.value  === item.device.value && ingress_port.port.value  === item.port.value;
      });
    };

    let formatDeviceLabel = (configs) => {
      let options = [];

      this.di._.forEach(configs,(config)=>{
        options.push({'label':config.name, 'value':config.id});
      });
      return options;
    };

    scope.deviceChange = ($value) =>{
      scope.portDisplayLabel = {'options':[{'label': this.translate('MODULES.LOGICAL.POLICY_ROUTER.SELECT'), 'value': null }]};
      scope.portDisplayLabel.options = scope.portDisplayLabel.options.concat(this.di._.sortBy(this.di._.map(scope._phyPorts[$value.value], (v)=>{return parseInt(v['port'])})).map((portNum)=>{
        return {'label': String(portNum), 'value': String(portNum)}
      }));

      scope.policyRouteEsModel.curPort = scope.portDisplayLabel.options[0];
    };

    this.di.$scope.open = (tenant, routeName, policyRouteName) => {
      if(scope.showWizard) return;

      if(policyRouteName){
        scope.isEdit = true;
      } else {
        scope.isEdit = false;
      }

      scope.policyRouteEsModel = {
        name :null,
        segments: [],
        sequence_no: null,
        action: scope.actionDisplayLabel.options[0],
        curProtocol:null,
        curDevice:null,
        curPort: null,
        ingress_ports:[],
        protocol:{
          icmp: null,
          tcp:null,
          udp:null
        },
        match_ip:null,
        nexthop : null
      };

      scope.segmentDisplayLabel = {'options':[]};
      scope.deviceDisplayLabel = {'options':[{'label':this.translate('MODULES.LOGICAL.POLICY_ROUTER.SELECT'), 'value': null }]};
      scope.portDisplayLabel = {'options':[{'label':this.translate('MODULES.LOGICAL.POLICY_ROUTER.SELECT'), 'value': null }]};

      scope.tenantName = tenant;
      scope.routeName = routeName;

      let segmentDefer = this.di.$q.defer();
      let policyRouteDefer = this.di.$q.defer();
      let deviceConfDefer = this.di.$q.defer();
      let portsDefer = this.di.$q.defer();
      let promises = [];
      let _segments = [];
      let _config = [];
      let _phyPorts = [];
      let _policyRoute = null;

      // this.di.logicalDataManager.getTenantSegments(tenant).then((res)=>{
      //   _segments = res.data.tenantSegments;
      //   segmentDefer.resolve();
      // },(err)=>{
      //   segmentDefer.reject(err)
      // });
      // promises.push(segmentDefer.promise);


      this.di.logicalDataManager.getLoigcalRouteByTenant(scope.tenantName).then((res)=> {
        let routers = res.data.routers;
        if (routers.length > 0) {
          let _router = routers[0];
          _segments = _router.interfaces;
        }
        segmentDefer.resolve();
      },(err)=>{
        segmentDefer.reject(err)
      });
      promises.push(segmentDefer.promise);

      this.di.deviceDataManager.getDeviceConfigs().then((configs)=>{
        _config = configs;
        deviceConfDefer.resolve();
      },(err)=>{
        deviceConfDefer.reject(err);
      });
      promises.push(deviceConfDefer.promise);

      this.di.deviceDataManager.getPorts().then((res)=>{
        if(res.data.ports){
          scope._phyPorts = this.di._.groupBy(res.data.ports , "element");
        }
        // console.log(scope._phyPorts);
        portsDefer.resolve();
      },(err)=>{
        portsDefer.reject(err);
      });
      promises.push(portsDefer.promise);


      if(scope.isEdit){
        this.di.logicalDataManager.getTenantLogicalPolicyRouteByName(tenant, routeName, policyRouteName).then((res)=>{
          _policyRoute = res.data;
          policyRouteDefer.resolve();
        },(err)=>{
          policyRouteDefer.reject(err);
        });
        promises.push(policyRouteDefer.promise);
      }

      Promise.all(promises).then(()=>{

        _segments.forEach((segment)=>{
          // if(segment.type === 'vlan')
          scope.segmentDisplayLabel.options.push({'label':segment, 'value': segment})
        });
        scope.policyRouteEsModel.curSegment = scope.segmentDisplayLabel.options[0];

        scope.deviceDisplayLabel.options = scope.deviceDisplayLabel.options.concat(formatDeviceLabel(_config));
        if(scope.deviceDisplayLabel.options.length > 0){
          scope.policyRouteEsModel.curDevice = scope.deviceDisplayLabel.options[0];
          scope.portDisplayLabel.options = scope.portDisplayLabel.options.concat(this.di._.sortBy(this.di._.map(scope._phyPorts[scope.policyRouteEsModel.curDevice.value], (v)=>{return parseInt(v['port'])})).map((portNum)=>{
            return {'label': String(portNum), 'value': String(portNum)}
          }));
          scope.policyRouteEsModel.curPort = scope.portDisplayLabel.options[0];
        }

        if(scope.isEdit && _policyRoute.name){

        }
        scope.showWizard = true;
        scope.$apply();
      })
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

    let translate = this.translate;

    let getSubmitJson = ()=> {
      let ingress_port_arr = scope.policyRouteEsModel.ingress_ports.map((ingress_port)=>{
        return ingress_port.device.value + '/' + ingress_port.port.value
      });

      let protocol_arr = [];
      if(scope.policyRouteEsModel.protocol.icmp){
        protocol_arr.push('icmp');
      }
      if(scope.policyRouteEsModel.protocol.tcp){
        protocol_arr.push('tcp');
      }
      if(scope.policyRouteEsModel.protocol.udp){
        protocol_arr.push('udp');
      }
      return {
        "name": scope.policyRouteEsModel.name,
        "ingress_segments": scope.policyRouteEsModel.segments,
        "ingress_ports": ingress_port_arr,
        "action": scope.policyRouteEsModel.action.value,
        "sequence_no": parseInt(scope.policyRouteEsModel.sequence_no),
        "protocols": protocol_arr,
        "match_ip": scope.policyRouteEsModel.match_ip,
        "nexthop": scope.policyRouteEsModel.nexthop
      }
    };

    scope.submit = function() {
      let inValidJson_Copy = angular.copy(inValidJson);

      di.$rootScope.$emit('page_policyroute_es');
      if(!validCurrentDom('policyroute_establish')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }

      if(scope.policyRouteEsModel.segments.length === 0 && scope.policyRouteEsModel.ingress_ports.length ===0){
        return new Promise((resolve, reject) => {
          inValidJson_Copy.errorMessage = this.translate('MODULES.LOGICAL.POLICY_ROUTER.SELECT_SEGMENT');
          resolve(inValidJson_Copy);
        });
      }

      if(!scope.policyRouteEsModel.protocol.icmp && !scope.policyRouteEsModel.protocol.tcp && !scope.policyRouteEsModel.protocol.udp ){
        return new Promise((resolve, reject) => {
          inValidJson_Copy.errorMessage = this.translate('MODULES.LOGICAL.POLICY_ROUTER.SELECT_PROTOCOL');
          resolve(inValidJson_Copy);
        });
      }

      let postJson = getSubmitJson();
      return new Promise((resolve, reject) => {
        logicalDataManager.postTenantLogicalPolicyRoute(scope.tenantName, scope.routeName,postJson)
          .then((res) => {
            rootScope.$emit('policyroute-config-success');
            resolve(validJson);
          }, (error) => {
            inValidJson_Copy.errorMessage = error.data;
            resolve(inValidJson_Copy);
          });
      });
    };


    scope.cancel = function(){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    unsubscribes.push(this.di.$rootScope.$on('policyroute-wizard-show', ($event, tenant, routeName, policyRouteName) => {
      scope.open(tenant, routeName, policyRouteName);
    }));

    this.di.$scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

PolicyRouteEstablishController.$inject = PolicyRouteEstablishController.getDI();
PolicyRouteEstablishController.$$ngIsClass = true;


