export class AclService{
  static getDI() {
    return [
      '$filter'
    ];
  }
  constructor(...args) {
    this.di = {};
    AclService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
  }

  getTableActionsShow() {
    return {
      'menu': {'enable': true, 'role': 1},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': true, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': true, 'role': 2}
    };
  }

  getTableSchema() {
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

  getTableRowActions() {
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
}
AclService.$inject = AclService.getDI();
AclService.$$ngIsClass = true;