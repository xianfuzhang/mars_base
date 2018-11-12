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
    return {'menu': false, 'add': true, 'remove': true, 'refresh': true, 'search': false};
  }

  getIntentTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.DELETE'),
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