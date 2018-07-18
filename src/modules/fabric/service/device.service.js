export class DeviceService{
  static getDI(){
    return ['$filter'];
  }

  constructor(...args){
    this.di={};
    DeviceService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
  }


  getAllSwitches(){
    return [{"id":"of:0000000000000001","type":"spine","available":true,"role":"MASTER","mfr":"Nicira, Inc.","hw":"Open vSwitch","sw":"2.5.4","serial":"None","driver":"ovs","mac":"00-00-11-22-33-44","rack_id":"10-1-2-3","chassisId":"3","lastUpdate":"1528558441869","humanReadableLastUpdate":"connected 4m52s ago","annotations":{"channelId":"192.168.123.3:36892","managementAddress":"192.168.123.3","protocol":"OF_13"}},{"id":"of:0000000000000002","type":"spine","available":true,"role":"MASTER","mfr":"Nicira, Inc.","hw":"Open vSwitch","sw":"2.5.4","serial":"None","driver":"ovs","mac":"00-00-11-22-33-44","rack_id":"10-1-2-3","chassisId":"3","lastUpdate":"1528558441869","humanReadableLastUpdate":"connected 4m52s ago","annotations":{"channelId":"192.168.123.3:36892","managementAddress":"192.168.123.3","protocol":"OF_13"}},{"id":"of:0000000000000003","type":"spine","available":true,"role":"MASTER","mfr":"Nicira, Inc.","hw":"Open vSwitch","sw":"2.5.4","serial":"None","driver":"ovs","mac":"00-00-11-22-33-44","rack_id":"10-1-2-3","chassisId":"3","lastUpdate":"1528558441869","humanReadableLastUpdate":"connected 4m52s ago","annotations":{"channelId":"192.168.123.3:36892","managementAddress":"192.168.123.3","protocol":"OF_13"}},{"id":"of:0000000000000011","type":"leaf","leaf_group":"1","available":true,"role":"MASTER","mfr":"Nicira, Inc.","hw":"Open vSwitch","sw":"2.5.4","serial":"None","driver":"ovs","mac":"00-00-11-22-33-44","rack_id":"10-1-2-3","chassisId":"3","lastUpdate":"1528558441869","humanReadableLastUpdate":"connected 4m52s ago","annotations":{"channelId":"192.168.123.3:36892","managementAddress":"192.168.123.3","protocol":"OF_13"}},{"id":"of:0000000000000012","type":"leaf","leaf_group":"2","available":true,"role":"MASTER","mfr":"Nicira, Inc.","hw":"Open vSwitch","sw":"2.5.4","serial":"None","driver":"ovs","mac":"00-00-11-22-33-44","rack_id":"10-1-2-3","chassisId":"3","lastUpdate":"1528558441869","humanReadableLastUpdate":"connected 4m52s ago","annotations":{"channelId":"192.168.123.3:36892","managementAddress":"192.168.123.3","protocol":"OF_13"}},{"id":"of:0000000000000013","type":"leaf","leaf_group":"3","available":true,"role":"MASTER","mfr":"Nicira, Inc.","hw":"Open vSwitch","sw":"2.5.4","serial":"None","driver":"ovs","mac":"00-00-11-22-33-44","rack_id":"10-1-2-3","chassisId":"3","lastUpdate":"1528558441869","humanReadableLastUpdate":"connected 4m52s ago","annotations":{"channelId":"192.168.123.3:36892","managementAddress":"192.168.123.3","protocol":"OF_13"}},{"id":"of:0000000000000014","type":"leaf","leaf_group":"1","available":true,"role":"MASTER","mfr":"Nicira, Inc.","hw":"Open vSwitch","sw":"2.5.4","serial":"None","driver":"ovs","mac":"00-00-11-22-33-44","rack_id":"10-1-2-3","chassisId":"3","lastUpdate":"1528558441869","humanReadableLastUpdate":"connected 4m52s ago","annotations":{"channelId":"192.168.123.3:36892","managementAddress":"192.168.123.3","protocol":"OF_13"}},{"id":"of:0000000000000015","type":"leaf","leaf_group":"3","available":true,"role":"MASTER","mfr":"Nicira, Inc.","hw":"Open vSwitch","sw":"2.5.4","serial":"None","driver":"ovs","mac":"00-00-11-22-33-44","rack_id":"10-1-2-3","chassisId":"3","lastUpdate":"1528558441869","humanReadableLastUpdate":"connected 4m52s ago","annotations":{"channelId":"192.168.123.3:36892","managementAddress":"192.168.123.3","protocol":"OF_13"}},{"id":"of:0000000000000016","type":"leaf","leaf_group":"4","available":true,"role":"MASTER","mfr":"Nicira, Inc.","hw":"Open vSwitch","sw":"2.5.4","serial":"None","driver":"ovs","mac":"00-00-11-22-33-44","rack_id":"10-1-2-3","chassisId":"3","lastUpdate":"1528558441869","humanReadableLastUpdate":"connected 4m52s ago","annotations":{"channelId":"192.168.123.3:36892","managementAddress":"192.168.123.3","protocol":"OF_13"}},{"id":"of:0000000000000021","type":"other","available":true,"role":"MASTER","mfr":"Nicira, Inc.","hw":"Open vSwitch","sw":"2.5.4","serial":"None","driver":"ovs","mac":"00-00-11-22-33-44","rack_id":"10-1-2-3","chassisId":"3","lastUpdate":"1528558441869","humanReadableLastUpdate":"connected 4m52s ago","annotations":{"channelId":"192.168.123.3:36892","managementAddress":"192.168.123.3","protocol":"OF_13"}},{"id":"of:0000000000000022","type":"other","available":true,"role":"MASTER","mfr":"Nicira, Inc.","hw":"Open vSwitch","sw":"2.5.4","serial":"None","driver":"ovs","mac":"00-00-11-22-33-44","rack_id":"10-1-2-3","chassisId":"3","lastUpdate":"1528558441869","humanReadableLastUpdate":"connected 4m52s ago","annotations":{"channelId":"192.168.123.3:36892","managementAddress":"192.168.123.3","protocol":"OF_13"}},{"id":"of:0000000000000033","type":"other","available":true,"role":"MASTER","mfr":"Nicira, Inc.","hw":"Open vSwitch","sw":"2.5.4","serial":"None","driver":"ovs","mac":"00-00-11-22-33-44","rack_id":"10-1-2-3","chassisId":"3","lastUpdate":"1528558441869","humanReadableLastUpdate":"connected 4m52s ago","annotations":{"channelId":"192.168.123.3:36892","managementAddress":"192.168.123.3","protocol":"OF_13"}}];
  }

  getAllLinks(){
    return [{"src":{"port":"1","device":"of:0000000000000001"},"dst":{"port":"3","device":"of:0000000000000011"},"type":"DIRECT","state":"ACTIVE"},{"src":{"port":"1","device":"of:0000000000000001"},"dst":{"port":"3","device":"of:0000000000000012"},"type":"DIRECT","state":"ACTIVE"},{"src":{"port":"1","device":"of:0000000000000001"},"dst":{"port":"3","device":"of:0000000000000013"},"type":"DIRECT","state":"ACTIVE"},{"src":{"port":"1","device":"of:0000000000000001"},"dst":{"port":"3","device":"of:0000000000000014"},"type":"DIRECT","state":"ACTIVE"},{"src":{"port":"1","device":"of:0000000000000001"},"dst":{"port":"3","device":"of:0000000000000015"},"type":"DIRECT","state":"ACTIVE"},{"src":{"port":"1","device":"of:0000000000000002"},"dst":{"port":"3","device":"of:0000000000000011"},"type":"DIRECT","state":"ACTIVE"},{"src":{"port":"1","device":"of:0000000000000002"},"dst":{"port":"3","device":"of:0000000000000012"},"type":"DIRECT","state":"DOWN"},{"src":{"port":"1","device":"of:0000000000000002"},"dst":{"port":"3","device":"of:0000000000000013"},"type":"DIRECT","state":"ACTIVE"},{"src":{"port":"1","device":"of:0000000000000002"},"dst":{"port":"3","device":"of:0000000000000014"},"type":"DIRECT","state":"DOWN"},{"src":{"port":"1","device":"of:0000000000000002"},"dst":{"port":"3","device":"of:0000000000000015"},"type":"DIRECT","state":"ACTIVE"},{"src":{"port":"1","device":"of:0000000000000002"},"dst":{"port":"3","device":"of:0000000000000016"},"type":"DIRECT","state":"DOWN"},{"src":{"port":"1","device":"of:0000000000000003"},"dst":{"port":"3","device":"of:0000000000000011"},"type":"DIRECT","state":"ACTIVE"},{"src":{"port":"1","device":"of:0000000000000003"},"dst":{"port":"3","device":"of:0000000000000012"},"type":"DIRECT","state":"ACTIVE"},{"src":{"port":"1","device":"of:0000000000000003"},"dst":{"port":"3","device":"of:0000000000000014"},"type":"DIRECT","state":"ACTIVE"},{"src":{"port":"1","device":"of:0000000000000003"},"dst":{"port":"3","device":"of:0000000000000015"},"type":"DIRECT","state":"DOWN"},{"src":{"port":"1","device":"of:0000000000000003"},"dst":{"port":"3","device":"of:0000000000000016"},"type":"DIRECT","state":"ACTIVE"}];
  }

  getInterfaceByDevice(){
    return {"id":"of:0000000000000001","type":"leaf","available":true,"role":"MASTER","mfr":"Nicira, Inc.","hw":"Open vSwitch","sw":"2.5.4","serial":"None","driver":"ovs","mac":"00-00-11-22-33-44","rack_id":"10-1-2-3","chassisId":"1","lastUpdate":"1528558441869","humanReadableLastUpdate":"connected 7m27s ago","annotations":{"channelId":"192.168.123.3:36890","managementAddress":"192.168.123.3","protocol":"OF_13"},"ports":[{"element":"of:0000000000000001","port":"local","isEnabled":false,"type":"copper","portSpeed":0,"annotations":{"adminState":"disabled","portMac":"2a:a7:13:49:9b:4c","portName":"s1"}},{"element":"of:0000000000000001","port":"1","isEnabled":true,"type":"copper","portSpeed":10000,"annotations":{"adminState":"enabled","portMac":"16:58:3f:b7:5d:66","portName":"s1-eth1"}},{"element":"of:0000000000000001","port":"2","isEnabled":true,"type":"copper","portSpeed":10000,"annotations":{"adminState":"enabled","portMac":"4a:be:5b:f7:bc:60","portName":"s1-eth2"}}]}
  }

  getTabSchema() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.TAB.SCHEMA.DEVICE'),
        'value': 'device',
        'type': 'device'
      },
      {
        'label': this.translate('MODULES.SWITCHES.TAB.SCHEMA.PORT'),
        'value': 'port',
        'type': 'port'
      },
      {
        'label': this.translate('MODULES.SWITCHES.TAB.SCHEMA.LINK'),
        'value': 'link',
        'type': 'link'
      },
      {
        'label': this.translate('MODULES.SWITCHES.TAB.SCHEMA.ENDPOINT'),
        'value': 'endpoint',
        'type': 'endpoint'
      }
    ];
  }

  getDeviceActionsShow() {
    return {'menu': true, 'add': true, 'remove': true, 'refresh': true, 'search': true};
  }

  getPortActionsShow() {
    return {'menu': true, 'add': false, 'remove': false, 'refresh': true, 'search': true};
  }

  getLinkActionsShow() {
    return {'menu': true, 'add': false, 'remove': false, 'refresh': true, 'search': true};
  }

  getEndpointActionsShow() {
    return {'menu': false, 'add': true, 'remove': true, 'refresh': true, 'search': true};
  }

  getDeviceTableSchema() {
    return [
      /*{
        'label': 'ID',
        'field': 'id',
        'layout': {'visible': false, 'sortable': false, 'fixed': true}
      },*/
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.NAME'),
        'field': 'switch_name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.IP'),
        'field': 'ip',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.MAC'),
        'field': 'mac',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.TYPE'),
        'field': 'type',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.ROLE'),
        'field': 'role',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.RACK'),
        'field': 'rack_id',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.AVAILABLE'),
        'field': 'available',
        'layout': {'visible': true, 'sortable': true}
      },
      /*{
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.PORTS'),
        'field': 'ports',
        'layout': {'visible': true, 'sortable': true}
      },*/
      {
        'label': 'CHASSIS',
        'field': 'chassisId',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.PROTOCOL'),
        'field': 'protocol',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.MFR'),
        'field': 'mfr',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.SERIAL'),
        'field': 'serial',
        'layout': {'visible': true, 'sortable': true}
      },{
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.HW'),
        'field': 'hw',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.SW'),
        'field': 'sw',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }

  getDeviceTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.EDIT'),
        'value': 'edit'
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.DELETE'),
        'value': 'delete'
      }
    ]
  }

  getPortTableSchema() {
    return [
      /*{
        'label': 'ID',
        'field': 'id',
        'layout': {'visible': true, 'sortable': false, 'fixed': true}
      },*/
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
      {
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.DEVICE'),
        'field': 'device_name',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }

  getPortTableRowActions() {
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

  getLinkTableSchema() {
    return [
     /* {
        'label': 'ID',
        'field': 'id',
        'layout': {'visible': true, 'sortable': false, 'fixed': true}
      },*/
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

  getEndpointTableSchema(){
    return [
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.TENANT'),
        'field': 'tenant_name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.SEGMENT'),
        'field': 'segment_name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.MAC'),
        'field': 'mac',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.IP'),
        'field': 'ip',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.LOCATION'),
        'field': 'location',
        'layout': {'visible': true, 'sortable': true}
      },
    ];
  }

  getEndpointTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.ROW.ACTION.DELETE'),
        'value': 'delete'
      }
    ];
  }
}

DeviceService.$inject = DeviceService.getDI();
DeviceService.$$ngIsClass = true;