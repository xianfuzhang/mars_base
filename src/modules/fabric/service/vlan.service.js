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
        'field': 'vlan',
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
        'label': this.translate('MODULES.VLAN.VOICE.TABLE.ROW.ACTION.ENABLE'),
        'role': 2,
        'value': 'enable'
      },
      {
        'label': this.translate('MODULES.VLAN.VOICE.TABLE.ROW.ACTION.DISABLE'),
        'role': 2,
        'value': 'disable'
      }
    ];
  }

  getVoiceVlanOuiTableActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': true, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': false, 'role': 2}
    };
  }

  getVoiceVlanOuiTableSchema() {
    return [
      {
        'label':  this.translate('MODULES.VLAN.VOICE.TABLE.COLUMN.MAC_ADDRESS'),
        'field': 'mac_address',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULES.VLAN.VOICE.TABLE.COLUMN.MASK_ADDRESS'),
        'field': 'mask_address',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label':  this.translate('MODULES.VLAN.VOICE.TABLE.COLUMN.DESCRIPTION'),
        'field': 'description',
        'layout': {'visible': true, 'sortable': false}
      }
    ];
  }

  getVoiceVlanOuiTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ];
  }

  getVoiceVlanPortTableActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': true, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': false, 'role': 2}
    };
  }

  getVoiceVlanPortTableSchema() {
    return [
      {
        'label':  "PORT",
        'field': 'port',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label':  this.translate('MODULES.VLAN.VOICE.TABLE.COLUMN.SECURITY'),
        'field': 'security',
        'type': 'select',
        'layout': {
          'visible': true,
          'sortable': false,
          'render': {'params': {'options': [
            {'label': this.translate("MODULES.VLAN.VOICE.TABLE.COLUMN.SECURITY.ENABLE"), 'value': true},
            {'label': this.translate("MODULES.VLAN.VOICE.TABLE.COLUMN.SECURITY.DISABLE"), 'value': false},
          ]}}
        }
      },
      {
        'label':  this.translate('MODULES.VLAN.VOICE.TABLE.COLUMN.RULE'),
        'field': 'rule',
        'type': 'select',
        'layout': {
          'visible': true,
          'sortable': false,
          'render': {'params': {'options': [
            {'label': 'oui', 'value': 'oui'},
            {'label': 'lldp', 'value': 'lldp'},
            {'label': 'oui/lldp', 'value': 'oui/lldp'},
          ]}}
        }
      },
      {
        'label':  this.translate('MODULES.VLAN.VOICE.TABLE.COLUMN.PRIORITY'),
        'field': 'priority',
        'type': 'select',
        'layout': {
          'visible': true,
          'sortable': false,
          'render': {'params': {'options': [
            {'label': '0', 'value': 0},
            {'label': '1', 'value': 1},
            {'label': '2', 'value': 2},
            {'label': '3', 'value': 3},
            {'label': '4', 'value': 4},
            {'label': '5', 'value': 5},
            {'label': '6', 'value': 6}
          ]}}
        }
      },
      {
        'label':  this.translate('MODULES.VLAN.VOICE.TABLE.COLUMN.MODE'),
        'field': 'mode',
        'type': 'select',
        'layout': {
          'visible': true,
          'sortable': false,
          'render': {'params': {'options': [
            {'label': this.translate("MODULES.VLAN.VOICE.TABLE.COLUMN.MODE.MANUAL"), 'value': 'manual'},
            {'label': this.translate("MODULES.VLAN.VOICE.TABLE.COLUMN.MODE.AUTO"), 'value': 'auto'},
            {'label': this.translate("MODULES.VLAN.VOICE.TABLE.COLUMN.MODE.NONE"), 'value': 'none'}
          ]}}
        }
      }
    ];
  }

  getVoiceVlanPortTableRowActions() {
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