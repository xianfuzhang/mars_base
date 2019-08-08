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
    return {
      'menu': {'enable': false, 'role': 3}, 
      'add': {'enable': true, 'role': 3}, 
      'remove': {'enable': true, 'role': 3}, 
      'refresh': {'enable': true, 'role': 3}, 
      'search': {'enable': true, 'role': 3}
    };
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

  getRowActions() {
    return [
      {
        'label': this.translate('MODULE.ACCOUNT.TABLE.ROW.ACTION.EDIT'),
        'role': 3,
        'value': 'edit'
      },
      {
        'label': this.translate('MODULE.ACCOUNT.TABLE.ROW.ACTION.DELETE'),
        'role': 3,
        'value': 'delete'
      }
    ];
  }
}
accountService.$inject = accountService.getDI();
accountService.$$ngIsClass = true;