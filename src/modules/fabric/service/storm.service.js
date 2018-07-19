export class StormService {
  static getDI() {
    return ['$filter'];
  }

  constructor(...args) {
    this.di = {};
    StormService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
  }

  getTabSchema() {
    return [
      {
        'label': this.translate('MODULES.STORM.TAB.SCHEMA.STORM'),
        'value': 'storm',
        'type': 'storm'
      },
    ];
  }

  getStormActionsShow() {
    return {'menu': false, 'add': true, 'remove': true, 'refresh': true, 'search': true};
  }

  getStormTableSchema() {
    return [
      {
        'label': this.translate('MODULES.STORM.STORM.COLUMN.NAME'),
        'field': 'name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.STORM.STORM.COLUMN.UCAST'),
        'field': 'ucast',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.STORM.STORM.COLUMN.MCAST'),
        'field': 'mcast',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.STORM.STORM.COLUMN.BCAST'),
        'field': 'bcast',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }
}
StormService.$inject = StormService.getDI();
StormService.$$ngIsClass = true;
