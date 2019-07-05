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
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': 'Mode',
        'field': 'mode',
        'type': 'select',
        'layout': {
          'visible': true,
          'sortable': true, 
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
        'layout': {'visible': true, 'sortable': true}
        // 'type': 'select',
        // 'layout': {
        //   'visible': true,
        //   'sortable': true,
        //   'render': {
        //     'params': {'options': [
        //       {'label': 10, 'value': 10},
        //       {'label': 20, 'value': 20},
        //       {'label': 30, 'value': 30}
        //     ]}
        //   }
        // }
      },
      // {
      //   'label': 'Ingress Filtering',
      //   'field': 'ingress_filter',
      //   'type': 'checkbox',
      //   'layout': {
      //     'visible': true,
      //     'sortable': true,
      //     'render': {
      //       'params': {
      //         'displayLabel': {
      //           'identify': 'ingress_filter_enable',
      //           'label': 'Enable'
      //         }
      //       }
      //     }
      //   }
      // },
      {
        'label': 'tag',
        'field': 'membership_type',
        'type': 'radio',
        'layout': {
          'visible': true,
          'sortable': true,
          'render': {
            'params': {
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
          'sortable': true,
          'render': {
            'params': {
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
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': 'tag/untag',
        'field': 'membership_type',
        'layout': {'visible': true, 'sortable': true}
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
      'refresh': {'enable': true, 'role': 1},
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
}
VlanService.$inject = VlanService.getDI();
VlanService.$$ngIsClass = true;