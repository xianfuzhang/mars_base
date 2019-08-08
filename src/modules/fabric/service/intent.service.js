export class IntentService {
  static getDI() {
    return ['$filter'];
  }

  constructor(...args) {
    this.di = {};
    IntentService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
  }

  getIntentActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1}, 
      'add': {'enable': true, 'role': 2}, 
      'remove': {'enable': true, 'role': 2}, 
      'refresh': {'enable': true, 'role': 1}, 
      'search': {'enable': false, 'role': 2}
    };
  }

  getIntentTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ]
  }

  getIntentTableSchema() {
    return [
      {
        'label': this.translate('MODULES.INTENT.COLUMN.SRC_END'),
        'field': 'src_end',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.INTENT.COLUMN.DST_END'),
        'field': 'dst_end',
        'layout': {'visible': true, 'sortable': true}
      },
      /*{
        'label': this.translate('MODULES.INTENT.COLUMN.PRIORITY'),
        'field': 'priority',
        'layout': {'visible': true, 'sortable': true}
      },*/
      {
        'label': this.translate('MODULES.INTENT.COLUMN.TYPE'),
        'field': 'type',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.INTENT.COLUMN.APP'),
        'field': 'appId',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.INTENT.COLUMN.STATE'),
        'field': 'state',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }
}
IntentService.$inject = IntentService.getDI();
IntentService.$$ngIsClass = true;