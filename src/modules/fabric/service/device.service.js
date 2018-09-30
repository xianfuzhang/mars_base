export class DeviceService {
  static getDI() {
    return ['$filter'];
  }

  constructor(...args) {
    this.di = {};
    DeviceService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
  }


  getTabSchema() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.TAB.SCHEMA.DEVICE'),
        'value': 'device',
        'type': 'device'
      },
      {
        'label': this.translate('MODULES.SWITCHES.TAB.SCHEMA.PORT'),
        'value': 'port',
        'type': 'port'
      },
      {
        'label': this.translate('MODULES.SWITCHES.TAB.SCHEMA.LINK'),
        'value': 'link',
        'type': 'link'
      },
      {
        'label': this.translate('MODULES.SWITCHES.TAB.SCHEMA.ENDPOINT'),
        'value': 'endpoint',
        'type': 'endpoint'
      }
    ];
  }

  getDeviceActionsShow() {
    return {'menu': true, 'add': true, 'remove': true, 'refresh': true, 'search': false};
  }

  getPortActionsShow() {
    return {'menu': true, 'add': false, 'remove': false, 'refresh': true, 'search': false};
  }

  getLinkActionsShow() {
    return {'menu': true, 'add': false, 'remove': false, 'refresh': true, 'search': false};
  }

  getEndpointActionsShow() {
    return {'menu': false, 'add': true, 'remove': true, 'refresh': true, 'search': false};
  }

  getDeviceTableSchema() {
    return [
      /*{
       'label': 'ID',
       'field': 'id',
       'layout': {'visible': false, 'sortable': false, 'fixed': true}
       },*/
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.NAME'),
        'field': 'switch_name',
        'type': 'clickabletext',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.IP'),
        'field': 'ip',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.MAC'),
        'field': 'mac',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.TYPE'),
        'field': 'type',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.ROLE'),
        'field': 'role',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.RACK'),
        'field': 'rack_id',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.AVAILABLE'),
        'field': 'available',
        'type': 'icon',
        'layout': {'visible': true, 'sortable': true}
      },
      /*{
       'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.PORTS'),
       'field': 'ports',
       'layout': {'visible': true, 'sortable': true}
       },*/
      {
        'label': 'CHASSIS',
        'field': 'chassisId',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.PROTOCOL'),
        'field': 'protocol',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.MFR'),
        'field': 'mfr',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.SERIAL'),
        'field': 'serial',
        'layout': {'visible': true, 'sortable': true}
      }, {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.HW'),
        'field': 'hw',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.SW'),
        'field': 'sw',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }

  getDeviceTableRowActions() {
    return [
      // {
      //   'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.EDIT'),
      //   'value': 'edit'
      // },
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.DELETE'),
        'value': 'delete'
      }
    ]
  }

  getPortTableSchema() {
    return [
      /*{
       'label': 'ID',
       'field': 'id',
       'layout': {'visible': true, 'sortable': false, 'fixed': true}
       },*/
      {
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.NAME'),
        'field': 'port_name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.MAC'),
        'field': 'port_mac',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.PORT_ID'),
        'field': 'port_id',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.STATUS'),
        'field': 'port_status',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.LINK_STATUS'),
        'field': 'link_status',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.TYPE'),
        'field': 'type',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.SPEED'),
        'field': 'speed',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.DEVICE'),
        'field': 'device_name',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }

  getPortTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.ENABLE'),
        'value': 'enable'
      },
      {
        'label': this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.DISABLE'),
        'value': 'disable'
      }
    ];
  }

  getLinkTableSchema() {
    return [
      /* {
       'label': 'ID',
       'field': 'id',
       'layout': {'visible': true, 'sortable': false, 'fixed': true}
       },*/
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.SRC_DEVICE'),
        'field': 'src_device',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.SRC_PORT'),
        'field': 'src_port',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.DST_DEVICE'),
        'field': 'dst_device',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.DST_PORT'),
        'field': 'dst_port',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.STATUS'),
        'field': 'state',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.TYPE'),
        'field': 'type',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.DURATION'),
        'field': 'duration',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.PROTOCOL'),
        'field': 'protocol',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.LINK.COLUMN.LATENCY'),
        'field': 'latency',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }

  getEndpointTableSchema() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.TENANT'),
        'field': 'tenant_name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.SEGMENT'),
        'field': 'segment_name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.MAC'),
        'field': 'mac',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.IP'),
        'field': 'ip',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.LOCATION'),
        'field': 'location',
        'layout': {'visible': true, 'sortable': true}
      },
    ];
  }

  getEndpointTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.ROW.ACTION.DELETE'),
        'value': 'delete'
      }
    ];
  }


  getSummaryLinkTableSchema() {
    return [
      // { field: "opt", title: "", show: true },
      {
        'title': this.translate('MODULES.SWITCHES.LINK.COLUMN.SRC_DEVICE'),
        'field': 'src_device',
        'sortable': "src_device",
        'show': true
      },
      {
        'title': this.translate('MODULES.SWITCHES.LINK.COLUMN.SRC_PORT'),
        'field': 'src_port',
        'sortable': "src_port",
        'show': true
      },
      {
        'title': this.translate('MODULES.SWITCHES.LINK.COLUMN.DST_DEVICE'),
        'field': 'dst_device',
        'sortable': "dst_device",
        'show': true
      },
      {
        'title': this.translate('MODULES.SWITCHES.LINK.COLUMN.DST_PORT'),
        'field': 'dst_port',
        'sortable': "dst_port",
        'show': true
      },
      {
        'title': this.translate('MODULES.SWITCHES.LINK.COLUMN.STATUS'),
        'field': 'state',
        'sortable': "state",
        'showState': true,
        'show': true
      },
    ];
  }

  getSummaryPortsTableSchema() {
    return [
      {field: "opt", title: "", show: true},
      {
        'title': this.translate('MODULES.SWITCHES.PORT.COLUMN.NAME'),
        'field': 'port_name',
        'sortable': "port_name",
        'show': true
      },
      {
        'title': this.translate('MODULES.SWITCHES.PORT.COLUMN.PORT_ID'),
        'field': 'port_id',
        'sortable': "port_id",
        'show': true
      },
      {
        'title': this.translate('MODULES.SWITCHES.PORT.COLUMN.STATUS'),
        'field': 'port_status',
        'sortable': "port_status",
        'show': true
      },
      // {
      //   'title': this.translate('MODULES.SWITCHES.PORT.COLUMN.LINK_STATUS'),
      //   'field': 'link_status',
      //   'sortable': "link_status",
      //   'showState': true,
      //   'show': true
      // },
    ]
  }


  getSummarySwitchMenu() {
    return [
      // {
      //   'label': this.translate('MODULES.SWITCH.MENU.EDIT'),
      //   'isEnabled': true,
      //   'msg': 'summary_switch_menu_edit'
      // },
      {
        'label': this.translate('MODULES.SWITCH.MENU.CREATE_FLOW'),
        'isEnabled': true,
        'msg': 'summary_switch_menu_create_flow'
      },
      {
        'label': this.translate('MODULES.SWITCH.MENU.SHOW_FLOW'),
        'isEnabled': true,
        'msg': 'summary_switch_menu_show_flow'
      }
    ]

  }

  getFlowsInstructionSchema() {
    return {
      'OUTPUT': [{'field': 'port', 'type': 'int'}],
      'TABLE': [{'field': 'tableId', 'type': 'int'}],
      'GROUP': [{'field': 'groupId', 'type': 'int'}],
      'METER': [{'field': 'meterId', 'type': 'int'}],
      'QUEUE': [
        {'field': 'queueId', 'type': 'int'},
        {'field': 'port', 'type': 'int'}
      ],
      'L0MODIFICATION': [{
        'field': 'subtype',
        'type':'object',
        'list': {
          'LAMBDA': [
            {'field': 'lambda', 'type': 'int'}
          ]
        },
        'OCH': [
          {'field': 'gridType', 'type': 'string'},
          {'field': 'channelSpacing', 'type': 'int'},
          {'field': 'spacingMultiplier', 'type': 'int'},
          {'field': 'slotGranularity', 'type': 'int'}
        ]
      }
      ],
      'L1MODIFICATION': [
        {
          'field': 'subtype',
          'type':'object',
          'list': {
            'ODU_SIGID': [
              {'field': 'tributaryPortNumber', 'type': 'int'},
              {'field': 'tributarySlotLength', 'type': 'int'},
            ]
          }
        }
      ],
      'L2MODIFICATION': [
        {
          'field': 'subtype',
          'type':'object',
          'list': {
            'VLAN_PUSH': [],
            'VLAN_ID': [{'field': 'vlanId', 'type': 'int'}],
            'VLAN_PCP': [{'field': 'vlanPcp', 'type': 'int'}],
            'ETH_SRC': [{'field': 'mac', 'type': 'mac'}],
            'ETH_DST': [{'field': 'mac', 'type': 'mac'}],
            'MPLS_LABEL': [{'field': 'label', 'type': 'int'}],
            'MPLS_PUSH': [{'field': 'ethernetType', 'type': 'int'}],
            'TUNNEL_ID': [{'field': 'tunnelId', 'type': 'int'}],
          }
        }
      ],
      'L3MODIFICATION': [
        {
          'field': 'subtype',
          'type':'object',
          'list': {
            'IPV4_SRC': [{'field': 'ip', 'type': 'ip'}],
            'IPV4_DST': [{'field': 'ip', 'type': 'ip'}],
            'IPV6_SRC': [{'field': 'ip', 'type': 'ipv6'}],
            'IPV6_DST': [{'field': 'ip', 'type': 'ipv6'}],
            'IPV6_FLABEL': [{'field': 'flowLabel', 'type': 'int'}],
          }
        }
      ],
      'L4MODIFICATION': [
        {
          'field': 'subtype',
          'type':'object',
          'list': {
            'TCP_SRC': [{'field': 'tcpPort', 'type': 'int'}],
            'UDP_SRC': [{'field': 'udpPort', 'type': 'int'}]
          }
        }
      ]
    }
  }

  getFlowsCriteriaSchema() {
    return {
      'ETH_TYPE': [
        {'field':'ethType','type': 'string'},
      ],
      'ETH_DST': [
        {'field':'mac','type': 'mac'},
      ],
      'ETH_SRC': [
        {'field':'mac','type': 'mac'},
      ],
      'IN_PORT': [
        {'field':'port','type': 'string'},
      ],
      'IN_PHY_PORT': [
        {'field':'port','type': 'string'},
      ],
      'METADATA': [
        {'field':'metadata','type': 'string'},
      ],
      'VLAN_VID': [
        {'field':'vlanId','type': 'string'},
      ],
      'VLAN_PCP': [
        {'field':'priority','type': 'string'},
      ],
      'INNER_VLAN_VID': [
        {'field':'innerVlanId','type': 'string'},
      ],
      'INNER_VLAN_PCP': [
        {'field':'innerPriority','type': 'string'},
      ],
      'IP_DSCP': [
        {'field':'ipDscp','type': 'int'},
      ],
      'IP_ECN': [
        {'field':'ipEcn','type': 'int'},
      ],
      'IP_PROTO': [
        {'field':'protocol','type': 'int'},
      ],
      'IPV4_SRC': [
        {'field':'ip','type': 'ip'},
      ],
      'IPV4_DST': [
        {'field':'ip','type': 'ip'},
      ],
      'TCP_SRC': [
        {'field':'tcpPort','type': 'int'},
      ],
      'TCP_DST': [
        {'field':'tcpPort','type': 'int'},
      ],
      'UDP_SRC': [
        {'field':'udpPort','type': 'int'},
      ],
      'UDP_DST': [
        {'field':'udpPort','type': 'int'},
      ],
      'SCTP_SRC': [
        {'field':'sctpPort','type': 'int'},
      ],
      'SCTP_DST': [
        {'field':'sctpPort','type': 'int'},
      ],
      'ICMPV4_TYPE': [
        {'field':'icmpType','type': 'string'},
      ],
      'ICMPV4_CODE': [
        {'field':'icmpCode','type': 'int'},
      ],
      'IPV6_SRC': [
        {'field':'ip','type': 'ipv6'},
      ],
      'IPV6_DST': [
        {'field':'ip','type': 'ipv6'},
      ],
      'IPV6_FLABEL': [
        {'field':'flowlabel','type': 'int'},
      ],
      'ICMPV6_TYPE': [
        {'field':'icmpv6Type','type': 'int'},
      ],
      'ICMPV6_CODE': [
        {'field':'icmpv6Code','type': 'int'},
      ],
      'IPV6_ND_TARGET': [
        {'field':'targetAddress','type': 'string'},
      ],
      'IPV6_ND_SLL': [
        {'field':'mac','type': 'string'},
      ],
      'IPV6_ND_TLL': [
        {'field':'mac','type': 'string'},
      ],
      'MPLS_LABEL': [
        {'field':'label','type': 'int'},
      ],
      'IPV6_EXTHDR': [
        {'field':'exthdrFlags','type': 'int'},
      ],
      'OCH_SIGID': [
        {'field':'lambda','type': 'int'},
      ],
      'GRID_TYPE': [
        {'field':'gridType','type': 'string'},
      ],
      'CHANNEL_SPACING': [
        {'field':'channelSpacing','type': 'int'},
      ],
      'SPACING_MULIPLIER': [
        {'field':'spacingMultiplier','type': 'int'},
      ],
      'SLOT_GRANULARITY': [
        {'field':'slotGranularity','type': 'int'},
      ],
      'OCH_SIGID': [
        {'field':'ochSignalId','type': 'int'},
      ],
      'TUNNEL_ID': [
        {'field':'tunnelId','type': 'int'},
      ],
      'OCH_SIGTYPE': [
        {'field':'ochSignalType','type': 'int'},
      ],
      'ODU_SIGTYPE': [
        {'field':'oduSignalType','type': 'int'},
      ],
    }
  }
}

DeviceService.$inject = DeviceService.getDI();
DeviceService.$$ngIsClass = true;