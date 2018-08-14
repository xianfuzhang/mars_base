export class DeviceDetailService {
  static getDI() {
    return [
      '$filter',
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
      /*{
        'label': this.translate('MODULES.SWITCH.DETAIL.TAB.SCHEMA.FLOW'),
        'value': 'flow',
        'type': 'flow'
      }*/
    ];
  }

  getPortActionsShow() {
    return {'menu': false, 'add': false, 'remove': false, 'refresh': true, 'search': true};
  }

  getLinkActionsShow() {
    return {'menu': false, 'add': false, 'remove': false, 'refresh': true, 'search': true};
  }

  getStatisticActionsShow() {
    return {'menu': false, 'add': false, 'remove': false, 'refresh': true, 'search': true};
  }

  getFlowActionsShow() {
    return {'menu': false, 'add': true, 'remove': true, 'refresh': true, 'search': true};
  }

  getDevicePortsSchema() {
    return [
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
  }

  getDevicePortsTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.ENABLE'),
        'value': 'enable'
      },
      {
        'label': this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.DISABLE'),
        'value': 'disable'
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
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.PORT'),
        'field': 'port',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.DURATION'),
        'field': 'duration',
        'layout': {'visible': true, 'sortable': true}
      },
    ];
  }

  getDevicePFCSchema() {
    return [];
  }
}
DeviceDetailService.$inject = DeviceDetailService.getDI();
DeviceDetailService.$$ngIsClass = true;