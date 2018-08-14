/**
 * Created by wls on 2018/7/17.
 */
export class alertService {
  static getDI() {
    return [
      '$location',
      '$filter',
      '_'
    ];
  }

  constructor(...args) {
    this.di = {};
    alertService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
  }

  getAlertTableSchema(){
    let test = this.translate('MODULES.ALERT.HISTORY.RULE_NAME');
    return [
      {
        'label': this.translate('MODULES.ALERT.HISTORY.RULE_NAME'),
        'field': 'rule_name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate('MODULES.ALERT.HISTORY.ALERT_LEVEL'),
        'field': 'alert_level',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.ALERT.HISTORY.RECEIVE_GROUP'),
        'field': 'receive_group',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.ALERT.HISTORY.FROM'),
        'field': 'from',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.ALERT.HISTORY.MSG'),
        'field': 'msg',
        'layout': {'visible': true, 'sortable': true,}
      }
    ];
  }

}


alertService.$inject = alertService.getDI();
alertService.$$ngIsClass = true;