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

    scope.allDeviceLabel = {options: []};
    // scope.memberModel.vlanDevice = scope.allDeviceLabel.options[2];



    let init = () =>{
      scope.selected.memberType = scope.memberTypeLabel.options[0];
      scope.selected.vlanType = scope.vlanTypeLabel.options[0];
      scope.selected.vxlanType = scope.vxlanTypeLabel.options[0];
      scope.selected.vxlanAccessType = scope.vxlanAccessTypeLabel.options[0];


      scope.allDeviceLabel = {options: []};
      scope.selected.vlanDevice = {};
      scope.selected.vxlanAccessDevice = {}

      scope.isTypeDisable = false;
      scope.isVlanDeviceDisable = false;
      scope.isVlanTypeDisable = false;
      // scope.isVxlanTypeDisable = false;
      scope.isVxlanTypeDisable = false;
      scope.isVxlanNameDisable = false;
      scope.isVxlanAccessTypeDisable = false;



      scope.memberModel = {
        vlanPorts :[],
        vlanLogicalPorts:[],
        vlanMacBased:[],
        vxlanIps : [],
        vlan: {},
        vxlan :{
          name: "",
          network: {},
          access: {},
        }
      };
    };




    init();

    scope.showWizard = false;
    scope.title = this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.ADD');
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
      return options;
    };

    this.di.$scope.open = (param) => {
      if(scope.showWizard) return;

      scope.tenantName = param.tenantName;
      scope.segmentName = param.segmentName;
      // scope.tenantEsModel.type = scope.tenantTypeLabel.options[0];;

      init();
      if(param.type){
        // scope.isEdit = true;
        scope.selected.memberType = this.di._.find(scope.memberTypeLabel.options, {'value':param.type });
        scope.isTypeDisable = true;
      } else{
        // scope.isEdit = false;
      }
      scope.title = this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.ADD');
      this.di.deviceDataManager.getDeviceConfigs().then((configs)=>{
        scope.allDeviceLabel.options = scope.allDeviceLabel.options.concat(formatDeviceLabel(configs));
        if(param.type){
          let data = param['data'];
          if(data){
            scope.title = this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.EDIT');
          }
          if(param.type === 'vlan'){
            if(data){
              scope.selected.vlanDevice = this.di._.find(scope.allDeviceLabel.options, {'value':data['device_id'] });
              if(!scope.memberModel.vlanDevice){
                scope.errorMessage = "Device Id" + data['device_id']  + "不存在！";
              }
              scope.isVlanDeviceDisable = true;

              scope.memberModel.vlanPorts = _format_ports_recieved(data['ports']);
              scope.memberModel.vlanLogicalPorts =_format_logical_ports_recieved(data['logical_ports']);
              scope.memberModel.vlanMacBased = _format_mac_based_vlans_recieved(data['mac_based_vlans']);
            } else {
              scope.selected.vlanDevice = scope.allDeviceLabel.options[0];
            }
          } else if(param.type === 'vxlan'){
            if(data){
              if(data['name']){
                scope.isVxlanNameDisable = true;
                scope.isVxlanTypeDisable = true;
                scope.memberModel.vxlan.name = data['name'];
                if(data['ip_addresses']){
                  //network
                  scope.selected.vxlanType = this.di._.find(scope.vxlanTypeLabel.options,  {'value':'network'});
                  scope.memberModel.vxlanIps = _format_vxlan_ips(data['ip_addresses'])
                } else {
                  //access
                  scope.selected.vxlanType = this.di._.find(scope.vxlanTypeLabel.options,  {'value':'access'});
                  if(data['type']){
                    scope.isVxlanAccessTypeDisable = true;
                    scope.selected.vxlanAccessType = this.di._.find(scope.vxlanAccessTypeLabel.options,  {'value':data['type']});
                    if(data['type'] === 'normal'){
                      // let device_port_arr = data['port'].split(':');
                      let _index  = data['port'].lastIndexOf(':');
                      // console.log(xxx.substring(0, _index))
                      // console.log(xxx.substring(ind + 1, xxx.length))
                      scope.memberModel.vxlan.access.port = _index !==-1?data['port'].substring(_index + 1, data['port'].length):'';
                      scope.selected.vxlanAccessDevice = _index !==-1? this.di._.find(scope.allDeviceLabel.options, {'value':data['port'].substring(0, _index)}):{};

                    } else {
                      scope.memberModel.vxlan.access.server_mac = data['port']
                    }
                    scope.memberModel.vxlan.access.vlan = data['vlan'];
                  }

                }
              }
            } else {
              if(param['vxlan_type']){
                scope.selected.vxlanType = this.di._.find(scope.vxlanTypeLabel.options,  {'value':param['vxlan_type']});
                scope.isVxlanTypeDisable = true;
                if(param['vxlan_type'] === 'access')
                scope.selected.vxlanAccessDevice =  scope.allDeviceLabel.options[0];
              }
            }
          }

        }
        scope.showWizard = true;
      },()=>{
        scope.showWizard = true;
      });


    };

    let _format_ports_recieved = (ports) =>{
      if(ports === null || ports === ''){
        return [];
      } else {
        let portArr = ports.split(',');
        portArr = this.di._.map(portArr, this.di._.trim);
        return this.di._.map(portArr, (item)=>{
          let arr = item.split('/');
          let port = arr[0];
          let tag = arr[1];
          return {'port':port, 'tagValue': this.di._.find(scope.tagDisplayLabel.options, { 'value': tag })}
        });
      }
    };

    let _format_logical_ports_recieved = (logical_ports) =>{
      if(logical_ports === null || logical_ports === ''){
        return [];
      } else {
        let portArr = logical_ports.split(',');
        portArr = this.di._.map(portArr, this.di._.trim);
        return this.di._.map(portArr, (item)=>{
          let arr = item.split('/');
          let trunk = arr[0];
          let tag = arr[1];
          return {'trunk':trunk, 'tagValue': this.di._.find(scope.tagDisplayLabel.options, { 'value': tag })}
        });
      }
    };

    let _format_mac_based_vlans_recieved = (mac_based) =>{
      if(mac_based === null || mac_based === ''){
        return [];
      } else {
        let mac_based_arr = mac_based.split(',');
        mac_based_arr = this.di._.map(mac_based_arr, this.di._.trim);
        return this.di._.map(mac_based_arr, (item)=>{
          let arr = item.split('/');
          let mac = arr[0];
          let mask = arr[1];
          return {'mac':mac, 'mask': mask}
        });
      }
    };

    let _format_vxlan_ips = (ips) =>{
      if(ips === null || ips === ''){
        return [];
      } else {
        let ipsArr = ips.split(',');
        ipsArr = this.di._.map(ipsArr, this.di._.trim);
        return this.di._.map(ipsArr, (item)=>{
          return {'ip':item}
        });
      }
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
                                              'switch': scope.selected.vxlanAccessDevice.value,
                                              'port': scope.memberModel.vxlan.access.port,
                                              'vlan': scope.memberModel.vxlan.access.vlan
            }]
          } else if(scope.selected.vxlanAccessType.value === 'openstack'){
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
          logicalDataManager.postTenantSegmentMemberVlan(scope.tenantName, scope.segmentName, scope.selected.vlanDevice.value, postJson)
            .then((res) => {
              rootScope.$emit('segment-member-refresh','vlan');
              resolve(validJson);
            }, (error) => {
              inValidJson_Copy.errorMessage = error.data;
              resolve(inValidJson_Copy);
            });

        } else {
          logicalDataManager.postTenantSegmentMemberVxlan(scope.tenantName, scope.segmentName, postJson)
            .then((res) => {
              rootScope.$emit('segment-member-refresh','vxlan_' + scope.selected.vxlanType.value);
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


