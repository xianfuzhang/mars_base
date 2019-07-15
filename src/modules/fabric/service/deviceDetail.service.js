export class DeviceDetailService {
  static getDI() {
    return [
      '$filter',
      'roleService'
    ];
  }

  constructor(...args) {
    this.di = {};
    DeviceDetailService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    this.translate = this.di.$filter('translate');
  }

  getTabSchema() {
    return [
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.TAB.SCHEMA.SUMMARY'),
        'value': 'summary',
        'type': 'summary'
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.TAB.SCHEMA.ANALYZER'),
        'value': 'analyzer',
        'type': 'analyzer'
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.TAB.SCHEMA.PORT'),
        'value': 'port',
        'type': 'port'
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.TAB.SCHEMA.LINK'),
        'value': 'link',
        'type': 'link'
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.TAB.SCHEMA.STATISTICS'),
        'value': 'statistic',
        'type': 'statistic'
      },
      // {
      //   'label': this.translate('MODULES.SWITCH.DETAIL.TAB.SCHEMA.FLOW'),
      //   'value': 'flow',
      //   'type': 'flow'
      // },
      // {
      //   'label': this.translate('MODULES.SWITCH.DETAIL.TAB.SCHEMA.GROUPS'),
      //   'value': 'group',
      //   'type': 'group'
      // },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.TAB.SCHEMA.ENDPOINTS'),
        'value': 'endpoint',
        'type': 'endpoint'
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.TAB.SCHEMA.PFC'),
        'value': 'pfc',
        'type': 'pfc'
      }
    ];
  }

  getPortActionsShow() {
    return {
      'menu': {'enable': false, 'role': 2}, 
      'add': {'enable': false, 'role': 2}, 
      'remove': {'enable': false, 'role': 2}, 
      'refresh': {'enable': true, 'role': 2}, 
      'search': {'enable': false, 'role': 2}
    };
  }

  getLinkActionsShow() {
    return {
      'menu': {'enable': false, 'role': 2}, 
      'add': {'enable': false, 'role': 2}, 
      'remove': {'enable': false, 'role': 2}, 
      'refresh': {'enable': true, 'role': 2}, 
      'search': {'enable': false, 'role': 2}
    };
  }

  getStatisticActionsShow() {
    return {
      'menu': {'enable': false, 'role': 2}, 
      'add': {'enable': false, 'role': 2}, 
      'remove': {'enable': false, 'role': 2}, 
      'refresh': {'enable': true, 'role': 2}, 
      'search': {'enable': false, 'role': 2}
    };
  }

  getFlowActionsShow() {
    return {
      'menu': {'enable': false, 'role': 2}, 
      'add': {'enable': true, 'role': 2}, 
      'remove': {'enable': true, 'role': 2}, 
      'refresh': {'enable': true, 'role': 2}, 
      'search': {'enable': false, 'role': 2}
    };
  }

  getEndpointActionsShow() {
    return {
      'menu': {'enable': false, 'role': 2}, 
      'add': {'enable': false, 'role': 2}, 
      'remove': {'enable': false, 'role': 2}, 
      'refresh': {'enable': true, 'role': 2}, 
      'search': {'enable': false, 'role': 2}
    };
  }
  
  getGroupActionsShow() {
    return {
      'menu': {'enable': false, 'role': 2},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': true, 'role': 2},
      'refresh': {'enable': true, 'role': 2},
      'search': {'enable': false, 'role': 2}
    };
  }

  getPFCActionsShow() {
    return {
      'menu': {'enable': false, 'role': 2},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': true, 'role': 2},
      'refresh': {'enable': true, 'role': 2},
      'search': {'enable': false, 'role': 2}
    };
  }

  getDevicePortsSchema(isTenantEnable) {
    let defaultSchema = [
      {
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.NAME'),
        'field': 'port_name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.MAC'),
        'field': 'port_mac',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.PORT_ID'),
        'field': 'port_id',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.STATUS'),
        'field': 'port_status',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.LINK_STATUS'),
        'field': 'link_status',
        'type': 'icon',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.TYPE'),
        'field': 'type',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.SPEED'),
        'field': 'speed',
        'layout': {'visible': true, 'sortable': true}
      },
      /*{
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.DEVICE'),
        'field': 'device_name',
        'layout': {'visible': true, 'sortable': true}
      }*/
    ];
    
    if(this.di.roleService.getRole() > 2 && isTenantEnable) {
      defaultSchema.push({
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.SEGMENTS'),
        'field': 'segments',
        'layout': {'visible': true, 'sortable': false}
      })
    }
    
    return defaultSchema;
  }

  getDevicePortsTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.ENABLE'),
        'role': 2,
        'value': 'enable'
      },
      {
        'label': this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.DISABLE'),
        'role': 2,
        'value': 'disable'
      },
      {
        'label': this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.ANALYZER'),
        'role': 2,
        'value': 'analyzer'
      }
    ];
  }

  getDeviceFlowsTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.DETAIL'),
        'role': 2,
        'value': 'detail'
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ];
  }
  
  getDeviceGroupsTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ];
  }

  getDevicePFCTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.EDIT'),
        'role': 2,
        'value': 'edit'
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ];
  }

  getDeviceLinksSchema() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.SRC_DEVICE'),
        'field': 'src_device',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.SRC_PORT'),
        'field': 'src_port',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.DST_DEVICE'),
        'field': 'dst_device',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.DST_PORT'),
        'field': 'dst_port',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.STATUS'),
        'field': 'state',
        'type': 'icon',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.TYPE'),
        'field': 'type',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.DURATION'),
        'field': 'duration',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.PROTOCOL'),
        'field': 'protocol',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.LATENCY'),
        'field': 'latency',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }

  getDevicePortsStatisticsSchema() {
    return [
     /* {
        'label': this.translate('MODULES.SWITCH.DETAIL.STATISTICS.COLUMN.DEVICE'),
        'field': 'device',
        'layout': {'visible': true, 'sortable': true}
      },*/
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.STATISTICS.COLUMN.PORT'),
        'field': 'port',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.STATISTICS.COLUMN.RX_PKT'),
        'field': 'rx_pkt',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.STATISTICS.COLUMN.TX_PKT'),
        'field': 'tx_pkt',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.STATISTICS.COLUMN.RX_BYTE'),
        'field': 'rx_byte',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.STATISTICS.COLUMN.TX_BYTE'),
        'field': 'tx_byte',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.STATISTICS.COLUMN.RX_PKT_DROP'),
        'field': 'rx_pkt_drop',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.STATISTICS.COLUMN.TX_PKT_DROP'),
        'field': 'tx_pkt_drop',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.STATISTICS.COLUMN.RX_BYTE_ERROR'),
        'field': 'rx_pkt_error',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.STATISTICS.COLUMN.TX_BYTE_ERROR'),
        'field': 'tx_pkt_error',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.STATISTICS.COLUMN.DURATION'),
        'field': 'duration',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }

  getDeviceSFlowsSchema() {
    return [
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.DEVICE'),
        'field': 'device',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.PORT'),
        'field': 'port',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.DST_IP'),
        'field': 'ip',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.MAX_PAYLOAD'),
        'field': 'payload',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.MAX_HEADER'),
        'field': 'header',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.POLL_INTERVAL'),
        'field': 'interval',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.RATE'),
        'field': 'rate',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.DURATION'),
        'field': 'duration',
        'layout': {'visible': true, 'sortable': true}
      },
    ];
  }

  getSFlowActionsShow() {
     return {
      'menu': {'enable': false, 'role': 2},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': true, 'role': 2},
      'refresh': {'enable': true, 'role': 2},
      'search': {'enable': false, 'role': 2}
    };
  }

  getSFlowTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ];
  }

  getDeviceFlowsSchema() {
    return [
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.STATE'),
        'field': 'state',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.PACKETS'),
        'field': 'packets',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.DURATION'),
        'field': 'duration',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.PRIORITY'),
        'field': 'priority',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.TABLENAME'),
        'field': 'name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.SELECTOR'),
        'field': 'selector',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.TREATMENT'),
        'field': 'treatment',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.APP'),
        'field': 'app',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }

  getTopoDeviceFlowsSchema() {
    return [
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.STATE'),
        'field': 'state',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.PRIORITY'),
        'field': 'priority',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.TABLENAME'),
        'field': 'name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.SELECTOR'),
        'field': 'selector',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.TREATMENT'),
        'field': 'treatment',
        'layout': {'visible': true, 'sortable': true}
      },
    ];
  }
  
  getDeviceGroupsSchema() {
    return [
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.GROUP.COLUMN.ID'),
        'field': 'group_id',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.GROUP.COLUMN.STATE'),
        'field': 'state',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.GROUP.COLUMN.NAME'),
        'field': 'name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.GROUP.COLUMN.TYPE'),
        'field': 'type',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.GROUP.COLUMN.VLAN_ID'),
        'field': 'vlan_id',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.GROUP.COLUMN.BUCKETS'),
        'field': 'buckets',
        'layout': {'visible': true, 'sortable': true}
      },
    ];
  }
  
  getDevicePFCSchema() {
    return [
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.PFC.COLUMN.PORT'),
        'field': 'port',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.PFC.COLUMN.QUEUE'),
        'field': 'queues',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }
}
DeviceDetailService.$inject = DeviceDetailService.getDI();
DeviceDetailService.$$ngIsClass = true;