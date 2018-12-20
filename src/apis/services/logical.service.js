/**
 * Created by wls on 2018/7/17.
 */
export class logicalService {
  static getDI() {
    return [
      '$location',
      '$filter',
      '_'
    ];
  }

  constructor(...args) {
    this.di = {};
    logicalService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
  }

  getTenantTableSchema(){
    return [
      {
        'label': this.translate("MODULES.LOGICAL.TENANT.TABLE.NAME"),
        'type': 'clickabletext',
        'field': 'name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate("MODULES.LOGICAL.TENANT.TABLE.TYPE"),
        'field': 'type',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      }
    ];
  }

  getTenantDetailTabSchema() {
    return [
      {
        'label': this.translate('MODULES.LOGICAL.TENANT.DETAIL.TAB.SCHEMA.SEGMENT'),
        'value': 'segment',
        'type': 'segment'
      }
    ];
  }

  getQoSTabSchema() {
    return [
      {
        'label': this.translate('MODULES.LOGICAL.QOS.TAB.SCHEMA.COS'),
        'value': 'cos',
        'type': 'cos'
      },
      {
        'label': this.translate('MODULES.LOGICAL.QOS.TAB.SCHEMA.ECN'),
        'value': 'ecn',
        'type': 'ecn'
      }
    ];
  }

  getEGPTabSchema() {
    return [
      {
        'label': 'group',
        'value': 'group',
        'type': 'group'
      },
      {
        'label': 'policy',
        'value': 'policy',
        'type': 'policy'
      }
    ];
  }

  getTenantSegmentsSchema() {
    return [
      {
        'label': this.translate('MODULES.LOGICAL.TENANT.DETAIL.SEGMENT.COLUMN.NAME'),
        'field': 'segment_name',
        'type': 'clickabletext',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.LOGICAL.TENANT.DETAIL.SEGMENT.COLUMN.TYPE'),
        'field': 'type',
        'layout': {'visible': true, 'sortable': true},
      },
      {
        'label': this.translate('MODULES.LOGICAL.TENANT.DETAIL.SEGMENT.COLUMN.VALUE'),
        'field': 'value',
        'layout': {'visible': true, 'sortable': true},
      },
      {
        'label': this.translate('MODULES.LOGICAL.TENANT.DETAIL.SEGMENT.COLUMN.IP'),
        'field': 'ip_address',
        'layout': {'visible': true, 'sortable': true},
      }
    ];
  }

  getTenantSegmentsActionsShow() {
    return {
      'menu': {'enable': false, 'role': 2}, 
      'add': {'enable': true, 'role': 2}, 
      'remove': {'enable': true, 'role': 2}, 
      'refresh': {'enable': true, 'role': 2}, 
      'search': {'enable': false, 'role': 2}
    };
  }

  getTenantSegmentsRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ];
  }

  getSegmentVlanSchema() {
    return [
      {
        'label': this.translate('MODULES.LOGICAL.SGEMENT.VLAN.COLUMN.TYPE'),
        'field': 'type',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SGEMENT.VLAN.COLUMN.DEVICE'),
        'field': 'device',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SGEMENT.VLAN.COLUMN.PORTS'),
        'field': 'port',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SGEMENT.VLAN.COLUMN.LOGICAL_PORTS'),
        'field': 'logical_port',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SGEMENT.VLAN.COLUMN.MAC_BASE_VLAN'),
        'field': 'mac_based_vlan',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }

  getSegmentVxlanSchema() {
    return [
     {
        'label': this.translate('MODULES.LOGICAL.SGEMENT.VXLAN.COLUMN.TYPE'),
        'field': 'type',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SGEMENT.VXLAN.COLUMN.NAME'),
        'field': 'name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SGEMENT.VXLAN.COLUMN.ACCESS.VLAN'),
        'field': 'vlan',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SGEMENT.VXLAN.COLUMN.ACCESS.SWITCH'),
        'field': 'device',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SGEMENT.VXLAN.COLUMN.ACCESS.SERVER'),
        'field': 'server',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SGEMENT.VXLAN.COLUMN.NETWORK.IP'),
        'field': 'ip_address',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }
  
   getSegmentMemberTypeLabel(){
    return {'options':[
      {'label': 'VLAN', 'value': 'vlan'},
      {'label': 'VXLAN', 'value':'vxlan'}
    ]}
  }

  getSegmentMemberVlanTypeLabel(){
    return {'options':[
      {'label': 'Normal', 'value': 'normal'},
      {'label': 'Logical', 'value':'logical'},
      {'label': 'Macbased', 'value':'macbased'}
    ]}
  }

  getSegmentVlanActionsShow() {
    return {
      'menu': {'enable': false, 'role': 2}, 
      'add': {'enable': false, 'role': 2}, 
      'remove': {'enable': false, 'role': 2}, 
      'refresh': {'enable': false, 'role': 2}, 
      'search': {'enable': false, 'role': 2}
    };
  }
  
   getSegmentMemberVxlanTypeLabel(){
    return {'options':[
      {'label': 'Access', 'value': 'access'},
      {'label': 'Network', 'value':'network'}
    ]}
  }
  
   getSegmentMemberVxlanAccessTypeLabel(){
    return {'options':[
      {'label': 'Normal', 'value': 'normal'},
      {'label': 'Openstack', 'value':'openstack'}
    ]}
  }
  
   getSegmentMemberTagLabel(){
    return {'options':[
      {'label': 'Tag', 'value': 'tag'},
      {'label': 'Untag', 'value':'untag'}
    ]}
  }

  getSegmentMemberVlanTableSchema(){
    return [
      {
        'label': this.translate("MODULES.LOGICAL.SGEMENT.VLAN.COLUMN.DEVICE"),
        'type': 'clickabletext',
        'field': 'device_id',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate("MODULES.LOGICAL.SGEMENT.VLAN.COLUMN.PORTS"),
        'field': 'ports',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate("MODULES.LOGICAL.SGEMENT.VLAN.COLUMN.LOGICAL_PORTS"),
        'field': 'logical_ports',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate("MODULES.LOGICAL.SGEMENT.VLAN.COLUMN.MAC_BASE_VLAN"),
        'field': 'mac_based_vlans',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      }
    ];
  }

  getSegmentMemberVxlanAccessTableSchema(){
    return [
      {
        'label': this.translate("MODULES.LOGICAL.SEGMENT_DETAIL.TABLE.NAME"),
        'field': 'name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'25%'},
      },
      {
        'label': this.translate("MODULES.LOGICAL.SEGMENT_DETAIL.TABLE.TYPE"),
        'field': 'type',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'25%'}
      },
      {
        'label': this.translate("MODULES.LOGICAL.SEGMENT_DETAIL.TABLE.PORT"),
        'field': 'port',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'40%'}
      },
      {
        'label': this.translate("MODULES.LOGICAL.SEGMENT_DETAIL.TABLE.VLAN"),
        'field': 'vlan',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'10%'}
      }
    ];
  }


  getSegmentMemberVxlanNetworkTableSchema(){
    return [
      {
        'label': this.translate("MODULES.LOGICAL.SEGMENT_DETAIL.TABLE.NAME"),
        'field': 'name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'30%'},
      },
      {
        'label': this.translate("MODULES.LOGICAL.SEGMENT_DETAIL.TABLE.IP_ADDRESS"),
        'field': 'ip_addresses',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'60%'}
      }
    ];
  }

  getQosCosSchema() {
    return [
      {
        'label': 'queue',
        'field': 'queue',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'30%'},
      },
      {
        'label': 'dscp',
        'field': 'dscp',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'60%'},
      }
    ];
  }

  getQosEcnSchema() {
    return [
      {
        'label': 'queue',
        'field': 'queue',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'30%'},
      },
      {
        'label': 'threshold',
        'field': 'threshold',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'60%'},
      }
    ];
  }

  getQosActionsShow() {
    return {
      'menu': {'enable': false, 'role': 3}, 
      'add': {'enable': true, 'role': 3}, 
      'remove': {'enable': false, 'role': 3}, 
      'refresh': {'enable': true, 'role': 3}, 
      'search': {'enable': false, 'role': 3}
    };
  }

  getQosRowActions() {
    return [
      {
        'label': this.translate('MODULES.LOGICAL.QOS.ROW.ACTION.UPDATE'),
        'role': 3,
        'value': 'update'
      }
    ];  
  }

  getEGPGroupSchema() {
    return [
      {
        'label': this.translate("MODULES.LOGICAL.EGP.TAB.GROUP.TABLE.NAME"),
        'field': 'name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'20%'},
      },
      {
        'label': this.translate("MODULES.LOGICAL.EGP.TAB.GROUP.TABLE.TENANT"),
        'field': 'tenant',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'20%'},
      },
       {
        'label': this.translate("MODULES.LOGICAL.EGP.TAB.GROUP.TABLE.ADDRESS"),
        'field': 'address',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'50%'},
      }
    ];
  }

  getEGPPolicySchema() {
    return [
      {
        'label': this.translate("MODULES.LOGICAL.EGP.TAB.POLICY.TABLE.NAME"),
        'field': 'name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'20%'},
      },
      {
        'label': this.translate("MODULES.LOGICAL.EGP.TAB.POLICY.TABLE.GROUP"),
        'field': 'group',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'20%'},
      },
      {
        'label': this.translate("MODULES.LOGICAL.EGP.TAB.POLICY.TABLE.TENANT"),
        'field': 'tenant',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'50%'},
      }
    ];
  }

  getPolicyRulesSchema() {
    return [
      {
        'label': this.translate("MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.IP_PROTO"),
        'field': 'ip_proto',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate("MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.SRC_IP"),
        'field': 'src_ip',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate("MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.DST_IP"),
        'field': 'dst_ip',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate("MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.DST_MAC"),
        'field': 'dst_mac',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate("MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.VLAN"),
        'field': 'vid',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate("MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.SRC_PORT"),
        'field': 'src_port',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate("MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.DST_PORT"),
        'field': 'dst_port',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate("MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.ICMP_TYPE"),
        'field': 'icmp_type',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate("MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.ICMP_CODE"),
        'field': 'icmp_code',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate('MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.RULE.ACTION'),
        'field': 'action',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      }
    ];
  }

  getEGPActionsShow() {
    return {
      'menu': {'enable': false, 'role': 3}, 
      'add': {'enable': true, 'role': 3}, 
      'remove': {'enable': true, 'role': 3}, 
      'refresh': {'enable': true, 'role': 3}, 
      'search': {'enable': false, 'role': 3}
    };
  }

  getEGPRowActions() {
    return [
      {
        'label': this.translate('MODULES.LOGICAL.EGP.ROW.ACTION.DELETE'),
        'role': 3,
        'value': 'delete'
      }
    ];  
  }
}


logicalService.$inject = logicalService.getDI();
logicalService.$$ngIsClass = true;