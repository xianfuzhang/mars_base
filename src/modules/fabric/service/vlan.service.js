export class VlanService {
  static getDI() {
    return ['$filter'];
  }

  constructor(...args) {
    this.di = {};
    VlanService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
  }

  getVlanTabSchema() {
    return [
      {
        'label': this.translate('MODULES.VLAN.TAB.SCHEMA.DETAIL'),
        'value': 'detail',
        'type': 'detail'
      },
      {
        'label': this.translate('MODULES.VLAN.TAB.SCHEMA.CREATE'),
        'value': 'create',
        'type': 'create'
      }
    ];
  }

  getPortsListSchema() {
    return [
      {
        'label': 'Port',
        'field': 'port',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': 'Mode',
        'field': 'mode',
        'type': 'select',
        'layout': {
          'visible': true,
          'sortable': false,
          'render': {'params': {'options': [
            {'label': 'access', 'value': 'access'},
            {'label': 'trunk', 'value': 'trunk'},
            {'label': 'hybrid', 'value': 'hybrid'},
          ]}}
        }
      },
      {
        'label': 'PVID',
        'field': 'pvid',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': 'tag',
        'field': 'membership_type',
        'type': 'radio',
        'layout': {
          'visible': true,
          'sortable': false,
          'render': {
            'params': {
              'disabled':[{
                'key':'mode',
                'value':'access'
              },{
                'key':'mode',
                'value':'trunk'
              }],
              'displayLabel': {
                'group_name': 'membership_type',
                'label': '',
                'value': 'tag'
              }
            }
          }
        }
      },
      {
        'label': 'untag',
        'field': 'membership_type',
        'type': 'radio',
        'layout': {
          'visible': true,
          'sortable': false,
          'render': {
            'params': {
              'disabled':[{
                'key':'mode',
                'value':'access'
              },{
                'key':'mode',
                'value':'trunk'
              }],
              'displayLabel': {
                'group_name': 'membership_type',
                'label': '',
                'value': 'untag'
              }
            }
          }
        }
      }
    ];
  }

  getVlanListSchema() {
    return [
      {
        'label': 'VLAN',
        'field': 'vlan',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': 'tag',
        'field': 'membership_type',
        'type': 'radio',
        'layout': {
          'visible': true,
          'sortable': false,
          'render': {
            'params': {
              'disabled':[{
                'key':'mode',
                'value':'access'
              },{
                'key':'mode',
                'value':'trunk'
              }],
              'displayLabel': {
                'group_name': 'membership_type',
                'label': '',
                'value': 'tag'
              }
            }
          }
        }
      },
      {
        'label': 'untag',
        'field': 'membership_type',
        'type': 'radio',
        'layout': {
          'visible': true,
          'sortable': false,
          'render': {
            'params': {
              'disabled':[{
                'key':'mode',
                'value':'access'
              },{
                'key':'mode',
                'value':'trunk'
              }],
              'displayLabel': {
                'group_name': 'membership_type',
                'label': '',
                'value': 'untag'
              }
            }
          }
        }
      }
    ];
  }

  getDevicesPortsVlanInfoSchema() {
    return [
      {
        'label':  this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.DEVICE'),
        'field': 'device',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label':  this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.PORT'),
        'field': 'port',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label':  this.translate('MODULES.SWITCHES.SWITCH.COLUMN.TYPE'),
        'field': 'type',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label':  'VLAN',
        'field': 'vlan',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label':  'PVID',
        'field': 'pvid',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }

  getDevicesVlanTableActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': false, 'role': 2},
      'remove': {'enable': false, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': true, 'role': 2}
    };
  }

  getDevicesVlanEditableTableActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': false, 'role': 2},
      'remove': {'enable': false, 'role': 2},
      'refresh': {'enable': false, 'role': 1},
      'search': {'enable': false, 'role': 2}
    };
  }

  getDevicesPortEditableTableActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': false, 'role': 2},
      'remove': {'enable': false, 'role': 2},
      'refresh': {'enable': false, 'role': 1},
      'search': {'enable': false, 'role': 2}
    };
  }

  getVlanIpsSchema(){
    return [
      {
        'label':  this.translate('MODULES.VLAN.IP.TABLE.COLUMN.DEVICE'),
        'field': 'device_name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label':  this.translate('MODULES.VLAN.IP.TABLE.COLUMN.VLAN'),
        'field': 'vlan',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label':  this.translate('MODULES.VLAN.IP.TABLE.COLUMN.IP'),
        'field': 'ip',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label':  this.translate('MODULES.VLAN.IP.TABLE.COLUMN.MASK'),
        'field': 'mask',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }

  getVlanDynamicSchema(){
    return [
      {
        'label':  this.translate('MODULES.VLAN.DYNAMIC.TABLE.COLUMN.DEVICE'),
        'field': 'device_name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label':  this.translate('MODULES.VLAN.DYNAMIC.TABLE.COLUMN.PORT'),
        'field': 'port',
        'layout': {'visible': true, 'sortable': true}
      },
      // {
      //   'label':  this.translate('MODULES.VLAN.DYNAMIC.TABLE.COLUMN.DYNAMIC'),
      //   'field': 'dynamic',
      //   'layout': {'visible': true, 'sortable': true}
      // },
      {
        'label': this.translate('MODULES.VLAN.DYNAMIC.TABLE.COLUMN.DYNAMIC'),
        'field': 'status',
        'type': 'icon',
        'layout': {'visible': true, 'sortable': false}
      }
    ];
  }

  getGuestVlanTableActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': true, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': true, 'role': 2}
    };
  }

  getGuestVlanTableSchema() {
    return [
      {
        'label':  this.translate('MODULES.VLAN.DYNAMIC.TABLE.COLUMN.DEVICE'),
        'field': 'device_name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label':  this.translate('MODULES.VLAN.DYNAMIC.TABLE.COLUMN.PORT'),
        'field': 'port',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.VLAN.GUEST.TABLE.COLUMN.VLAN'),
        'field': 'vlan_id',
        'layout': {'visible': true, 'sortable': true}
      }
    ];  
  }

  getGuestVlanTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ];
  }

  getVoiceVlanTableActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': true, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': true, 'role': 2}
    };
  }

  getVoiceVlanTableSchema() {
    return [
      {
        'label':  this.translate('MODULES.VLAN.VOICE.TABLE.COLUMN.DEVICE'),
        'field': 'device_name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.VLAN.VOICE.TABLE.COLUMN.VLAN'),
        'field': 'vlan_id',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label':  this.translate('MODULES.VLAN.VOICE.TABLE.COLUMN.AGING'),
        'field': 'aging',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label':  this.translate('MODULES.VLAN.VOICE.TABLE.COLUMN.STATUS'),
        'field': 'status',
        'type': 'icon',
        'layout': {'visible': true, 'sortable': false}
      },
    ];
  }

  getVoiceVlanTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ];
  }
}
VlanService.$inject = VlanService.getDI();
VlanService.$$ngIsClass = true;