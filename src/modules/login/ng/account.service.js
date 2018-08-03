export class accountService {
  static getDI() {
    return [
      '$filter',
    ];
  }
  constructor(...args) {
    this.di = {};
    accountService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
    this.translate = this.di.$filter('translate');
  }

  getActionsShow() {
    return {'menu': false, 'add': true, 'remove': true, 'refresh': true, 'search': true};
  }

  getTableSchema() {
    return [
      {
        'label': this.translate('MODULE.ACCOUNT.MANAGE.COLUMN.NAME'),
        'field': 'user_name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULE.ACCOUNT.MANAGE.COLUMN.GROUP'),
        'field': 'group',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      }
    ];
  }
}
accountService.$inject = accountService.getDI();
accountService.$$ngIsClass = true;