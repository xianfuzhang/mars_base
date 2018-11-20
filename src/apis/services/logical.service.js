/**
 * Created by wls on 2018/7/17.
 */
export class logicalService {
  static getDI() {
    return [
      '$location',
      '$filter',
      '_'
    ];
  }

  constructor(...args) {
    this.di = {};
    logicalService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
  }

  // getDHCPTabSchema() {
  //   return [
  //     {
  //       'label': this.translate('MODULES.MANAGE.DHCP.TAB.DHCP_SERVER'),
  //       'value': 'dhcp_server',
  //       'type': 'dhcp_server'
  //     },
  //     {
  //       'label': this.translate('MODULES.MANAGE.DHCP.TAB.IPMAC_MAPPING'),
  //       'value': 'ipmac_mapping',
  //       'type': 'ipmac_mapping'
  //     }
  //   ];
  // }

  getTenantTableSchema(){
    return [
      {
        'label': this.translate("MODULES.LOGICAL.TENANT.TABLE.NAME"),
        'type': 'clickabletext',
        'field': 'name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate("MODULES.LOGICAL.TENANT.TABLE.TYPE"),
        'field': 'type',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      }
    ];
  }


}


logicalService.$inject = logicalService.getDI();
logicalService.$$ngIsClass = true;