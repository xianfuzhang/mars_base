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
      'manageDataManager',
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
    scope.tagDisplayLabel['hint'] = this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.TAG');
    scope.trunkDisplayLabel = {'options':[], 'hint': this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.ACTION.ADD_LOGICAL_PORTS')};
    scope.vlanDeviceDisplayLabel = {'options':[], 'hint': this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.PORT')};

    // scope.memberType = scope.memberTypeLabel.options[0];
    // scope.vlanType = scope.vlanTypeLabel.options[0];
    // scope.vxlanType = scope.vxlanTypeLabel.options[0];
    // scope.vxlanAccessType = scope.vxlanAccessTypeLabel.options[0];

    let di = this.di;

    scope.selected = {};
    scope.isTrunkEnable = false;

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

    scope._phyPorts = {};
    scope._pvids = {};
    scope.allDeviceLabel = {options: []};
    // scope.memberModel.vlanDevice = scope.allDeviceLabel.options[2];



    let init = () =>{
      scope.vlanTypeLabel = this.di.logicalService.getSegmentMemberVlanTypeLabel();

      scope.selected.memberType = scope.memberTypeLabel.options[0];
      scope.selected.vlanType = scope.vlanTypeLabel.options[0];
      scope.selected.vxlanType = scope.vxlanTypeLabel.options[0];
      scope.selected.vxlanAccessType = scope.vxlanAccessTypeLabel.options[0];


      scope.allDeviceLabel = {options: []};
      scope.selected.vlanDevice = {};
      scope.selected.vxlanAccessDevice = {};

      scope.logical_ports = {};

      scope.isTypeDisable = false;
      scope.isVlanDeviceDisable = false;
      scope.isVlanTypeDisable = false;
      // scope.isVxlanTypeDisable = false;
      scope.isVxlanTypeDisable = false;
      scope.isVxlanNameDisable = false;
      scope.isVxlanAccessTypeDisable = false;
      scope.isVxlanNetworkUplinkDisable = false;

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

    let _formatLogicalPort = (ports) =>{
      this.di._.forEach(ports,(port)=>{
        if(!scope.logical_ports[port.members[0]['device_id']]){
          scope.logical_ports[port.members[0]['device_id']] = [];
        }

        if(port.members.length === 1){
          scope.logical_ports[port.members[0]['device_id']].push({'label':port.name, 'value': port.name });
          this.di._.remove(scope._phyPorts[port.members[0]['device_id']], (port_info)=>{
            return port_info['port'] === String(port.members[0]['port']);
          });
          return true;
        }
        if(port.members[0]['device_id'] !== port.members[1]['device_id'] && !scope.logical_ports[port.members[1]['device_id']]){
          scope.logical_ports[port.members[1]['device_id']] = [];
        }

        scope.logical_ports[port.members[0]['device_id']].push({'label':port.name, 'value': port.name });
        scope.logical_ports[port.members[1]['device_id']].push({'label':port.name, 'value': port.name });

        this.di._.remove(scope._phyPorts[port.members[0]['device_id']], (port_info)=>{
          return port_info['port'] === String(port.members[0]['port']);
        });

        this.di._.remove(scope._phyPorts[port.members[1]['device_id']], (port_info)=>{
          return port_info['port'] === String(port.members[1]['port']);
        });

      });
    };

    this.di.$scope.open = (param) => {
      if(scope.showWizard) return;

      scope.tenantName = param.tenantName;
      scope.segmentName = param.segmentName;

      init();
      if(param.type){
        scope.selected.memberType = this.di._.find(scope.memberTypeLabel.options, {'value':param.type });
        scope.isTypeDisable = true;
      } else{
        // scope.isEdit = false;
      }
      if (param.type === 'vxlan' && param.vxlan_type === 'network') {
        scope.vxlanUplinkLabel = {};
        scope.vxlanUplinkLabel.options = param.uplinks.map((uplink) => {
          return {'label': uplink.segment_name, 'value': uplink.segment_name};
        });
        scope.selected.vxlanNetworkUplink = scope.vxlanUplinkLabel.options[0];
      }
      scope.title = this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.ADD');

      this.di.manageDataManager.getApplication("com.nocsys.logicalport").then((res) => {
        if(res.data['state'] === 'ACTIVE'){
          _open(true, param)
          scope.isTrunkEnable = true;
        } else {
          _open(true, param)
          scope.isTrunkEnable = false;
        }
      },(err)=>{
        _open(false, param);
        scope.isTrunkEnable = false;
        console.log("Error occur when getApplication in _update_single_item " + JSON.stringify(err))
      });
    };

    let _formatPvids = (pvids)=>{
      let res = {};
      this.di._.forEach(pvids, (pvid)=>{
        let keys = this.di._.keys(pvid);
        this.di._.forEach(keys, (key)=>{
          res[key] = pvid[key];
        })
      });
      return res;
    };

    let _open = (isTrunkEnable, param) =>{
      let deviceConfDefer = this.di.$q.defer();
      let trunkDefer = this.di.$q.defer();
      let portsDefer = this.di.$q.defer();
      let promises = [];
      let _ports = [];
      let _config = [];
      // let _phyPorts = {};

      if(isTrunkEnable){
        this.di.deviceDataManager.getLogicalPortsList().then((ports)=>{
          _ports = ports;
          trunkDefer.resolve();
        },(err)=>{
          trunkDefer.reject(err)
        });
        promises.push(trunkDefer.promise)
      }

      this.di.deviceDataManager.getDeviceConfigs().then((configs)=>{
        _config = configs;
        deviceConfDefer.resolve();
      },(err)=>{
        deviceConfDefer.reject(err);
      });
      promises.push(deviceConfDefer.promise);

      if(param.type === 'vlan'){
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


        this.di.logicalDataManager.getTenantPortUntagList().then((res)=>{
          if(res.data.pvids){
            scope._pvids = _formatPvids(res.data.pvids);
          }
        })
      }

      Promise.all(promises).then(()=>{
        scope.allDeviceLabel.options = scope.allDeviceLabel.options.concat(formatDeviceLabel(_config));
        scope.selected.vxlanAccessDevice = scope.allDeviceLabel.options[0];
        scope.selected.vlanDevice = scope.allDeviceLabel.options[0];
        // scope.trunkDisplayLabel.options = logical_ports?logical_ports:[];


        if(scope.selected.vlanDevice.value.indexOf('grpc') === 0){
          scope.isSonicDevice = true;
        } else {
          scope.isSonicDevice = false;
        }


        if(param.type){
          let data = param['data'];
          if(data){
            scope.title = this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.EDIT');
          }
          if(param.type === 'vlan'){
            if(data){
              scope.selected.vlanDevice = this.di._.find(scope.allDeviceLabel.options, {'label':data['device_id'] });
              if(scope.selected.vlanDevice.value.indexOf('grpc') === 0){
                scope.isSonicDevice = true;
              } else {
                scope.isSonicDevice = false;
              }


              if(!scope.memberModel.vlanDevice){
                scope.errorMessage = this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.ERROR_DEVICE', {'deviceId': data['device_id']});
              }
              scope.isVlanDeviceDisable = true;

              scope.memberModel.vlanPorts = _format_ports_recieved(data['ports']);
              scope.memberModel.vlanLogicalPorts =_format_logical_ports_recieved(data['logical_ports']);
              scope.memberModel.vlanMacBased = _format_mac_based_vlans_recieved(data['mac_based_vlans']);

              if(scope.memberModel.vlanPorts.length > 0){
                this.di._.remove(scope.vlanTypeLabel.options,(item)=>{
                  return item['value'] === 'normal';
                })
              }

              if(scope.memberModel.vlanLogicalPorts.length > 0){
                this.di._.remove(scope.vlanTypeLabel.options,(item)=>{
                  return item['value'] === 'logical';
                })
              }

              if(scope.memberModel.vlanMacBased.length > 0){
                this.di._.remove(scope.vlanTypeLabel.options,(item)=>{
                  return item['value'] === 'macbased';
                })
              }

              scope.selected.vlanType = scope.vlanTypeLabel.options[0];

            } else {
              if(param.vlan_devices){
                this.di._.remove(scope.allDeviceLabel.options, (option)=>{
                  if(this.di._.findIndex(param.vlan_devices, (deviceId)=>{return option.value === deviceId}) !== -1){
                    return true
                  } else {
                    return false
                  }
                });
                scope.selected.vlanDevice = scope.allDeviceLabel.options[0];
                if(scope.selected.vlanDevice.value.indexOf('grpc') === 0){
                  scope.isSonicDevice = true;
                } else {
                  scope.isSonicDevice = false;
                }
                // scope.allDeviceLabel.options = [];
                if(scope.allDeviceLabel.options.length === 0){
                  this.di.notificationService.renderWarning(scope, this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.NO_AVAILABLE_DEVICE'));
                  scope.showWizard = false;
                  scope.$apply();
                  return;
                }
              }

              scope.selected.vlanDevice = scope.allDeviceLabel.options[0];
              if(scope.selected.vlanDevice.value.indexOf('grpc') === 0){
                scope.isSonicDevice = true;
              } else {
                scope.isSonicDevice = false;
              }
            }
            if(_ports.length > 0){
              _formatLogicalPort(_ports);
              let logical_ports = scope.logical_ports[scope.selected.vlanDevice.value];
              scope.trunkDisplayLabel.options = logical_ports?logical_ports:[];
            }
            scope.vlanDeviceDisplayLabel.options = this.di._.sortBy(this.di._.map(scope._phyPorts[scope.selected.vlanDevice.value], (v)=>{return parseInt(v['port'])})).map((portNum)=>{
              return {'label': String(portNum), 'value': String(portNum)}
            });
            scope.vlanDeviceDisplayLabel.options.unshift({'label':this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.ALL_PORTS'), 'value':'any'})
          } else if(param.type === 'vxlan'){
            if(data){
              if(data['name']){
                scope.isVxlanNameDisable = true;
                scope.isVxlanTypeDisable = true;
                scope.isVxlanNetworkUplinkDisable = true;
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
                      let _index  = data['port'].lastIndexOf(':');
                      scope.memberModel.vxlan.access.port = _index !==-1?data['port'].substring(_index + 1, data['port'].length):'';
                      scope.selected.vxlanAccessDevice = _index !==-1? this.di._.find(scope.allDeviceLabel.options, {'label':data['port'].substring(0, _index)}):{};
                    } else {
                      scope.memberModel.vxlan.access.server_mac = data['port']
                    }
                    scope.memberModel.vxlan.access.vlan = data['vlan'];
                  }
                }
                if (data['uplink_segment']) {
                  scope.selected.vxlanNetworkUplink = this.di._.find(scope.vxlanUplinkLabel.options,  {'value':data['uplink_segment']});
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
        scope.$apply();
      }).catch((e)=>{
        scope.showWizard = true;
        scope.$apply();
      });



      // this.di.deviceDataManager.getDeviceConfigs().then((configs)=>{
      //   scope.allDeviceLabel.options = scope.allDeviceLabel.options.concat(formatDeviceLabel(configs));
      //   scope.selected.vxlanAccessDevice = scope.allDeviceLabel.options[0];
      //   scope.selected.vlanDevice = scope.allDeviceLabel.options[0];
      //
      //   if(param.type){
      //     let data = param['data'];
      //     if(data){
      //       scope.title = this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.EDIT');
      //     }
      //     if(param.type === 'vlan'){
      //       if(data){
      //         scope.selected.vlanDevice = this.di._.find(scope.allDeviceLabel.options, {'label':data['device_id'] });
      //         if(!scope.memberModel.vlanDevice){
      //           scope.errorMessage = "Device Id" + data['device_id']  + "不存在！";
      //         }
      //         scope.isVlanDeviceDisable = true;
      //
      //         scope.memberModel.vlanPorts = _format_ports_recieved(data['ports']);
      //         scope.memberModel.vlanLogicalPorts =_format_logical_ports_recieved(data['logical_ports']);
      //         scope.memberModel.vlanMacBased = _format_mac_based_vlans_recieved(data['mac_based_vlans']);
      //       } else {
      //         scope.selected.vlanDevice = scope.allDeviceLabel.options[0];
      //       }
      //     } else if(param.type === 'vxlan'){
      //       if(data){
      //         if(data['name']){
      //           scope.isVxlanNameDisable = true;
      //           scope.isVxlanTypeDisable = true;
      //           scope.memberModel.vxlan.name = data['name'];
      //           if(data['ip_addresses']){
      //             //network
      //             scope.selected.vxlanType = this.di._.find(scope.vxlanTypeLabel.options,  {'value':'network'});
      //             scope.memberModel.vxlanIps = _format_vxlan_ips(data['ip_addresses'])
      //           } else {
      //             //access
      //             scope.selected.vxlanType = this.di._.find(scope.vxlanTypeLabel.options,  {'value':'access'});
      //             if(data['type']){
      //               scope.isVxlanAccessTypeDisable = true;
      //               scope.selected.vxlanAccessType = this.di._.find(scope.vxlanAccessTypeLabel.options,  {'value':data['type']});
      //               if(data['type'] === 'normal'){
      //                 let _index  = data['port'].lastIndexOf(':');
      //                 scope.memberModel.vxlan.access.port = _index !==-1?data['port'].substring(_index + 1, data['port'].length):'';
      //                 scope.selected.vxlanAccessDevice = _index !==-1? this.di._.find(scope.allDeviceLabel.options, {'label':data['port'].substring(0, _index)}):{};
      //               } else {
      //                 scope.memberModel.vxlan.access.server_mac = data['port']
      //               }
      //               scope.memberModel.vxlan.access.vlan = data['vlan'];
      //             }
      //           }
      //         }
      //       } else {
      //         if(param['vxlan_type']){
      //           scope.selected.vxlanType = this.di._.find(scope.vxlanTypeLabel.options,  {'value':param['vxlan_type']});
      //           scope.isVxlanTypeDisable = true;
      //           if(param['vxlan_type'] === 'access')
      //             scope.selected.vxlanAccessDevice =  scope.allDeviceLabel.options[0];
      //         }
      //       }
      //     }
      //   }
      //   scope.showWizard = true;
      // },()=>{
      //   scope.showWizard = true;
      // });

    }


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

      let __find_trunk_option = (value) =>{
        if(scope.trunkDisplayLabel.options.length === 0){
          return null;
        }
        return this.di._.find(scope.trunkDisplayLabel.options, {'value':value} )
      };

      if(logical_ports === null || logical_ports === ''){
        return [];
      } else {
        let portArr = logical_ports.split(',');
        portArr = this.di._.map(portArr, this.di._.trim);
        return this.di._.map(portArr, (item)=>{
          let arr = item.split('/');
          let trunk = arr[0];
          let tag = arr[1];
          return {'trunk':__find_trunk_option(trunk), 'tagValue': this.di._.find(scope.tagDisplayLabel.options, { 'value': tag })}
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
      let isContainAllPorts = false;
      scope.memberModel.vlanPorts.forEach(port=>{
        if(port.port.value === 'any'){
          isContainAllPorts = true;
        }
      })
      if(isContainAllPorts){
        scope.errorMessage = this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.MSG.ALREADY_HAS_ALL_PORTS');
        return;
      }
      scope.memberModel.vlanPorts.push({'port':scope.vlanDeviceDisplayLabel.options[0], 'tagValue': scope.tagDisplayLabel.options[0]})
    };

    scope.deleteVlanPorts = (port) => {
      this.di._.remove(scope.memberModel.vlanPorts, function(n) {
        return n.port === port.port;
      });
    };

    scope.addVlanLogicalPorts = () => {
      if(scope.trunkDisplayLabel.options.length === 0){
        scope.errorMessage = this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.ERROR_NO_LOGICAL_PORT', {'deviceName': scope.selected.vlanDevice.label});
        return;
      }
      scope.memberModel.vlanLogicalPorts.push({'trunk':scope.trunkDisplayLabel.options[0], 'tagValue': scope.tagDisplayLabel.options[0]})
    };

    scope.deleteVlanLogicalPorts = (port) => {
      this.di._.remove(scope.memberModel.vlanLogicalPorts, function(n) {
        return n.trunk.value === port.trunk.value;
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

    scope.deviceChange = ($value) =>{
      scope.errorMessage = "";
      let ports = scope.logical_ports[$value.value];
      scope.trunkDisplayLabel.options = ports?ports:[];
      scope.memberModel.vlanPorts = [];
      scope.memberModel.vlanMacBased = [];
      scope.memberModel.vlanLogicalPorts = [];

      if($value.value.indexOf('grpc') === 0){
        scope.isSonicDevice = true;
      } else {
        scope.isSonicDevice = false;
      }

      scope.vlanDeviceDisplayLabel.options = [];
      scope.vlanDeviceDisplayLabel.options = this.di._.sortBy(this.di._.map(scope._phyPorts[$value.value], (v)=>{return parseInt(v['port'])})).map((portNum)=>{
        return {'label': String(portNum), 'value': String(portNum)}
      })
      scope.vlanDeviceDisplayLabel.options.unshift({'label':this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.ALL_PORTS'), 'value':'any'})

    };

    scope.vlanTypeChange = ($value) => {
      scope.errorMessage = "";
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


    let _formatVlanPorts = () =>{
      let ports = [];
      let isContainsAny = false;
      let anyPorts = [];
      this.di._.forEach(scope.memberModel.vlanPorts,(port)=>{
        ports.push(port.port.value + '/' + port.tagValue.value)
        if(port.port.value === 'any'){
          isContainsAny = true;
          anyPorts.push(port.port.value + '/' + port.tagValue.value)
          // anyPorts.push(port)
        }
      });

      if(isContainsAny){
        return anyPorts;
      } else {
        return ports;
      }
    };


    let _formatVlanLogicalPorts = () =>{
      let logical_ports = [];
      this.di._.forEach(scope.memberModel.vlanLogicalPorts,(port)=>{
        logical_ports.push(port.trunk.value + '/' + port.tagValue.value)
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
        let _f_ports =  _formatVlanPorts();
        let _f_logical_ports =  _formatVlanLogicalPorts();
        let _f_mac_based_vlans =  _formatVlanMacbased();
        if(_f_ports.length > 0){
          param['ports'] = _f_ports;
        }

        if(_f_logical_ports.length > 0){
          param['logical_ports'] = _f_logical_ports;
        }

        if(_f_mac_based_vlans.length > 0){
          param['mac_based_vlans'] = _f_mac_based_vlans;
        }
        // param['type'] = scope.selected.vlanType.value;
        // if(scope.selected.vlanType.value === 'normal'){
        //   param['ports'] = _formatVlanPorts();
        // } else if (scope.selected.vlanType.value === 'logical'){
        //   param['logical_ports'] = _formatVlanLogicalPorts();
        // } else if (scope.selected.vlanType.value === 'macbased'){
        //   param['mac_based_vlans'] = _formatVlanMacbased();
        // }
      } else {

        if(scope.selected.vxlanType.value === 'network'){
          param['network_port'] = [{
            'name': scope.memberModel.vxlan.name,
            'uplink_segment': scope.selected.vxlanNetworkUplink.value,
            'ip_addresses': _formatVxlanIPs()
          }];
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
        if(scope.memberModel.vlanPorts.length > 0){
          this.di._.forEach(scope.memberModel.vlanPorts,(port)=>{
            if(port.tagValue.value === 'untag'){
              let ins = this.di._.find(scope._pvids[scope.selected.vlanDevice.value], {'port': port.port.value});
              if(ins){
                validJson_Copy.valid = false;
                validJson_Copy.errorMessage = this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.ERROR_PORT_HAVE_UNTAG', {port: port.port.value});
                return false;
              }
            }
          });

          let filterPorts =  scope.memberModel.vlanPorts.filter(p=>{return p.port.value === 'any'});
          if(filterPorts.length > 1){
            validJson_Copy.valid = false;
            validJson_Copy.errorMessage = this.translate("MODULES.LOGICAL.SEGMENT_MEMBER.MSG.ALREADY_HAS_MORE_ALL_PORTS");
          }

        } else if(scope.memberModel.vlanPorts.length === 0 && scope.memberModel.vlanLogicalPorts.length === 0 && scope.memberModel.vlanMacBased.length === 0){
          validJson_Copy.valid = false;
          validJson_Copy.errorMessage =  this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.ERROR_HAVE_MEMBER');
        }

        // if(scope.selected.vlanType.value === 'normal'){
        //   if(scope.memberModel.vlanPorts.length === 0) {
        //     validJson_Copy.valid = false;
        //     validJson_Copy.errorMessage = '请添加端口';
        //   } else {
        //       this.di._.forEach(scope.memberModel.vlanPorts,(port)=>{
        //         if(port.tagValue.value === 'untag'){
        //           let ins = this.di._.find(scope._pvids[scope.selected.vlanDevice.value], {'port': port.port.value});
        //           if(ins){
        //             validJson_Copy.valid = false;
        //             validJson_Copy.errorMessage = '端口：'+port.port.value+' 上已经设置过Untag!';
        //             return false;
        //           }
        //         }
        //       });
        //   }
        // }
        // if(scope.selected.vlanType.value === 'logical' && scope.memberModel.vlanLogicalPorts.length === 0){
        //   validJson_Copy.valid = false;
        //   validJson_Copy.errorMessage = '请添加逻辑端口';
        // }
        // if(scope.selected.vlanType.value === 'macbased' && scope.memberModel.vlanMacBased.length === 0){
        //   validJson_Copy.valid = false;
        //   validJson_Copy.errorMessage = '请添加MAC';
        // }
      } else {
        if(scope.selected.vxlanType.value === 'network' && scope.memberModel.vxlanIps.length === 0){
          validJson_Copy.valid = false;
          validJson_Copy.errorMessage = this.translate('MODULES.LOGICAL.SEGMENT_MEMBER.ERROR_HAVE_IP');
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


