export class SnoopService{
  static getDI() {
    return [
      '$filter'
    ];
  }
  constructor(...args) {
    this.di = {};
    SnoopService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
  }

  getDeviceSnoopTableActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': false, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': true, 'role': 2}
    };
  }

  getPortSnoopTableActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': false, 'role': 2},
      'remove': {'enable': false, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': true, 'role': 2}
    };
  }

  getDeviceSnoopTableSchema() {
    return [
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.DEVICE_NAME'),
        'field': 'device_name',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.DELEGATE'),
        'field': 'delegate',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.GLOBAL_STATUS'),
        'field': 'global_status',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.INFO_STATUS'),
        'field': 'info_status',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.MAC_VERIFY'),
        'field': 'mac_verify',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.VLAN'),
        'field': 'vlan',
        'layout': {'visible': true, 'sortable': false}
      }
    ];
  }

  getDeviceSnoopTableRowActions() {
    return [
     {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.ROW.ACTION.UPDATE'),
        'role': 2,
        'value': 'update'
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ];
  }

  getPortSnoopTableSchema() {
    return [
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.DEVICE_NAME'),
        'field': 'device_name',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.PORT'),
        'field': 'port',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.TRUST'),
        'field': 'trusted_display',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.CIRCUIT'),
        'field': 'circuitId',
        'layout': {'visible': true, 'sortable': false}
      }
    ];
  }

  getPortSnoopTableRowActions() {
    return [
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.ROW.ACTION.UPDATE'),
        'role': 2,
        'value': 'update'
      }
    ];
  }

  getHostSnoopTableSchema() {
    return [
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.DEVICE_NAME'),
        'field': 'device_name',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.INTERFACE'),
        'field': 'interface',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.VLAN'),
        'field': 'vlan',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.TYPE'),
        'field': 'type',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.LEASE'),
        'field': 'lease',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.IP_ADDRESS'),
        'field': 'ip_address',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.MAC_ADDRESS'),
        'field': 'mac_address',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.SCHEMA.HOST_NAME'),
        'field': 'host_name',
        'layout': {'visible': true, 'sortable': false}
      }
    ];
  }

  getHostSnoopTableActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': false, 'role': 2},
      'remove': {'enable': false, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': true, 'role': 2}
    };
  }

  getTrafficSegmentTableActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': false, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': true, 'role': 2}
    };
  }

  getTrafficSegmentTableRowActions() {
    return [
      {
        'label': this.translate('MODULE.FUNCTIONS.SOOPING.TABLE.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ];
  }

  getTrafficSegmentTableSchema() {
    return [
      {
        'label': this.translate('MODULE.FUNCTIONS.TRAFFIC.TABLE.SCHEMA.DEVICE_NAME'),
        'field': 'device_name',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.TRAFFIC.TABLE.SCHEMA.SESSION'),
        'field': 'session',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.TRAFFIC.TABLE.SCHEMA.EXCLUDEVLANS'),
        'field': 'exclude_vlans',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.TRAFFIC.TABLE.SCHEMA.UP_LINKS'),
        'field': 'up_links',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULE.FUNCTIONS.TRAFFIC.TABLE.SCHEMA.DOWN_LINKS'),
        'field': 'down_links',
        'layout': {'visible': true, 'sortable': false}
      }
    ];
  }
}
SnoopService.$inject = SnoopService.getDI();
SnoopService.$$ngIsClass = true;