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

  getNTPTableSchema(){
    return [
      {
        'label': 'Servers',
        'field': 'host',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      }
    ];
  }

  getTimeRangeTableSchema(){
    return [
      {
        'label': 'type',
        'field': 'type',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': 'start',
        'field': 'start',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': 'end',
        'field': 'end',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      }
    ];
  }

  getApplicationTableActionsShow(){
    return {
      'menu': {'enable': false, 'role': 3},
      'add': {'enable': true, 'role': 3},
      'remove': {'enable': false, 'role': 3},
      'refresh': {'enable': true, 'role': 3},
      'search': {'enable': true, 'role': 3}
    };
  }

  getApplicationTableRowActions(){
    return [
      {
        'label': this.translate('MODULES.MANAGE.APPLICATION.ROW.ACTION.ACTIVE'),
        'role': 3,
        'value': 'active'
      },
      {
        'label': this.translate('MODULES.MANAGE.APPLICATION.ROW.ACTION.DE_ACTIVE'),
        'role': 3,
        'value': 'deactive'
      },
      {
        'label': this.translate('MODULES.MANAGE.APPLICATION.ROW.ACTION.DELETE'),
        'role': 3,
        'value': 'delete'
      }
    ]
  }

  getApplicationTableSchema(){
    return [
      {
        'label': this.translate("MODULES.MANAGE.APPLICATION.TABLE.STATUS"),
        'field': 'status',
        'type': 'icon',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'60px'},
      },
      {
        'label': this.translate("MODULES.MANAGE.APPLICATION.TABLE.APP_ID"),
        'field': 'app_id',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'250px'}
      },
      {
        'label': this.translate("MODULES.MANAGE.APPLICATION.TABLE.VERSION"),
        'field': 'version',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'150px'}
      },
      {
        'label': this.translate("MODULES.MANAGE.APPLICATION.TABLE.CATEGORY"),
        'field': 'category',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'150px'}
      },
      {
        'label': this.translate("MODULES.MANAGE.APPLICATION.TABLE.ORIGIN"),
        'field': 'origin',
        'layout': {'visible': true, 'sortable': true, 'fixed': true,'width':'200px'}
      },
      {
        'label': this.translate("MODULES.MANAGE.APPLICATION.TABLE.TITLE"),
        'field': 'title',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      }
    ];
  }
	
	getLicenseTableSchema(){
		return [
			{
				'label': this.translate("MODULES.MANAGE.LICENSE.COLUMN.APP_NAME"),
				'field': 'name',
				'layout': {'visible': true, 'sortable': true, 'fixed': true},
			},
			{
				'label': this.translate("MODULES.MANAGE.LICENSE.COLUMN.APP_ALLOW"),
				'field': 'allow',
				'type': 'icon',
				'layout': {'visible': true, 'fixed': true}
			}
		];
	}
}


manageService.$inject = manageService.getDI();
manageService.$$ngIsClass = true;