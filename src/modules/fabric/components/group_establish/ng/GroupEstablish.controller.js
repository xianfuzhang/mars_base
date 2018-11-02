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
    const _ = this.di._;
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
  
    scope.L2InterfaceGroupsDisLab = {
      options: [
        {
          label: '--请选择--',
          value: ''
        }
      ]
    }
  
    scope.L2UnfilteredInterfaceGroupDisLab = {
      options: [
        {
          label: '--请选择--',
          value: ''
        }
      ]
    }
  
    scope.L3InterfaceGroupDisLab = {
      options: [
        {
          label: '--请选择--',
          value: ''
        }
      ]
    }
  
    scope.L3ECMPGroupDisLab = {
      options: [
        {
          label: '--请选择--',
          value: ''
        }
      ]
    }
  
    scope.L3UnicastGroupDisLab = {
      options: [
        {
          label: '--请选择--',
          value: ''
        }
      ]
    }
  
    scope.popVlanLabel = {
      id: 'pop_vlan',
      label: 'POP_VLAN',
    }
  
    scope.mappedGroups = {
      'GROUP-Type-0': [],
      'GROUP-Type-1': [],
      'GROUP-Type-2': [],
      'GROUP-Type-3': [],
      'GROUP-Type-4': [],
      'GROUP-Type-5': [],
      'GROUP-Type-6': [],
      'GROUP-Type-7': [],
      'GROUP-Type-11': []
    };
    
    let initGroup = {
      vlan_id: '',
      output_port: '',
      pop_vlan: false,
      src_mac_address: '',
      dst_mac_address: '',
      L2_Interface_Groups: [],
      groupTypeSelected: scope.groupTypesDisLab.options[0],
      L2InterfaceGroupsSelected: scope.L2InterfaceGroupsDisLab.options[0],
      L2UnfilteredInterfaceGroupSelected: scope.L2UnfilteredInterfaceGroupDisLab.options[0],
      L3InterfaceGroupSelected: scope.L3InterfaceGroupDisLab.options[0],
      L3ECMPGroupSelected: scope.L3ECMPGroupDisLab.options[0],
      L3UnicastGroupSelected: scope.L3UnicastGroupDisLab.options[0]
    }
  
    const init = () => {
      // init group
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
    
    const getRandomID = (bits) => {
      // get a random binary ID string
      let flag = true, randomId;
      while(flag) {
        let tmpId = Math.floor(Math.random() * Math.pow(2,parseInt(bits))).toString(2)
        randomId = tmpId;
        for(let i=0;i< parseInt(bits) - tmpId.length;i++){
          randomId = '0' + randomId;
        }
        let foundGroup = _.find(scope.mappedGroups, (group) => {
          return group.random_id === randomId
        })
        
        flag = foundGroup ? true : false;
      }
      
      return randomId
    }
    
    const parseGroupID = () => {
      let typeIDStr = ''
      let portStr = ''
      let vlanIdStr = '', typeID;
      
      // format vlan id(10进制转成12位的2进制，不足补0)
      if(scope.groupModel.vlan_id) {
        let tmpVlanIdStr = parseInt(scope.groupModel.vlan_id).toString(2);
        vlanIdStr = tmpVlanIdStr;
        for(let i=0; i < 12 - tmpVlanIdStr.length; i++){
          vlanIdStr = '0' + vlanIdStr;
        }
      }
      
      // format output port(10进制转成16位的2进制，不足补0)
      if(scope.groupModel.output_port) {
        let tmpPortStr = parseInt(scope.groupModel.output_port).toString(2);
        portStr = tmpPortStr;
        for(let i = 0; i< 16 - tmpPortStr.length; i++) {
          portStr = '0' + portStr;
        }
      }
  
      switch(scope.groupModel.groupTypeSelected.value) {
        case 'GROUP-Type-0':
          typeIDStr = '0000' + vlanIdStr + portStr;
          break;
        case 'GROUP-Type-1':
          typeIDStr = '0001' + getRandomID(28);
          break;
        case 'GROUP-Type-2':
          typeIDStr = '0010' + getRandomID(28);
          break;
        case 'GROUP-Type-3':
          typeIDStr = '0011' + vlanIdStr + getRandomID(16);
          break;
        case 'GROUP-Type-4':
          typeIDStr = '0100' + vlanIdStr + getRandomID(16);
          break;
        case 'GROUP-Type-5':
          typeIDStr = '0101' + getRandomID(28);
          break;
        case 'GROUP-Type-6':
          typeIDStr = '0110' + vlanIdStr + getRandomID(16);
          break;
        case 'GROUP-Type-7':
          typeIDStr = '0111' + getRandomID(28);
          break;
        case 'GROUP-Type-11':
          typeIDStr = '1011' + '000000000000' + portStr;
          break;
      }
      
      return parseInt(typeIDStr,2)
    }
    
    const getGroupRequestObj = () => {
      let groupId = parseGroupID();
      let requestObj = {
        type: '',
        appCookie: '0x' + groupId.toString(16),
        groupId: groupId,
        buckets: []
      }
      let instructions = [];
      switch(scope.groupModel.groupTypeSelected.value) {
        case 'GROUP-Type-0':
          requestObj.type = 'INDIRECT';
      
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
          break;
        case 'GROUP-Type-1':
          requestObj.type = 'INDIRECT';
          
          if(scope.groupModel.vlan_id != '' && parseInt(scope.groupModel.vlan_id)) {
            instructions.push({
              type: "L2MODIFICATION",
              subtype: "VLAN_ID",
              vlanId: parseInt(scope.groupModel.vlan_id)
            })
          }
          if(scope.groupModel.src_mac_address) {
            instructions.push({
              type: "L2MODIFICATION",
              subtype: "ETH_SRC",
              mac: scope.groupModel.src_mac_address
            })
          }
          if(scope.groupModel.dst_mac_address) {
            instructions.push({
              type: "L2MODIFICATION",
              subtype: "ETH_DST",
              mac: scope.groupModel.dst_mac_address
            })
          }
          
          // L2 interface groups
          if(scope.groupModel.L2_Interface_Groups instanceof Array && scope.groupModel.L2_Interface_Groups.length) {
            scope.groupModel.L2_Interface_Groups.forEach((group) => {
              instructions.push({
                type: "GROUP",
                groupId: group
              })
            })
          }
          // L2 Unfiltered Interface
          if(scope.groupModel.L2UnfilteredInterfaceGroupSelected.value) {
            instructions.push({
              type: "GROUP",
              groupId: scope.groupModel.L2UnfilteredInterfaceGroupSelected.value
            })
          }
          break;
        case 'GROUP-Type-2':
          requestObj.type = 'INDIRECT';
  
          if(scope.groupModel.vlan_id != '' && parseInt(scope.groupModel.vlan_id)) {
            instructions.push({
              type: "L3MODIFICATION",
              subtype: "VLAN_ID",
              vlanId: parseInt(scope.groupModel.vlan_id)
            })
          }
          if(scope.groupModel.src_mac_address) {
            instructions.push({
              type: "L3MODIFICATION",
              subtype: "ETH_SRC",
              mac: scope.groupModel.src_mac_address
            })
          }
          if(scope.groupModel.dst_mac_address) {
            instructions.push({
              type: "L3MODIFICATION",
              subtype: "ETH_DST",
              mac: scope.groupModel.dst_mac_address
            })
          }
          // L2 interface groups
          if(scope.groupModel.L2_Interface_Groups instanceof Array && scope.groupModel.L2_Interface_Groups.length) {
            scope.groupModel.L2_Interface_Groups.forEach((group) => {
              instructions.push({
                type: "GROUP",
                groupId: group
              })
            })
          }
          break;
        case 'GROUP-Type-3':
          requestObj.type = 'ALL';
          // L2 interface groups
          if(scope.groupModel.L2_Interface_Groups instanceof Array && scope.groupModel.L2_Interface_Groups.length) {
            scope.groupModel.L2_Interface_Groups.forEach((group) => {
              instructions.push({
                type: "GROUP",
                groupId: group
              })
            })
          }
          break;
        case 'GROUP-Type-4':
          requestObj.type = 'ALL';
          // L2 interface groups
          if(scope.groupModel.L2_Interface_Groups instanceof Array && scope.groupModel.L2_Interface_Groups.length) {
            scope.groupModel.L2_Interface_Groups.forEach((group) => {
              instructions.push({
                type: "GROUP",
                groupId: group
              })
            })
          }
          break;
        case 'GROUP-Type-5':
          requestObj.type = 'INDIRECT';
  
          if(scope.groupModel.vlan_id != '' && parseInt(scope.groupModel.vlan_id)) {
            instructions.push({
              type: "L3MODIFICATION",
              subtype: "VLAN_ID",
              vlanId: parseInt(scope.groupModel.vlan_id)
            })
          }
          if(scope.groupModel.src_mac_address) {
            instructions.push({
              type: "L3MODIFICATION",
              subtype: "ETH_SRC",
              mac: scope.groupModel.src_mac_address
            })
          }
          if(scope.groupModel.dst_mac_address) {
            instructions.push({
              type: "L3MODIFICATION",
              subtype: "ETH_DST",
              mac: scope.groupModel.dst_mac_address
            })
          }
          // L2 interface groups
          if(scope.groupModel.L2_Interface_Groups instanceof Array && scope.groupModel.L2_Interface_Groups.length) {
            scope.groupModel.L2_Interface_Groups.forEach((group) => {
              instructions.push({
                type: "GROUP",
                groupId: group
              })
            })
          }
          break;
        case 'GROUP-Type-6':
          requestObj.type = 'ALL';
          // L2 interface groups
          if(scope.groupModel.L2_Interface_Groups instanceof Array && scope.groupModel.L2_Interface_Groups.length) {
            scope.groupModel.L2_Interface_Groups.forEach((group) => {
              instructions.push({
                type: "GROUP",
                groupId: group
              })
            })
          }
  
          // L3 Interface Group
          if(scope.groupModel.L3InterfaceGroupSelected.value) {
            instructions.push({
              type: "GROUP",
              groupId: scope.groupModel.L3InterfaceGroupSelected.value
            })
          }
  
          // L3 ECMP Group
          if(scope.groupModel.L3ECMPGroupSelected.value) {
            instructions.push({
              type: "GROUP",
              groupId: scope.groupModel.L3ECMPGroupSelected.value
            })
          }
          break;
        case 'GROUP-Type-7':
          requestObj.type = 'SELECT';
          // L3 Interface Group
          if(scope.groupModel.L3UnicastGroupSelected.value) {
            instructions.push({
              type: "GROUP",
              groupId: scope.groupModel.L3UnicastGroupSelected.value
            })
          }
  
          // L3 ECMP Group
          if(scope.groupModel.L3ECMPGroupSelected.value) {
            instructions.push({
              type: "GROUP",
              groupId: scope.groupModel.L3ECMPGroupSelected.value
            })
          }
          break;
        case 'GROUP-Type-11':
          requestObj.type = 'INDIRECT';
          instructions.push({
            type: 'OUTPUT',
            port: scope.groupModel.output_port
          })
          break;
      }
  
      requestObj.buckets.push({
        treatment: {
          instructions: instructions
        }
      });
      
      return requestObj;
    }
    
    const initGroupDisLabOptions = () => {
      scope.L2InterfaceGroupsDisLab.options = [
        {
          label: '--请选择--',
          value: ''
        }
      ];
      scope.L3UnicastGroupDisLab.options = [
        {
          label: '--请选择--',
          value: ''
        }
      ];
      scope.L3InterfaceGroupDisLab.options = [
        {
          label: '--请选择--',
          value: ''
        }
      ];
      scope.L3ECMPGroupDisLab.options = [
        {
          label: '--请选择--',
          value: ''
        }
      ];
      scope.L2UnfilteredInterfaceGroupDisLab.options = [
        {
          label: '--请选择--',
          value: ''
        }
      ];
  
      scope.mappedGroups['GROUP-Type-0'].forEach((group) => {
        if('GROUP-Type-1' ==  scope.groupModel.groupTypeSelected.value || 'GROUP-Type-5' == scope.groupModel.groupTypeSelected.value) {
          scope.L2InterfaceGroupsDisLab.options.push({
            label: '0x' + group.id.toString(16),
            value: group.id
          })
        } else if(parseInt(scope.groupModel.vlan_id) && scope.groupModel.vlan_id == group.vlan_id){
          scope.L2InterfaceGroupsDisLab.options.push({
            label: '0x' + group.id.toString(16),
            value: group.id
          })
        }
      })
  
      scope.mappedGroups['GROUP-Type-2'].forEach((group) => {
        scope.L3UnicastGroupDisLab.options.push({
          label: '0x' + group.id.toString(16),
          value: group.id
        })
      })
  
      scope.mappedGroups['GROUP-Type-5'].forEach((group) => {
        if(!parseInt(scope.groupModel.vlan_id) || scope.groupModel.vlan_id != group.vlan_id){
          scope.L3InterfaceGroupDisLab.options.push({
            label: '0x' + group.id.toString(16),
            value: group.id
          })
        }
      })
  
      scope.mappedGroups['GROUP-Type-7'].forEach((group) => {
        scope.L3ECMPGroupDisLab.options.push({
          label: '0x' + group.id.toString(16),
          value: group.id
        })
      })
  
      scope.mappedGroups['GROUP-Type-11'].forEach((group) => {
        scope.L2UnfilteredInterfaceGroupDisLab.options.push({
          label: '0x' + group.id.toString(16),
          value: group.id
        })
      })
    }
    
    scope.open = (deviceId) => {
      if(scope.showWizard) return;
  
      scope.curDeviceId = deviceId;
      deviceDataManager.getDeviceGroups(scope.curDeviceId).then(
        (res) => {
          scope.mappedGroups = {
            'GROUP-Type-0': [],
            'GROUP-Type-1': [],
            'GROUP-Type-2': [],
            'GROUP-Type-3': [],
            'GROUP-Type-4': [],
            'GROUP-Type-5': [],
            'GROUP-Type-6': [],
            'GROUP-Type-7': [],
            'GROUP-Type-11': []
          };
          
          res.data.groups.forEach((group) => {
            let parseGroup = deviceDataManager.parseDeviceGroup(group.id)
            Object.assign(group, parseGroup);
            scope.mappedGroups[parseGroup.nameId].push(group)
          })
  
          initGroupDisLabOptions();
        },
        (error) => {
          console.error(error)
        })
      
        init();
        this.di.$timeout(() => {
          scope.showWizard = true;
        });
    };

    scope.removeSelectedL2Interface = (group) => {
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
    
    scope.addL2interface = () => {
      if(scope.groupModel.L2UnfilteredInterfaceGroupSelected.value != '') return;
      
      let newValue = scope.groupModel.L2InterfaceGroupsSelected;
      if(newValue && newValue.value != '' && scope.groupModel.L2_Interface_Groups.indexOf(newValue.value) == -1){
        scope.groupModel.L2_Interface_Groups.push(newValue.value)
      }
    }
    
    scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    scope.submit = function() {
      let params = getGroupRequestObj();

      return new Promise((resolve, reject) => {
        deviceDataManager.addDeviceGroup(scope.curDeviceId, params)
          .then(() => {
            init()
            rootScope.$emit('group-list-refresh');
            resolve({valid: true, errorMessage: ''});
          }, (err) => {
            // scope.switch = _.cloneDeep(initSwitch);
            resolve({valid: false, errorMessage: err});
          });
      });
    };
  
    // unsubscribes.push(scope.$watch('groupModel.L2InterfaceGroupsSelected', (newValue, oldValue) => {
    //   if(_.isEqual(newValue, oldValue)) return;
    //   if(newValue && newValue.value != '' && scope.groupModel.L2_Interface_Groups.indexOf(newValue.value) == -1){
    //     scope.groupModel.L2_Interface_Groups.push(newValue.value)
    //   }
    // }, true));
  
    unsubscribes.push(scope.$watch('groupModel.groupTypeSelected', (newValue, oldValue) => {
      if(newValue == oldValue) return;
      scope.groupModel = this.di._.cloneDeep(initGroup)
      scope.groupModel.groupTypeSelected = newValue;
      initGroupDisLabOptions();
    },true));
  
    // unsubscribes.push(scope.$watch('mappedGroups', (newValue, oldValue) => {
    //   if(_.isEqual(newValue, oldValue)) return;
    //   initGroupDisLabOptions(true);
    // },true));
  
    unsubscribes.push(scope.$watch('groupModel.vlan_id', (newValue, oldValue) => {
      if(newValue == oldValue) return;
      if('GROUP-Type-1' ==  scope.groupModel.groupTypeSelected.value || 'GROUP-Type-5' == scope.groupModel.groupTypeSelected.value) return;
      
      scope.groupModel.L2_Interface_Groups = []
      initGroupDisLabOptions();
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