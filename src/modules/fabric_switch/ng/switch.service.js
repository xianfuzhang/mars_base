export class switchService{
  static getDI(){
    return ['$filter'];
  }

  constructor(...args){
    this.di={};
    switchService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
  }

  getTabSchema() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.TAB.SCHEMA.SWITCH'),
        'value': 'switch',
        'type': 'switch'
      }
    ];
  }

  getSwitchActionsShow() {
    return {'menu': true, 'add': true, 'remove': true, 'refresh': true, 'search': true};
  }

  getSwitchTableSchema() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.TABLE.COLUMN.NAME'),
        'field': 'name',
        'layout': {'visible': true, 'sortable': true},
      },
      {
        'label': 'Device ID',
        'field': 'id',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': 'Ports',
        'field': 'port',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': 'Protocol',
        'field': 'protocol',
        'layout': {'visible': true, 'sortable': true}
      },
    ];
  }

  getSwitchTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.TABLE.ROW.ACTION.EDIT'),
        'value': 'edit'
      },
      {
        'label': this.translate('MODULES.SWITCHES.TABLE.ROW.ACTION.DELETE'),
        'value': 'delete'
      }
    ]
  }
}

switchService.$inject = switchService.getDI();
switchService.$$ngIsClass = true;