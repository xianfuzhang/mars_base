/**
 * Created by wls on 2018/6/7.
 */

export class GroupEstablishController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$log',
      '$q',
      '$timeout',
      '$filter',
      '_',
      'deviceDataManager',
      'deviceService'
    ];
  }

  constructor(...args) {
    this.di = {};
    GroupEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let unsubscribes = [];
    const scope = this.di.$scope;
    const deviceDataManager = this.di.deviceDataManager;
    const rootScope = this.di.$rootScope;
    const translate = this.di.$filter('translate');

    // regex expression
    scope.mac_regex = '^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$';  // MAC Address regex for validation
    scope.ip_regex = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
    scope.num_regex = '^\d$|^[1-9]+[0-9]*$';
    scope.port_regex = /^[1-9]$|(^[1-9][0-9]$)|(^[1-9][0-9][0-9]$)|(^[1-9][0-9][0-9][0-9]$)|(^[1-6][0-5][0-5][0-3][0-5]$)/;
    scope.ipv6_regex = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;
  
    // wizard params
    scope.showWizard = false;
    scope.title = '添加Group';
    scope.steps = [
      {
        id: 'step1',
        title: '',
        content: require('../template/group')
      }
    ];
  
    scope.groupTypesDisLab = {
      options:
        [
          {
            label: 'L2_Interface',
            value: 'GROUP-Type-0'
          },
          {
            label: 'L2_Rewrite',
            value: 'GROUP-Type-1'
          },
          {
            label: 'L2_Multicast',
            value: 'GROUP-Type-3'
          },
          {
            label: 'L2_Flood',
            value: 'GROUP-Type-4'
          },
          {
            label: 'L2_Unfiltered_Interface',
            value: 'GROUP-Type-11'
          },
          {
            label: 'L3_Interface',
            value: 'GROUP-Type-5'
          },
          {
            label: 'L3_Unicast',
            value: 'GROUP-Type-2'
          },
          {
            label: 'L3_Multicast',
            value: 'GROUP-Type-6'
          },
          {
            label: 'L3_ECMP',
            value: 'GROUP-Type-7'
          }
        ]
    };
  
    scope.popVlanLabel = {
      id: 'pop_vlan',
      label: 'POP_VLAN',
    }
  
    scope.allowVlanXlateLabel = {
      id: 'allow_vlan_xlate',
      label: 'ALLOW_VLAN_XLATE',
    }
  
    scope.L2InterfaceGroupsDisLab = {
      options: [
        {
          label: '--请选择--',
          value: ''
        },
        {
          label: '0123456789',
          value: '0123456789'
        },
        {
          label: '1234567890',
          value: '1234567890'
        },
        {
          label: '2345678901',
          value: '2345678901'
        }
      ]
    }
  
    scope.L2UnfilteredInterfaceGroupDisLab = {
      options: [
        {
          label: '--请选择--',
          value: ''
        },
        {
          label: '3456789012',
          value: '3456789012'
        },
        {
          label: '4567890123',
          value: '4567890123'
        },
        {
          label: '5678901234',
          value: '5678901234'
        }
      ]
    }
  
    scope.L3InterfaceGroupDisLab = {
      options: [
        {
          label: '--请选择--',
          value: ''
        },
        {
          label: '6789012345',
          value: '6789012345'
        },
        {
          label: '7890123456',
          value: '7890123456'
        }
      ]
    }
  
    scope.L3ECMPGroupDisLab = {
      options: [
        {
          label: '--请选择--',
          value: ''
        },
        {
          label: '8901234567',
          value: '8901234567'
        },
        {
          label: '9012345678',
          value: '9012345678'
        },
      ]
    }
  
    scope.L3UnicastGroupDisLab = {
      options: [
        {
          label: '--请选择--',
          value: ''
        },
        {
          label: 'aa01234567',
          value: 'aa01234567'
        },
        {
          label: 'bb12345678',
          value: 'bb89012345'
        },
      ]
    }
  
    scope.subtypeList = [];
  
    const initGroup = {
      id: '',
      type: '',
      vlan_id: '',
      output_port: '',
      pop_vlan: false,
      allow_vlan_xlate: false,
      L2_Interface_Groups: [],
      L2_Unfiltered_Interface_Group: '',
      Src_Mac_Address: '',
      Dst_Mac_Address: '',
      L3_Interface_Group: '',
      L3_ECMP_Group: '',
      L2InterfaceGroupsSelected: scope.L2InterfaceGroupsDisLab.options[0],
      L2UnfilteredInterfaceGroupSelected: scope.L2UnfilteredInterfaceGroupDisLab.options[0],
      L3InterfaceGroupSelected: scope.L3InterfaceGroupDisLab.options[0],
      L3ECMPGroupSelected: scope.L3ECMPGroupDisLab.options[0],
      L3UnicastGroupSelected: scope.L3UnicastGroupDisLab.options[0]
    }
    
    const init = () => {
      // group type options
      scope.groupTypeSelected = this.di._.cloneDeep(scope.groupTypesDisLab.options[0]);
  
      scope.groupModel = this.di._.cloneDeep(initGroup)
    }
  
    init();
  
    let inValidJson = {
      valid: false,
      errorMessage: ''
    };
  
  
    let validJson = {
      valid: true,
      errorMessage: ''
    };
    
    const parseGroupID = () => {
      let typeIDStr = ''
      let portStr = ''
      let vlanIdStr = '', typeID;
      
      // format vlan id(10进制转成12位的2进制，不足补0)
      if(scope.groupModel.vlan_id) {
        vlanIdStr = scope.groupModel.vlan_id.toString(2);
        for(let i=0; i < 12 - vlanIdStr.length; i++){
          vlanIdStr = '0' + vlanIdStr;
        }
      }
      
      // format output port(10进制转成16位的2进制，不足补0)
      if(scope.groupModel.output_port) {
        portStr = scope.groupModel.output_port.toString(2);
        for(let i = 0; i< 16 - portStr.length; i++) {
          portStr = '0' + portStr;
        }
      }
  
      // TODO: 28 bits ID
      const ID28bits = '0000000000000000000000000000';
      
      switch(scope.groupModel.type) {
        case 'GROUP-Type-0':
          typeIDStr = '0000' + vlanIdStr + portStr;
          break;
        case 'GROUP-Type-1':
          typeIDStr = '0001' + ID28bits;
          break;
        case 'GROUP-Type-2':
          typeIDStr = '0010' + ID28bits;
          break;
        case 'GROUP-Type-3':
          typeIDStr = '0011' + vlanIdStr + ID28bits.slice(16);
          break;
        case 'GROUP-Type-4':
          typeIDStr = '0100' + vlanIdStr + ID28bits.slice(0,16);
          break;
        case 'GROUP-Type-5':
          typeIDStr = '0101' + ID28bits;
          break;
        case 'GROUP-Type-6':
          typeIDStr = '0110' + ID28bits;
          break;
        case 'GROUP-Type-7':
          typeIDStr = '0111' + ID28bits;
          break;
        case 'GROUP-Type-11':
          typeIDStr = '1011' + '000000000000' + portStr;
          break;
      }
      
      return parseInt(typeIDStr,2)
    }
    
    const getGroupRequestObj = () => {
      let requestObj = {
        type: '',
        appCookie: '',
        groupId: '',
        buckets: []
      }
  
      let groupId = parseGroupID();
      switch(scope.groupModel.type) {
        case 'GROUP-Type-0':
          requestObj.type = 'INDIRECT';
          requestObj.appCookie = groupId;
          requestObj.groupId = groupId;
      
          let instructions = []
          instructions.push({
            type: 'OUTPUT',
            port: scope.groupModel.output_port
          })
      
          if(scope.groupModel.pop_vlan) {
            instructions.push({
              type: "L2MODIFICATION",
              subtype: "VLAN_POP"
            })
          }
          
          requestObj.buckets.push({
            treatment: {
              instructions: instructions
            }
          });
          break;
        case 'GROUP-Type-1':
          typeIDStr = '0001' + ID28bits;
          break;
        case 'GROUP-Type-2':
          typeIDStr = '0010' + ID28bits;
          break;
        case 'GROUP-Type-3':
          typeIDStr = '0011' + vlanIdStr + ID28bits.slice(16);
          break;
        case 'GROUP-Type-4':
          typeIDStr = '0100' + vlanIdStr + ID28bits.slice(0,16);
          break;
        case 'GROUP-Type-5':
          typeIDStr = '0101' + ID28bits;
          break;
        case 'GROUP-Type-6':
          typeIDStr = '0110' + ID28bits;
          break;
        case 'GROUP-Type-7':
          typeIDStr = '0111' + ID28bits;
          break;
        case 'GROUP-Type-11':
          typeIDStr = '1011' + '000000000000' + portStr;
          break;
      }
    }
    
    scope.open = (deviceId) => {
      if(scope.showWizard) return;
        init();
        scope.curDeviceId = deviceId;
        this.di.$timeout(() => {
          scope.showWizard = true;
        });
    };

    scope.removeGroup = (group) => {
      let index = scope.groupModel.L2_Interface_Groups.indexOf(group);
      if(index != -1) {
        scope.groupModel.L2_Interface_Groups.splice(index, 1)
      }
      
      const length = scope.groupModel.L2_Interface_Groups.length;
      if(length == 0) {
        scope.groupModel.L2InterfaceGroupsSelected = scope.L2InterfaceGroupsDisLab.options[0]
      } else {
        let option = this.di._.find(scope.L2InterfaceGroupsDisLab.options, (option) => {
          return option.value == scope.groupModel.L2_Interface_Groups[length-1]
        })
  
        scope.groupModel.L2InterfaceGroupsSelected = option;
      }
    }
    
    scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    scope.submit = function() {
      

      return new Promise((resolve, reject) => {
        // TODO:
      });
    };
  
    unsubscribes.push(scope.$watch('groupModel.L2InterfaceGroupsSelected', (selected) => {
      if(selected.value != '' && scope.groupModel.L2_Interface_Groups.indexOf(selected.value) == -1){
        scope.groupModel.L2_Interface_Groups.push(selected.value)
      }
    }, true));
  
    unsubscribes.push(scope.$watch('groupTypeSelected', (newValue) => {
      scope.groupModel = this.di._.cloneDeep(initGroup)
    },true));
    
    unsubscribes.push(this.di.$rootScope.$on('group-wizard-show', ($event, deviceId) => {
      scope.open(deviceId);
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

GroupEstablishController.$inject = GroupEstablishController.getDI();
GroupEstablishController.$$ngIsClass = true;