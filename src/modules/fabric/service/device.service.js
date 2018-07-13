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
}

DeviceService.$inject = DeviceService.getDI();
DeviceService.$$ngIsClass = true;