/**
 * Created by wls on 2018/6/7.
 */

export class SegmentMemberEstablishController {
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
      'deviceDataManager',
      'logicalService'
    ];
  }

  constructor(...args) {
    this.di = {};
    SegmentMemberEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let unsubscribes = [];
    const scope = this.di.$scope;
    const logicalDataManager = this.di.logicalDataManager;
    const rootScope = this.di.$rootScope;
    this.translate = this.di.$filter('translate');

    scope.memberTypeLabel = this.di.logicalService.getSegmentMemberTypeLabel();
    scope.vlanTypeLabel = this.di.logicalService.getSegmentMemberVlanTypeLabel();
    scope.vxlanTypeLabel = this.di.logicalService.getSegmentMemberVxlanTypeLabel();
    scope.vxlanAccessTypeLabel = this.di.logicalService.getSegmentMemberVxlanAccessTypeLabel();
    scope.tagDisplayLabel = this.di.logicalService.getSegmentMemberTagLabel();

    // scope.memberType = scope.memberTypeLabel.options[0];
    // scope.vlanType = scope.vlanTypeLabel.options[0];
    // scope.vxlanType = scope.vxlanTypeLabel.options[0];
    // scope.vxlanAccessType = scope.vxlanAccessTypeLabel.options[0];

    let di = this.di;

    scope.selected = {};

    scope.memberModel = {
      vlanPorts :[],
      vlanLogicalPorts:[],
      vlanMacBased:[],
      vxlanIps : [],
      vlan: { },
      vxlan :{
        name: "",
        network: {},
        access: {},
      }
    };

    let init = () =>{
      scope.selected.memberType = scope.memberTypeLabel.options[0];
      scope.selected.vlanType = scope.vlanTypeLabel.options[0];
      scope.selected.vxlanType = scope.vxlanTypeLabel.options[0];
      scope.selected.vxlanAccessType = scope.vxlanAccessTypeLabel.options[0];

      scope.memberModel = {
        vlanPorts :[],
        vlanLogicalPorts:[],
        vlanMacBased:[],
        vxlanIps : [],
        vlan: { },
        vxlan :{
          name: "",
          network: {},
          access: {},
        }
      };
    };




    init();

    scope.showWizard = false;
    scope.title = this.translate('MODULES.LOGICAL.TENANT.TABLE.ADD');
    scope.steps = [
      {
        id: 'step1',
        title: 'info',
        content: require('../template/segmentmember_establish'),
      }
    ];


    scope.isEdit = false;

    let formatDeviceLabel = (configs) => {
      let options = [];
      this.di._.forEach(configs,(config)=>{
        options.push({'label':config.name, 'value':config.id});
      });
      return {'options':options};
    };

    this.di.$scope.open = (param) => {
      if(scope.showWizard) return;

      scope.tenantName = param.tenantName;
      scope.segmentName = param.segmentName;
      scope.tenantEsModel.type = scope.tenantTypeLabel.options[0];;

      if(param){
        scope.isEdit = true;
        // scope.tenantEsModel.name = tenant.name;
        // scope.tenantEsModel.type = _getType(tenant.type)
      } else{
        scope.isEdit = false;
      }
      init();

      this.di.deviceDataManager.getDeviceConfigs().then((configs)=>{
        scope.allDeviceLabel = formatDeviceLabel(configs);
        scope.showWizard = true;
      },()=>{
        scope.showWizard = true;
      });


    };

    scope.addVlanPorts = () => {
      scope.memberModel.vlanPorts.push({'port':'', 'tagValue': scope.tagDisplayLabel.options[0]})
    };

    scope.deleteVlanPorts = (port) => {
      this.di._.remove(scope.memberModel.vlanPorts, function(n) {
        return n.port === port.port;
      });
    };

    scope.addVlanLogicalPorts = () => {
      scope.memberModel.vlanLogicalPorts.push({'trunk':'', 'tagValue': scope.tagDisplayLabel.options[0]})
    };

    scope.deleteVlanLogicalPorts = (port) => {
      this.di._.remove(scope.memberModel.vlanLogicalPorts, function(n) {
        return n.trunk === port.trunk;
      });
    };

    scope.addVlanMacBased = () => {
      scope.memberModel.vlanMacBased.push({'mac':'', 'mask': ''});
    };

    scope.deleteVlanMacBased = (macbased) => {
      this.di._.remove(scope.memberModel.vlanMacBased, function(n) {
        return macbased.mac === n.mac && macbased.mask === n.mask;
      });
    };


    scope.addVxlanIps = () => {
      scope.memberModel.vxlanIps.push({'ip':''});
    };

    scope.deleteVxlanIps = (ip) => {
      this.di._.remove(scope.memberModel.vxlanIps, function(n) {
        return ip.ip === n.ip;
      });
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

    let translate = this.translate;


    let _formatVlanPorts = () =>{
      let ports = [];
      this.di._.forEach(scope.memberModel.vlanPorts,(port)=>{
        ports.push(port.port + '/' + port.tagValue.value)
      });
      return ports;
    };


    let _formatVlanLogicalPorts = () =>{
      let logical_ports = [];
      this.di._.forEach(scope.memberModel.vlanLogicalPorts,(port)=>{
        logical_ports.push(port.trunk + '/' + port.tagValue.value)
      });
      return logical_ports;
    };

    let _formatVlanMacbased = () =>{
      let macbaseds= [];
      this.di._.forEach(scope.memberModel.vlanMacBased,(mac)=>{
        macbaseds.push(mac.mac + '/' + mac.mask)
      });
      return macbaseds;
    };

    let _formatVxlanIPs = () =>{
      let ips= [];
      this.di._.forEach(scope.memberModel.vxlanIps,(ip)=>{
        ips.push(ip.ip)
      });
      return ips;
    };


    let _getVxlanURL = () =>{

    };

    let _getVlanURL = ()=>{

    };

    let getSubmitJson = () =>{
      // let ret_json = {'url':'','param':{}};
      let param = {};
      if(scope.selected.memberType.value === 'vlan'){
        param['type'] = scope.selected.vlanType.value;
        if(scope.selected.vlanType.value === 'normal'){
          param['ports'] = _formatVlanPorts();
        } else if (scope.selected.vlanType.value === 'logical'){
          param['logical_ports'] = _formatVlanLogicalPorts();
        } else if (scope.selected.vlanType.value === 'macbased'){
          param['mac_based_vlans'] = _formatVlanMacbased();
        }
      } else {

        if(scope.selected.vxlanType.value === 'network'){
          param['network_port'] = [{'name': scope.memberModel.vxlan.name, 'ip_addresses': _formatVxlanIPs() }];
        } else {
          if(scope.selected.vxlanAccessType.value === 'normal'){
            param['access_port'] = [{'name': scope.memberModel.vxlan.name,
                                              'type':scope.selected.vxlanAccessType.value,
                                              'switch': scope.memberModel.vxlan.access.device.value,
                                              'port': scope.memberModel.vxlan.access.port,
                                              'vlan': scope.memberModel.vxlan.access.vlan
            }]
          } else if(scope.selected.vxlanAccessType === 'normal'){
            param['access_port'] = [{'name': scope.memberModel.vxlan.name,
              'type':scope.selected.vxlanAccessType.value,
              'vlan': scope.memberModel.vxlan.access.vlan,
              'server_mac': scope.memberModel.vxlan.access.server_mac}]
          }

        }

      }
      return param;


    };

    let checkSubmitValue = () =>{
      // scope.memberType = scope.memberTypeLabel.options[0];
      // scope.vlanType = scope.vlanTypeLabel.options[0];
      // scope.vxlanType = scope.vxlanTypeLabel.options[0];
      // scope.vxlanAccessType = scope.vxlanAccessTypeLabel.options[0];
      let validJson_Copy = angular.copy(validJson);
      if(scope.selected.memberType.value === 'vlan'){
        if(scope.selected.vlanType.value === 'normal' && scope.memberModel.vlanPorts.length === 0){
          validJson_Copy.valid = false;
          validJson_Copy.errorMessage = '请添加端口';
        }
        if(scope.selected.vlanType.value === 'logical' && scope.memberModel.vlanLogicalPorts.length === 0){
          validJson_Copy.valid = false;
          validJson_Copy.errorMessage = '请添加逻辑端口';
        }
        if(scope.selected.vlanType.value === 'macbased' && scope.memberModel.vlanMacBased.length === 0){
          validJson_Copy.valid = false;
          validJson_Copy.errorMessage = '请添加MAC';
        }
      } else {
        if(scope.selected.vxlanType.value === 'network' && scope.memberModel.vxlanIps.length === 0){
          validJson_Copy.valid = false;
          validJson_Copy.errorMessage = '请添加IP';
        }
      }

      return validJson_Copy;
    };


    scope.submit = function() {
      let inValidJson_Copy = angular.copy(inValidJson);

      di.$rootScope.$emit('page_segmentmember_es');
      if(!validCurrentDom('segmentmember_establish')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }

      let validJson = checkSubmitValue();
      if(validJson.valid === false){
        return new Promise((resolve, reject) => {
          resolve(validJson);
        });
      }

      let postJson = getSubmitJson();


      return new Promise((resolve, reject) => {
        if(scope.selected.memberType.value === 'vlan'){
          logicalDataManager.postTenantSegmentMemberVlan(scope.tenantName, scope.segmentName, scope.memberModel.vlan.device.value, postJson)
            .then((res) => {
              rootScope.$emit('tenent-refresh',true);
              resolve(validJson);
            }, (error) => {
              inValidJson_Copy.errorMessage = error.data;
              resolve(inValidJson_Copy);
            });

        } else {
          logicalDataManager.postTenantSegmentMemberVxlan(scope.tenantName, scope.segmentName, postJson)
            .then((res) => {
              // rootScope.$emit('tenent-refresh',true);
              resolve(validJson);
            }, (error) => {
              inValidJson_Copy.errorMessage = error.data;
              resolve(inValidJson_Copy);
            });
        }
      });
    };


    scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    unsubscribes.push(this.di.$rootScope.$on('segmentmember-wizard-show', ($event, param) => {
      scope.open(param);
    }));

    this.di.$scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

SegmentMemberEstablishController.$inject = SegmentMemberEstablishController.getDI();
SegmentMemberEstablishController.$$ngIsClass = true;


