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
      'menu': {'enable': false, 'role': 2},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': true, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': true, 'role': 2}
    };
  }

  getTableSchema(hasDevice) {
    if(hasDevice) {
      return [
        {
          'label': this.translate('MODULE.FUNCTIONS.ACL.TABLE.SCHEMA.POLICY_ID'),
          'field': 'policy_id',
          'layout': {'visible': true, 'sortable': false}
        },
        {
          'label': this.translate('MODULE.FUNCTIONS.ACL.TABLE.SCHEMA.PORT_NAME'),
          'field': 'port',
          'layout': {'visible': true, 'sortable': true}
        },
        {
          'label': this.translate('MODULE.FUNCTIONS.ACL.TABLE.SCHEMA.DIRECTION'),
          'field': 'direction',
          'layout': {'visible': true, 'sortable': true}
        },
        {
          'label': this.translate('MODULE.FUNCTIONS.ACL.TABLE.SCHEMA.ACTION'),
          'field': 'action',
          'type': 'icon',
          'layout': {'visible': true, 'sortable': false}
        }
      ];
    } else {
      return [
        {
          'label': this.translate('MODULE.FUNCTIONS.ACL.TABLE.SCHEMA.POLICY_ID'),
          'field': 'policy_id',
          'layout': {'visible': true, 'sortable': false}
        },
        {
          'label': this.translate('MODULE.FUNCTIONS.ACL.TABLE.SCHEMA.DEVICE_NAME'),
          'field': 'device_name',
          'layout': {'visible': true, 'sortable': true}
        },
        {
          'label': this.translate('MODULE.FUNCTIONS.ACL.TABLE.SCHEMA.PORT_NAME'),
          'field': 'port',
          'layout': {'visible': true, 'sortable': true}
        },
        {
          'label': this.translate('MODULE.FUNCTIONS.ACL.TABLE.SCHEMA.DIRECTION'),
          'field': 'direction',
          'layout': {'visible': true, 'sortable': true}
        },
        {
          'label': this.translate('MODULE.FUNCTIONS.ACL.TABLE.SCHEMA.ACTION'),
          'field': 'action',
          'type': 'icon',
          'layout': {'visible': true, 'sortable': false}
        }
      ];
    }
  }

  getTableRowActions() {
    return [
     // {
     //    'label': this.translate('MODULE.FUNCTIONS.ACL.TABLE.ROW.ACTION.UPDATE'),
     //    'role': 2,
     //    'value': 'edit'
     //  },
      {
        'label': this.translate('MODULE.FUNCTIONS.ACL.TABLE.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ];
  }
}
AclService.$inject = AclService.getDI();
AclService.$$ngIsClass = true;