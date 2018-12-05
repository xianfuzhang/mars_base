/**
 * Created by wls on 2018/7/17.
 */
export class manageService {
  static getDI() {
    return [
      '$location',
      '$filter',
      '_'
    ];
  }

  constructor(...args) {
    this.di = {};
    manageService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
  }

  getDHCPTabSchema() {
    return [
      {
        'label': this.translate('MODULES.MANAGE.DHCP.TAB.DHCP_SERVER'),
        'value': 'dhcp_server',
        'type': 'dhcp_server'
      },
      {
        'label': this.translate('MODULES.MANAGE.DHCP.TAB.IPMAC_MAPPING'),
        'value': 'ipmac_mapping',
        'type': 'ipmac_mapping'
      },
      {
        'label': this.translate('MODULES.MANAGE.DHCP.TAB.DHCP_SERVER_V6'),
        'value': 'dhcp_server_v6',
        'type': 'dhcp_server_v6'
      },
      {
        'label': this.translate('MODULES.MANAGE.DHCP.TAB.IPMAC_MAPPING_V6'),
        'value': 'ipmac_mapping_v6',
        'type': 'ipmac_mapping_v6'
      }
    ];
  }

  getDHCPTableSchema(){
    return [
      {
        'label': this.translate("MODULES.MANAGE.DHCP.TABLE.MAC"),
        'field': 'host',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate("MODULES.MANAGE.DHCP.TABLE.IP"),
        'field': 'ip',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      }
    ];
  }

  getDHCPV6TableSchema(){
    return [
      {
        'label': this.translate("MODULES.MANAGE.DHCPV6.TABLE.MAC"),
        'field': 'host',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate("MODULES.MANAGE.DHCPV6.TABLE.IP"),
        'field': 'ip',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate("MODULES.MANAGE.DHCPV6.TABLE.TIMESTAMP"),
        'field': 'timestamp',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      }
    ];
  }


}


manageService.$inject = manageService.getDI();
manageService.$$ngIsClass = true;