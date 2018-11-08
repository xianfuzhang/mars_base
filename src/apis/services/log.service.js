export class LogService {
  static getDI() {
    return [
      '$filter',
    ];
  }
  constructor(...args) {
    this.di = {};
    LogService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
    this.translate = this.di.$filter('translate');
  }

  getActionsShow() {
    return {'refresh': true, 'search': true};
  }

  getTableSchema() {
    return [
      {
        'label': this.translate('MODULE.LOG.COLUMN.TIME'),
        'field': 'created_time',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULE.LOG.COLUMN.TYPE'),
        'field': 'type',
        'layout': {'visible': true, 'sortable': false, 'fixed': true}
      },
      {
        'label': this.translate('MODULE.LOG.COLUMN.LEVEL'),
        'field': 'level',
        'layout': {'visible': true, 'sortable': false, 'fixed': true}
      },
      {
        'label': this.translate('MODULE.LOG.COLUMN.OPERATION'),
        'field': 'operation',
        'layout': {'visible': true, 'sortable': false, 'fixed': true}
      },
      {
        'label': this.translate('MODULE.LOG.COLUMN.CREATOR'),
        'field': 'creator',
        'layout': {'visible': true, 'sortable': false, 'fixed': true}
      },
      {
        'label': this.translate('MODULE.LOG.COLUMN.CONTENT'),
        'field': 'content',
        'type':'popuptext',
        'layout': {'visible': true, 'sortable': false, 'fixed': true}
      },
    ];
  }
}
LogService.$inject = LogService.getDI();
LogService.$$ngIsClass = true;