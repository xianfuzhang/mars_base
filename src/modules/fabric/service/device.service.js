export class DeviceService {
  static getDI() {
    return ['$filter', '_'];
  }

  constructor(...args) {
    this.di = {};
    DeviceService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    this.treatment4Submit = {
      'vlan_id': {"type": "L2MODIFICATION", "subtype": "VLAN_ID", 'field': "vlanId", 'field_type': 'number'},
      'push_vlan': {"type": "L2MODIFICATION", "subtype": "VLAN_PUSH"}
    };

    this.criteria4Submit = {
      'in_port': {'type': 'IN_PORT', 'field': 'port', 'field_type': 'string'},
      'in_phy_port': {'type': 'IN_PHY_PORT', 'field': 'port'},
      'destination_ipv4': {'type': 'IPV4_DST', 'field': 'ip'},
      'vlan_id': {'type': 'VLAN_VID', 'field': 'vlanId'},
      'destination_ipv6': {'type': 'IPV6_DST', 'field': 'ip'},
      'ip_proto': {'type': 'IP_PROTO', 'field': 'protocol'},
      'udp_dport': {'type': 'UDP_DST', 'field': 'udpPort'},
      'udp_sport': {'type': 'UDP_SRC', 'field': 'udpPort'},
      'source_ipv4': {'type': 'IPV4_SRC', 'field': 'ip'},
      'source_ipv6': {'type': 'IPV6_SRC', 'field': 'ip'},
      'ether_type': {'type': 'ETH_TYPE', 'field': 'ethType'},
      'destination_mac': {'type': 'ETH_DST', 'field': 'mac'},
      'source_mac': {'type': 'ETH_SRC', 'field': 'mac'},
      'vlan_pcp': {'type': 'VLAN_PCP', 'field': 'priority'},
      'ip_dscp': {'type': 'IP_DSCP', 'field': 'ipDscp'},
      'ip_ecn': {'type': 'IP_ECN', 'field': 'ipEcn'},
      'tcp_sport': {'type': 'TCP_SRC', 'field': 'tcpPort'},
      'tcp_dport': {'type': 'TCP_DST', 'field': 'tcpPort'},
      'icmpv4_type': {'type': 'ICMPV4_TYPE', 'field': 'icmpType'},
      'icmpv4_code': {'type': 'ICMPV4_CODE', 'field': 'icmpCode'},
      'ipv6_flow_label': {'type': 'IPV6_FLABEL', 'field': 'flowlabel'},
      'sctp_sport': {'type': 'SCTP_SRC', 'field': 'sctpPort'},
      'sctp_dport': {'type': 'SCTP_DST', 'field': 'sctpPort'},
      'icmpv6_type': {'type': 'ICMPV6_TYPE', 'field': 'icmpv6Type'},
      'icmpv6_code': {'type': 'ICMPV6_CODE', 'field': 'icmpv6Code'},
      'ipv4_arp_spa': {'type': 'ARP_SPA', 'field': 'ip'}
    };
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
    return {
      'menu': {'enable': true, 'role': 2},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': true, 'role': 2},
      'refresh': {'enable': true, 'role': 2}, 
      'search': {'enable': true, 'role': 2}
    };
  }

  getPortActionsShow() {
    return {'menu': true, 'add': false, 'remove': false, 'refresh': true, 'search': false};
  }

  getLinkActionsShow() {
    return {'menu': true, 'add': false, 'remove': false, 'refresh': true, 'search': false};
  }

  getEndpointActionsShow() {
    return {
      'menu': {'enable': false, 'role': 2},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': true, 'role': 2},
      'refresh': {'enable': true, 'role': 2},
      'search': {'enable': false, 'role': 2}
    };
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
        'label': this.translate('MODULES.SWITCHES.SWITCH.COLUMN.LEAF_GROUP_NAME'),
        'field': 'leaf_group',
        'layout': {'visible': false, 'sortable': true}
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
      /*{
       'label': 'CHASSIS',
       'field': 'chassisId',
       'layout': {'visible': true, 'sortable': true}
       },*/
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
        'role': 2,
        'value': 'delete'
      },
      {
        'label': this.translate('MODULES.SWITCH.MENU.REBOOT'),
        'role': 2,
        'value': 'reboot'
      },
      {
        'label': 'Intent',
        'role': 2,
        'value': 'intent'
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


  getEndpointTableSchema(type) {
    if (type && type === 'host') {
      return [
        {
          'label': this.translate('MODULES.ENDPOINT.CREATE.TYPE'),
          'field': 'type',
          'type': 'icon',
          'layout': {'visible': true, 'sortable': true}
        },
        {
          'label': this.translate('MODULES.ENDPOINT.CREATE.DESC'),
          'field': 'description',
          'layout': {'visible': true, 'sortable': true}
        },
        {
          'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.MAC'),
          'field': 'mac',
          'layout': {'visible': true, 'sortable': true}
        },
        {
          'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.VLAN'),
          'field': 'segment_name',
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
        }
      ];
    }
    else {
      return [
        {
          'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.MAC'),
          'field': 'mac',
          'layout': {'visible': true, 'sortable': true}
        },
        {
          'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.TENANT'),
          'field': 'tenant_name',
          'layout': {'visible': true, 'sortable': true}
        },
        {
          'label': 'Segment',//this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.VLAN'),
          'field': 'segment_name',
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
        }
      ];
    }
  }

  getEndpointTableSchema() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.MAC'),
        'field': 'mac',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.VLAN'),
        'field': 'segment_name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.IP'),
        'field': 'ip',
        'layout': {'visible': true, 'sortable': true}
      },
      /*   {
       'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.TENANT'),
       'field': 'tenant_name',
       'layout': {'visible': true, 'sortable': true}
       },*/
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.LOCATION'),
        'field': 'location',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }

  getEndpointTableRowActions(type) {
    let arr = [
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ];
    if (!type) {
      arr.push(
        {
          'label': 'Intent',
          'role': 2,
          'value': 'intent'
        }
      )
    }
    return arr;
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
      // {field: "opt", title: "", show: true},
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
      {
        'title': this.translate('MODULES.SWITCHES.PORT.COLUMN.ADMIN_STATUS'),
        'field': 'admin_state',
        'sortable': "admin_state",
        // 'showState': true,
        'show': true
      },
    ]
  }

  getSummaryEndpointsTableSchema() {
    return [
      {
        'title': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.MAC'),
        'field': 'mac',
        'sortable': "mac",
        'show': true
      },
      {
        'title': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.IP'),
        'field': 'ip',
        'sortable': "ip",
        'show': true
      },
      {
        'title': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.LOCATION'),
        'field': 'location',
        'sortable': "location",
        'show': true
      }
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
      },
      {
        'label': this.translate('MODULES.SWITCH.MENU.CREATE_GROUP'),
        'isEnabled': true,
        'msg': 'summary_switch_menu_create_group'
      },
      {
        'label': this.translate('MODULES.SWITCH.MENU.SHOW_GROUP'),
        'isEnabled': true,
        'msg': 'summary_switch_menu_show_group'
      },
      {
        'label': this.translate('MODULES.SWITCH.MENU.PFC'),
        'isEnabled': true,
        'msg': 'summary_switch_pfc'
      },
      {
        'label': this.translate('MODULES.SWITCH.MENU.SHOW_PFC'),
        'isEnabled': true,
        'msg': 'summary_switch_menu_show_pfc'
      },
      {
        'label': this.translate('MODULES.SWITCH.MENU.REBOOT'),
        'isEnabled': true,
        'msg': 'summary_switch_reboot'
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
        'type': 'object',
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
          'type': 'object',
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
          'type': 'object',
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
          'type': 'object',
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
          'type': 'object',
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
        {'field': 'ethType', 'type': 'string'},
      ],
      'ETH_DST': [
        {'field': 'mac', 'type': 'mac'},
      ],
      'ETH_SRC': [
        {'field': 'mac', 'type': 'mac'},
      ],
      'IN_PORT': [
        {'field': 'port', 'type': 'string'},
      ],
      'IN_PHY_PORT': [
        {'field': 'port', 'type': 'string'},
      ],
      'METADATA': [
        {'field': 'metadata', 'type': 'string'},
      ],
      'VLAN_VID': [
        {'field': 'vlanId', 'type': 'string'},
      ],
      'VLAN_PCP': [
        {'field': 'priority', 'type': 'string'},
      ],
      'INNER_VLAN_VID': [
        {'field': 'innerVlanId', 'type': 'string'},
      ],
      'INNER_VLAN_PCP': [
        {'field': 'innerPriority', 'type': 'string'},
      ],
      'IP_DSCP': [
        {'field': 'ipDscp', 'type': 'int'},
      ],
      'IP_ECN': [
        {'field': 'ipEcn', 'type': 'int'},
      ],
      'IP_PROTO': [
        {'field': 'protocol', 'type': 'int'},
      ],
      'IPV4_SRC': [
        {'field': 'ip', 'type': 'ip'},
      ],
      'IPV4_DST': [
        {'field': 'ip', 'type': 'ip'},
      ],
      'TCP_SRC': [
        {'field': 'tcpPort', 'type': 'int'},
      ],
      'TCP_DST': [
        {'field': 'tcpPort', 'type': 'int'},
      ],
      'UDP_SRC': [
        {'field': 'udpPort', 'type': 'int'},
      ],
      'UDP_DST': [
        {'field': 'udpPort', 'type': 'int'},
      ],
      'SCTP_SRC': [
        {'field': 'sctpPort', 'type': 'int'},
      ],
      'SCTP_DST': [
        {'field': 'sctpPort', 'type': 'int'},
      ],
      'ICMPV4_TYPE': [
        {'field': 'icmpType', 'type': 'string'},
      ],
      'ICMPV4_CODE': [
        {'field': 'icmpCode', 'type': 'int'},
      ],
      'IPV6_SRC': [
        {'field': 'ip', 'type': 'ipv6'},
      ],
      'IPV6_DST': [
        {'field': 'ip', 'type': 'ipv6'},
      ],
      'IPV6_FLABEL': [
        {'field': 'flowlabel', 'type': 'int'},
      ],
      'ICMPV6_TYPE': [
        {'field': 'icmpv6Type', 'type': 'int'},
      ],
      'ICMPV6_CODE': [
        {'field': 'icmpv6Code', 'type': 'int'},
      ],
      'IPV6_ND_TARGET': [
        {'field': 'targetAddress', 'type': 'string'},
      ],
      'IPV6_ND_SLL': [
        {'field': 'mac', 'type': 'string'},
      ],
      'IPV6_ND_TLL': [
        {'field': 'mac', 'type': 'string'},
      ],
      'MPLS_LABEL': [
        {'field': 'label', 'type': 'int'},
      ],
      'IPV6_EXTHDR': [
        {'field': 'exthdrFlags', 'type': 'int'},
      ],
      'OCH_SIGID': [
        {'field': 'lambda', 'type': 'int'},
      ],
      'GRID_TYPE': [
        {'field': 'gridType', 'type': 'string'},
      ],
      'CHANNEL_SPACING': [
        {'field': 'channelSpacing', 'type': 'int'},
      ],
      'SPACING_MULIPLIER': [
        {'field': 'spacingMultiplier', 'type': 'int'},
      ],
      'SLOT_GRANULARITY': [
        {'field': 'slotGranularity', 'type': 'int'},
      ],
      'OCH_SIGID': [
        {'field': 'ochSignalId', 'type': 'int'},
      ],
      'TUNNEL_ID': [
        {'field': 'tunnelId', 'type': 'int'},
      ],
      'OCH_SIGTYPE': [
        {'field': 'ochSignalType', 'type': 'int'},
      ],
      'ODU_SIGTYPE': [
        {'field': 'oduSignalType', 'type': 'int'},
      ],
    }
  }

  getFlowTableList() {
    return ['10', '20', '30', '40', '50', '60']
  }

  getFlowTableFirstInputRow() {
    return {
      '10': [
        {'field': 'in_port', 'type': 'int', 'require': 'true'},
        {'field': 'vlan_id', 'type': 'int_with_zero', 'require': 'true'}
      ],
      '20': [
        // {'field':'ether_type', 'input_type':'select', 'select_value':[{'label':'IPv4','value':'0x0800'},{'label':'IPv6','value':'0x86dd'}]},
        {'field': 'ether_type', 'type': 'string', 'require': 'true'},
        {'field': 'destination_mac', 'type': 'mac', 'require': 'true'}
      ],
      '30': [
        // {'field':'ether_type', 'input_type':'select', 'select_value':[{'label':'IPv4','value':'0x0800'},{'label':'IPv6','value':'0x86dd'}]}
        {'field': 'ether_type', 'type': 'string', 'require': 'true'},
      ],
      '40': [
        // {'field':'ether_type', 'input_type':'select', 'select_value':[{'label':'IPv4','value':'0x0800'},{'label':'IPv6','value':'0x86dd'}]},
        {'field': 'ether_type', 'type': 'string', 'require': 'true'},
      ],
      '50': [
        {'field': 'vlan_id', 'type': 'int', 'require': 'true'},
        {'field': 'destination_mac', 'type': 'mac', 'require': 'false'}
      ],
      '60': [
        // {'field':'vlan_id', 'type':'int','require':'false'}
      ]
    }
  }

  getFlowTableFirstInputRowByTableId(tableId) {
    let all = this.getFlowTableFirstInputRow();
    return all[tableId];
  }


  getFlowTableNormalInputRow(){
    //For table 0 and device for h3c/pica8
    return {
      'in_port': [
        {'field': 'in_port', 'type': 'int', 'require': 'true'},
      ],
      'ether_type': [
        {'field': 'ether_type', 'type': 'string', 'require': 'true'},
        // {'field': 'ether_type', 'type': 'string', 'require': 'true', 'input_type':'select', 'select_value':[{'label':'IPv4','value':'0x0800'},{'label':'IPv6','value':'0x86dd'}]},
        //{'label':'PROFINET','value':'0x8892'}
      ],
      'source_mac': [
        {'field': 'source_mac', 'type': 'mac', 'require': 'true'},
        // {'field': 'source_mac_mask', 'type': 'string', 'require': 'false'},
      ],
      'destination_mac': [
        {'field': 'destination_mac', 'type': 'mac', 'require': 'true'},
        // {'field': 'destination_mac_mask', 'type': 'string', 'require': 'false'},
      ],
      'vlan_id': [
        {'field': 'vlan_id', 'type': 'int', 'require': 'true'},
      ],
      'source_ipv4': [
        {'field': 'source_ipv4', 'type': 'ipv4', 'require': 'true'},
        {'field': 'ipv4_mask', 'type': 'int', 'require': 'true'},
      ],
      'destination_ipv4': [
        {'field': 'destination_ipv4', 'type': 'ipv4', 'require': 'true'},
        {'field': 'ipv4_mask', 'type': 'int', 'require': 'true'},
      ],
      'source_ipv6': [
        {'field': 'source_ipv6', 'type': 'ipv6', 'require': 'true'},
        {'field': 'ipv6_mask', 'type': 'int', 'require': 'true'},
      ],
      'destination_ipv6': [
        {'field': 'destination_ipv6', 'type': 'ipv6', 'require': 'true'},
        {'field': 'ipv6_mask', 'type': 'int', 'require': 'true'},
      ],
      'ip_proto': [
        {'field': 'ip_proto', 'type': 'int', 'require': 'true'},
      ],
      'tcp_sport': [
        {'field': 'tcp_sport', 'type': 'int', 'require': 'true'},
      ],
      'tcp_dport': [
        {'field': 'tcp_dport', 'type': 'int', 'require': 'true'},
      ],
      'udp_sport': [
        {'field': 'udp_sport', 'type': 'int', 'require': 'true'},
      ],
      'udp_dport': [
        {'field': 'udp_dport', 'type': 'int', 'require': 'true'},
      ]
    }
  }

  getFlowTableSecondInputRow() {

    return {
      '10': null,
      '20': {
        'unicast_mac': [{'field': 'in_port', 'type': 'int', 'require': 'false'}],
        'ipv4_multicast_mac': [
          // {'field': 'destination_ipv4', 'type': 'ipv4', 'require': 'false'},
          {'field': 'vlan_id', 'type': 'int', 'require': 'false'},
          // {'field': 'in_port', 'type': 'int', 'require': 'false'},
        ],
        'ipv6_multicast_mac': [
          // {'field': 'destination_ipv6', 'type': 'ipv6', 'require': 'false'},
          {'field': 'vlan_id', 'type': 'int', 'require': 'false'},
          // {'field': 'in_port', 'type': 'int', 'require': 'false'},
        ]
      },
      '30': {
        'ipv4_multicast': [
          {'field': 'destination_ipv4', 'type': 'ipv4', 'require': 'false'},
          // {'field': 'ip_proto', 'type': 'string', 'require': 'false'},
          // {'field': 'udp_dport', 'type': 'int', 'require': 'false'},
          // {'field': 'udp_sport', 'type': 'int', 'require': 'false'},
        ],
        'ipv6_multicast': [
          {'field': 'destination_ipv6', 'type': 'ipv6', 'require': 'false'},
          // {'field': 'ip_proto', 'type': 'string', 'require': 'false'},
          // {'field': 'udp_dport', 'type': 'int', 'require': 'false'},
          // {'field': 'udp_sport', 'type': 'int', 'require': 'false'},
        ]
      },
      '40': {
        'ipv4_multicast': [
          {'field': 'vlan_id', 'type': 'int', 'require': 'true'},
          {'field': 'destination_ipv4', 'type': 'ipv4_multi', 'require': 'true'},
          {'field': 'source_ipv4', 'type': 'ipv4', 'require': 'false'},
          // {'field': 'l3_in_port', 'type': 'int', 'require': 'false'},
        ],
        'ipv6_multicast': [
          {'field': 'vlan_id', 'type': 'int', 'require': 'true'},
          {'field': 'destination_ipv6', 'type': 'ipv6', 'require': 'true'},
          {'field': 'source_ipv6', 'type': 'ipv6', 'require': 'false'},
          // {'field': 'l3_in_port', 'type': 'int', 'require': 'false'},
        ]
      },
      '50': {
        'unicast_vlan_bridge': [],
        'multicast_vlan_bridge': [],
        'dlf_vlan_bridge': []
      },
      '60': null
    }
  }

  getFlowTableSecondInputRowByFilter(tableId, type) {
    let secondInputs = this.getFlowTableSecondInputRow();
    return secondInputs[tableId][type];
  }


  getFlowGotoTableList() {
    return {
      '10': '20',
      '20': {
        'unicast_mac': '30',
        'ipv4_multicast_mac': '40',
        'ipv6_multicast_mac': '40'
      },
      '30': {
        'ipv4_multicast': '60',
        'ipv6_multicast': '60',
      },
      '40': {
        'ipv4_multicast': '60',
        'ipv6_multicast': '60',
      },
      '50': {
        'unicast_vlan_bridge': '60',
        'multicast_vlan_bridge': '60',
        'dlf_vlan_bridge': '60'
      },
      '60': null
    }
  }

  getFlowTableGotoTableByFilter(tableId, type) {
    let json = this.getFlowGotoTableList();
    let res = json[tableId];
    if (type && type !== '') {
      res = res[type]
    }
    return res
  }


  getFlowTableApplyActionMaps() {
    return {
      '10': [
        {'field': 'vlan_id', 'type': 'int', 'require': 'true', 'field_label': 'vlan'},
        // {'field': 'push_vlan', 'input_type':'checkbox' , 'require': 'false', 'displayLabel':{'id': 'check_push', 'label': 'Push Vlan'}},
      ],
      '20': [{
        'field': 'output_to_ctrl',
        'require': 'false',
        'input_type': 'checkbox',
        'displayLabel': {'id': 'check_output', 'label': 'Output To Controller'}
      }],
      '30': [{
        'field': 'output_to_ctrl',
        'require': 'false',
        'input_type': 'checkbox',
        'displayLabel': {'id': 'check_output', 'label': 'Output To Controller'}
      }],
      '40': [],
      '50': [{
        'field': 'output_to_ctrl',
        'require': 'false',
        'input_type': 'checkbox',
        'displayLabel': {'id': 'check_output', 'label': 'Output To Controller'}
      }],
      '60': [{
        'field': 'output_to_ctrl',
        'require': 'false',
        'input_type': 'checkbox',
        'displayLabel': {'id': 'check_output', 'label': 'Output To Controller'}
      }],
    }
  }

  getFlowTableApplyActionMapByTid(tableId) {
    let maps = this.getFlowTableApplyActionMaps();
    return maps[tableId];
  }

  getFlowTable0ApplyActionMaps(){
    return [
      {'field': 'output_to_ctrl', 'require': 'false','input_type':'select', 'displayLabel':{'options': [
                                                                                                          {'label':'CONTROLLER','value':'controller'},
                                                                                                          {'label':'PORT','value':'port'},
                                                                                                          {'label':'DROP','value':'drop'},
                                                                                                          {'label':'STRIP VLAN','value':'strip_vlan'},
                                                                                                       ]}}
    ]
  }

  getFlowTableWriteActionMaps(){
    return {
      '10': null,
      '20': null,
      '30': {
        'ipv4_multicast': ['l3_ucast_group', 'l3_ecmp_group'],
        'ipv6_multicast': ['l3_ucast_group', 'l3_ecmp_group']
      },
      '40': {
        'ipv4_multicast': ['l3_mcast_group'],
        'ipv6_multicast': ['l3_mcast_group']
      },
      '50': {
        'unicast_vlan_bridge': ['l2_intf_group', 'l2_unflt_intf_group'],
        'multicast_vlan_bridge': ['l2_mcast_group'],
        'dlf_vlan_bridge': ['l2_flood_group']
      },
      '60': ['l2_intf_group', 'l2_rewrite_group', 'l2_mcast_group', 'l3_ucast_group', 'l3_mcast_group', 'l3_ecmp_group', 'l2_unflt_intf_group'],
    }
  }

  getFlowTableWriteActionMapByFilter(tableId, type) {
    let maps = this.getFlowTableWriteActionMaps();
    let res = maps[tableId];
    if (res === null || res instanceof Array) {
      return res;
    } else {
      return res[type]
    }
  }

  getGroupTypeMapper() {
    return {
      'l2_intf_group': '0',
      'l2_rewrite_group': '1',
      'l3_ucast_group': '2',
      'l2_mcast_group': '3',
      'l2_flood_group': '4',
      'l3_intf_group': '5',
      'l3_mcast_group': '6',
      'l3_ecmp_group': '7',
      'l2_unflt_intf_group': '11'
    }
  }


  getGroupNameMapper() {
    return {
      'l2_intf_group': 'L2_Interface',
      'l2_mcast_group': 'L2_Multicast',
      'l2_rewrite_group': 'L2_Rewrite',
      'l2_flood_group': 'L2_Flood',
      'l2_unflt_intf_group': 'L2_Unfiltered_Interface',
      'l3_intf_group': 'L3_Interface',
      'l3_ucast_group': 'L3_Unicast',
      'l3_mcast_group': 'L3_Multicast',
      'l3_ecmp_group': 'L3_ECMP',
    }
  }


  getGroupNameByKey(key) {
    let mapper = this.getGroupNameMapper();
    return mapper[key]
  }


  getGroupTypeId(groupName) {
    return this.getGroupTypeMapper()[groupName];
  }


  getFlowTableAclOptionList() {
    return {
      'in_port': [
        {'field': 'in_port', 'type': 'int', 'require': 'true'},
      ],
      'ether_type': [
        {'field': 'ether_type', 'type': 'string', 'require': 'true'},
        // {'field': 'ether_type', 'type': 'string', 'require': 'true', 'input_type':'select', 'select_value':[{'label':'IPv4','value':'0x0800'},{'label':'IPv6','value':'0x86dd'}]},
        //{'label':'PROFINET','value':'0x8892'}
      ],
      'source_mac': [
        {'field': 'source_mac', 'type': 'mac', 'require': 'true'},
        // {'field': 'source_mac_mask', 'type': 'string', 'require': 'false'},
      ],
      'destination_mac': [
        {'field': 'destination_mac', 'type': 'mac', 'require': 'true'},
        // {'field': 'destination_mac_mask', 'type': 'string', 'require': 'false'},
      ],
      'source_mac_masked': [
        {'field': 'source_mac_masked', 'type': 'mac', 'require': 'true'},
        {'field': 'mask', 'type': 'mac', 'require': 'true'},
      ],
      'destination_mac_masked': [
        {'field': 'destination_mac_masked', 'type': 'mac', 'require': 'true'},
        {'field': 'mask', 'type': 'mac', 'require': 'true'},
      ],
      'vlan_id': [
        {'field': 'vlan_id', 'type': 'int', 'require': 'true'},
      ],
      'vlan_pcp': [
        {'field': 'vlan_pcp', 'type': 'int', 'require': 'true'},
      ],
      'source_ipv4': [
        {'field': 'source_ipv4', 'type': 'ipv4', 'require': 'true'},
        {'field': 'ipv4_mask', 'type': 'int', 'require': 'true'},
      ],
      'destination_ipv4': [
        {'field': 'destination_ipv4', 'type': 'ipv4', 'require': 'true'},
        {'field': 'ipv4_mask', 'type': 'int', 'require': 'true'},
      ],
      'source_ipv6': [
        {'field': 'source_ipv6', 'type': 'ipv6', 'require': 'true'},
        {'field': 'ipv6_mask', 'type': 'int', 'require': 'true'},
      ],
      'destination_ipv6': [
        {'field': 'destination_ipv6', 'type': 'ipv6', 'require': 'true'},
        {'field': 'ipv6_mask', 'type': 'int', 'require': 'true'},
      ],
      // 'ipv4_arp_spa': [
      //   {'field': 'ipv4_arp_spa', 'type': 'ip', 'require': 'true'},
      //   {'field': 'ipv4_mask', 'type': 'ip', 'require': 'true'},
      // ],
      'ip_proto': [
        {'field': 'ip_proto', 'type': 'int', 'require': 'true'},
      ],
      'ip_dscp': [
        {'field': 'ip_dscp', 'type': 'int', 'require': 'true'},
      ],
      'ip_ecn': [
        {'field': 'ip_ecn', 'type': 'int', 'require': 'true'},
      ],
      'tcp_sport': [
        {'field': 'tcp_sport', 'type': 'int', 'require': 'true'},
      ],
      'tcp_dport': [
        {'field': 'tcp_dport', 'type': 'int', 'require': 'true'},
      ],
      'udp_sport': [
        {'field': 'udp_sport', 'type': 'int', 'require': 'true'},
      ],
      'udp_dport': [
        {'field': 'udp_dport', 'type': 'int', 'require': 'true'},
      ],
      'icmpv4_type': [
        {'field': 'icmpv4_type', 'type': 'int', 'require': 'true'},
      ],
      'icmpv4_code': [
        {'field': 'icmpv4_code', 'type': 'int', 'require': 'true'},
      ],
      'ipv6_flow_label': [
        {'field': 'ipv6_flow_label', 'type': 'int', 'require': 'true'},
      ],
      'sctp_sport': [
        {'field': 'sctp_sport', 'type': 'int', 'require': 'true'},
      ],
      'sctp_dport': [
        {'field': 'sctp_dport', 'type': 'int', 'require': 'true'},
      ],
      'icmpv6_type': [
        {'field': 'icmpv6_type', 'type': 'int', 'require': 'true'},
      ],
      'icmpv6_code': [
        {'field': 'icmpv6_code', 'type': 'int', 'require': 'true'},
      ],

    }
  }


  // 01 : 00 : 5e : 00 :  00 : 00
  // ff : ff : ff : 80 :  00 : 00
  isIpv4MultiMAC(mac) {
    let pattern = '^(0[1-9a-fA-F]|[1-9a-fA-F][0-9a-fA-F]):[0-9a-fA-F]{2}:(5[e-fE-F]|[6-9a-fA-F][0-9a-fA-F]):([0-7][0-9a-fA-F]|80)(:00){2}$';
    return mac.search(pattern) === -1 ? false : true;
  }

  //333300000000/ffff00000000
  isIpv6MultiMAC(mac) {
    let pattern = '^((3[3-9a-fA-F]|[4-9a-fA-F][0-9a-fA-F]):){2}(00:){3}00$';
    return mac.search(pattern) === -1 ? false : true;
  }


  getCriteriaObject(item) {
    let field = item['field'];
    let value = item['value'];
    if (value === '') {
      return null;
    }
    let res = angular.copy(this.criteria4Submit[field]);
    if (typeof value === 'object') {
      res[res['field']] = value.value;
    } else {
      res[res['field']] = value;
    }

    if (res['field']) {
      delete res['field'];
    }
    if (res['field_type']) {
      delete res['field_type'];
    }
    return res;
  }

  getCriteriaMacMasked(v0, v1) {
    let field = v0['field'];
    return {
      "type": field === 'source_mac_masked' ? 'ETH_SRC_MASKED' : "ETH_DST_MASKED",
      "mac": v0['value'],
      "macMask": v1['value']
    };
  }

  getCriteriaReferenceObject(objId, defaultValue) {
    let res = angular.copy(this.criteria4Submit[objId]);
    res[res['field']] = defaultValue;
    if (res['field']) {
      delete res['field'];
    }
    if (res['field_type']) {
      delete res['field_type'];
    }
    return res;
  }

  getTreatmentObject(item) {
    let field = item['field'];
    let value = item['value'];
    // let value = item['value'];
    let res = null;

    if (item['input_type'] === undefined) {
      res = angular.copy(this.treatment4Submit[field]);
      if (typeof value === 'object') {
        value = value.value;
      }

      res[res['field']] = value;
    } else if (item['input_type'] === 'checkbox') {
      if (value === true) {
        res = angular.copy(this.treatment4Submit[field])
      }
    }

    if (res && res['field']) {
      if (res['field_type'] !== undefined) {
        let type = res['field_type'];
        if (type === 'number' && typeof value === 'string') {
          value = parseInt(value);
        }
      } else {
        //default to string
        if (typeof value === 'number') {
          value = value + '';
        }
      }
      res[res['field']] = value;

      if (res['field']) {
        delete res['field'];
      }
      if (res['field_type']) {
        delete res['field_type'];
      }
    }
    return res;
  }

  getAllDevices(configDevices, originDevices) {
    let entities = [];
    configDevices.forEach((item) => {
      let obj = {};
      let origin = this.di._.find(originDevices, {'id': item.id});
      obj.id = item.id;
      obj.switch_name = item.name;
      obj.ip = item.mgmtIpAddress;
      obj.mac = item.mac;
      obj.type = item.type;
      obj.leaf_group = (item.type === 'leaf' && item.leafGroup.name)? item.leafGroup.name: '-';
      obj.role = origin && origin.role || '-';
      obj.rack_id = origin && origin.rackId || '-';
      obj.available = item.available === true ? 'available' : 'unavailable';
      obj.protocol = item.protocol;
      obj.mfr = item.mfr || (origin &&origin.mfr);
      obj.serial = origin && origin.serial || '-';
      obj.hw = origin && origin.hw || '-';
      obj.sw = origin && origin.sw || '-';
      entities.push(obj);
    });

    originDevices.forEach((item) => {
      let origin = this.di._.find(entities, {'id': item.id});
      if (!origin) {
        let obj = {};
        obj.id = item.id;
        obj.switch_name = '-';
        obj.ip = item.annotations.managementAddress;
        obj.mac = item.mac;
        obj.type = 'unknown';
        obj.role = item.role;
        obj.rack_id = item.rackId;
        obj.available = item.available === true ? 'available' : 'unavailable';
        obj.protocol = item.annotations.protocol;
        obj.mfr = item.mfr;
        obj.serial = item.serial;
        obj.hw = item.hw;
        obj.sw = item.sw;
        entities.push(obj);
      }
    });
    return entities;
  }


  getUpLinkActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': true, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': false, 'role': 2}
    };
  }

  getHostSegmentActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': true, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': false, 'role': 2}
    };
  }

  getHostSegmentSchema() {
    return [
      {
        'label': this.translate('MODULES.FABRIC.HOSTSEGMENT.COLUMN.SEGMENT_NAME'),
        'field': 'segment_name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.HOSTSEGMENT.COLUMN.DEVICE'),
        'field': 'device_name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.HOSTSEGMENT.COLUMN.VLAN'),
        'field': 'vlan',
        'layout': {'visible': true, 'sortable': true, 'width': '100px'}
      },
      {
        'label': this.translate('MODULES.FABRIC.HOSTSEGMENT.COLUMN.IPADDRESS'),
        'field': 'ip_address',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.HOSTSEGMENT.COLUMN.PORT'),
        'field': 'ports',
        'layout': {'visible': true, 'sortable': true}
      }

    ];
  }

  getHostSegmentTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ]
  }

  getUpLinkSchema() {
    return [
      {
        'label': this.translate('MODULES.FABRIC.UPLINK.COLUMN.SEGMENT_NAME'),
        'field': 'segment_name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.UPLINK.COLUMN.DEVICE'),
        'field': 'device_id',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.UPLINK.COLUMN.VLAN'),
        'field': 'vlan',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.UPLINK.COLUMN.PORT'),
        'field': 'ports',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.UPLINK.COLUMN.GATEWAY'),
        'field': 'gateway',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.UPLINK.COLUMN.GATEWAY_MAC'),
        'field': 'gateway_mac',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.UPLINK.COLUMN.IPADDRESS'),
        'field': 'ip_address',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }

  getUpLinkTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ]
  }

  getStormActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': false, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': false, 'role': 2}
    };
  }


  getStormSchema() {
    return [
      {
        'label': this.translate('MODULES.FABRIC.STORM.COLUMN.DEVICE'),
        'field': 'device_name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.STORM.COLUMN.UNICAST_ENABLED'),
        'field': 'unicast_enabled',
        'type': 'icon',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.STORM.COLUMN.UNICAST'),
        'field': 'unicast',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.STORM.COLUMN.BCAST_ENABLED'),
        'field': 'bcast_enabled',
        'type':'icon',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.STORM.COLUMN.BCAST'),
        'field': 'bcast',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.STORM.COLUMN.MCAST_ENABLED'),
        'field': 'mcast_enabled',
        'type':'icon',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.STORM.COLUMN.MCAST'),
        'field': 'mcast',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }

  getStormTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.FABRIC.STORM.ROW.ACTION.EDIT'),
        'role': 2,
        'value': 'edit'
      },
      {
        'label': this.translate('MODULES.FABRIC.STORM.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ]
  }


  getMonitorActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': false, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': false, 'role': 2}
    };
  }


  getMonitorSchema() {
    return [
      {
        'label': this.translate('MODULES.FABRIC.MONITOR.COLUMN.SESSION_ID'),
        'field': 'session_id',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.MONITOR.COLUMN.SOURCE_SWITCH'),
        'field': 'source_switch',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.MONITOR.COLUMN.SOURCE_PORT'),
        'field': 'source_port',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.MONITOR.COLUMN.DIRECTION'),
        'field': 'direction',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.MONITOR.COLUMN.DST_SWITCH'),
        'field': 'dst_switch',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.FABRIC.MONITOR.COLUMN.DST_PORT'),
        'field': 'dst_port',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }

  getDHCPRelayTabSchema() {
    return [
      {
        'label': this.translate('MODULES.DHCP_RELAY.TAB.SCHEMA.DEFAULT'),
        'value': 'default',
        'type': 'default'
      },
      {
        'label': this.translate('MODULES.DHCP_RELAY.TAB.SCHEMA.INDIRECT'),
        'value': 'indirect',
        'type': 'indirect'
      },
      {
        'label': this.translate('MODULES.DHCP_RELAY.TAB.SCHEMA.INTERFACE'),
        'value': 'interface',
        'type': 'interface'
      },
      {
        'label': this.translate('MODULES.DHCP_RELAY.TAB.SCHEMA.COUNTER'),
        'value': 'counter',
        'type': 'counter'
      }
    ];
  }


  getDHCPRelayDefaultTableSchema() {
    return [
      {
        'label': this.translate('MODULES.DHCP_RELAY.COLUMN.CONNECT_POINT'),
        'field': 'dhcpServerConnectPoint',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.DHCP_RELAY.COLUMN.SERVER_IPS'),
        'field': 'serverIps',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.DHCP_RELAY.COLUMN.GATEWAY_IPS'),
        'field': 'gatewayIps',
        'layout': {'visible': true, 'sortable': true}
      },
      // {
      //   'label': this.translate('MODULES.DHCP_RELAY.COLUMN.AGENT_IPS'),
      //   'field': 'agent_ips',
      //   'layout': {'visible': true, 'sortable': true}
      // }
    ];
  }

  getDHCPRelayInterfaceTableSchema() {
    return [
      {
        'label': this.translate('MODULES.DHCP_RELAY.COLUMN.CONNECT_POINT'),
        'field': 'connectPoint',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.DHCP_RELAY.COLUMN.VLAN'),
        'field': 'vlan',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.DHCP_RELAY.COLUMN.IP'),
        'field': 'ip',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.DHCP_RELAY.COLUMN.MAC'),
        'field': 'mac',
        'layout': {'visible': true, 'sortable': true}
      },
    ];
  }


  getDHCPRelayDefaultTableSubSchema() {
    return [
      {
        'label': this.translate('MODULES.DHCP_RELAY.SUB.COLUMN.DEVICE'),
        'field': 'device',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.DHCP_RELAY.SUB.COLUMN.IPV4'),
        'field': 'ipv4',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.DHCP_RELAY.SUB.COLUMN.IPV6'),
        'field': 'ipv6',
        'layout': {'visible': true, 'sortable': true}
      }
    ];
  }

  getMonitorTableRowActions() {
    return [
      // {
      //   'label': this.translate('MODULES.FABRIC.MONITOR.ROW.ACTION.EDIT'),
      //   'role': 2,
      //   'value': 'edit'
      // },
      {
        'label': this.translate('MODULES.FABRIC.MONITOR.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ]
  }

  getDHCPRelayTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.DHCP_RELAY.ROW.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ]
  }


  getLogicalPortActionsShow() {
    return {
      'menu': {'enable': false, 'role': 3}, 
      'add': {'enable': true, 'role': 3}, 
      'remove': {'enable': true, 'role': 3}, 
      'refresh': {'enable': true, 'role': 3}, 
      'search': {'enable': false, 'role': 3}
    };
  }

  getLogicalPortTableRowActions() {
    return [
    /* {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.EDIT'),
        'role': 3,
        'value': 'edit'
      },*/
      {
        'label': this.translate('MODULES.SWITCHES.SWITCH.ROW.ACTION.DELETE'),
        'role': 3,
        'value': 'delete'
      }
    ]
  }

  getLogicalPortTableSchema() {
    return [
     {
        'label': this.translate('MODULES.PORT.COLUMN.NAME'),
        'field': 'name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': 'M-LAG',
        'field': 'mlag',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.PORT.COLUMN.GROUP'),
        'field': 'group',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.PORT.COLUMN.STATE'),
        'field': 'state',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.PORT.COLUMN.MEMBER_COUNT'),
        'field': 'member_count',
        'layout': {'visible': true, 'sortable': true}
      },
    ];
  }

  getLogicalPortMembersTableSchema() {
    return [
      {
        'label': this.translate('MODULES.PORT.MEMBER.COLUMN.DEVICE'),
        'field': 'device',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULES.PORT.MEMBER.COLUMN.PORT'),
        'field': 'port',
        'layout': {'visible': true, 'sortable': false}
      },
      {
        'label': this.translate('MODULES.PORT.MEMBER.COLUMN.STATUS'),
        'field': 'status',
        'type': 'icon',
        'layout': {'visible': true, 'sortable': false}
      }
    ];
  }

  getDHCPRelayActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': false, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': false, 'role': 2}
    };
  }

  getDHCPRelayCounterActionsShow() {
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': false, 'role': 2},
      'remove': {'enable': false, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': false, 'role': 2}
    };
  }


  getDHCPRelayCounterTableSubSchema() {
    return [
      {
        'label': this.translate('MODULES.DHCP_RELAY.COLUMN.HOST'),
        'field': 'host',
        'layout': {'visible': true, 'sortable': true, 'width':'200px'}
      },
      {
        'label': this.translate('MODULES.DHCP_RELAY.COLUMN.LOCATION'),
        'field': 'location',
        'layout': {'visible': true, 'sortable': true, 'width':'250px'}
      },
      {
        'label': this.translate('MODULES.DHCP_RELAY.COLUMN.SOLICIT'),
        'field': 'solicit',
        'layout': {'visible': true, 'sortable': true, 'width':'100px'}
      },
      {
        'label': this.translate('MODULES.DHCP_RELAY.COLUMN.REQUEST'),
        'field': 'request',
        'layout': {'visible': true, 'sortable': true, 'width':'100px'}
      },
      {
        'label': this.translate('MODULES.DHCP_RELAY.COLUMN.ADVERTISE'),
        'field': 'advertise',
        'layout': {'visible': true, 'sortable': true, 'width':'100px'}
      },
      {
        'label': this.translate('MODULES.DHCP_RELAY.COLUMN.RENEW'),
        'field': 'renew',
        'layout': {'visible': true, 'sortable': true, 'width':'100px'}
      },
      {
        'label': this.translate('MODULES.DHCP_RELAY.COLUMN.REPLY'),
        'field': 'reply',
        'layout': {'visible': true, 'sortable': true, 'width':'100px'}
      }
    ];
  }

}


DeviceService.$inject = DeviceService.getDI();
DeviceService.$$ngIsClass = true;