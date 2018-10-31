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
    return {'menu': false, 'add': false, 'remove': false, 'refresh': true, 'search': false};
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
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.MAC'),
        'field': 'mac',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.SEGMENT'),
        'field': 'segment_name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.IP'),
        'field': 'ip',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.TENANT'),
        'field': 'tenant_name',
        'layout': {'visible': true, 'sortable': true}
      },
      {
        'label': this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.LOCATION'),
        'field': 'location',
        'layout': {'visible': true, 'sortable': true}
      }
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

  getFlowTableList(){
    return ['10', '20', '30' , '40', '50', '60']
  }

  getFlowTableFirstInputRow(){
    return {
      '10':[
        {'field':'in_port', 'type':'int', 'require':'true'},
        {'field':'vlan_id', 'type':'int', 'require':'true'}
      ],
      '20':[
        {'field':'ether_type', 'input_type':'select', 'select_value':['0x0800','0x86dd']},
        {'field':'destination_mac', 'type':'mac', 'require':'true'}
      ],
      '30':[
        {'field':'ether_type', 'input_type':'select', 'select_value':['0x0800','0x86dd']}
      ],
      '40':[
        {'field':'ether_type', 'input_type':'select', 'select_value':['0x0800','0x86dd']},
      ],
      '50':[
        {'field':'vlan_id', 'type':'int','require':'true'},
        {'field':'destination_mac', 'type':'mac','require':'false'}
      ],
      '60':[
        {'field':'vlan_id', 'type':'int','require':'true'}
      ]
    }
  }

  getFlowTableFirstInputRowByTableId(tableId){
    let all = this.getFlowTableFirstInputRow();
    return all[tableId];
  }

  getFlowTableSecondInputRow() {

    return {
      '10': null,
      '20': {
        'unicast_mac': [{'field': 'in_port', 'type': 'int', 'require': 'false'}],
        'ipv4_multicast_mac:': [
          {'field': 'destination_ipv4', 'type': 'ipv4', 'require': 'false'},
          {'field': 'vlan_id', 'type': 'int', 'require': 'false'},
          {'field': 'in_port', 'type': 'int', 'require': 'false'},
        ],
        'ipv6_multicast_mac': [
          {'field': 'destination_ipv6', 'type': 'ipv6', 'require': 'false'},
          {'field': 'vlan_id', 'type': 'int', 'require': 'false'},
          {'field': 'in_port', 'type': 'int', 'require': 'false'},
        ]
      },
      '30': {
        'ipv4_multicast': [
          {'field': 'destination_ipv4', 'type': 'ipv4', 'require': 'false'},
          {'field': 'ip_proto', 'type': 'string', 'require': 'false'},
          {'field': 'udp_dport', 'type': 'int', 'require': 'false'},
          {'field': 'udp_sport', 'type': 'int', 'require': 'false'},
        ],
        'ipv6_multicast': [
          {'field': 'destination_ipv6', 'type': 'ipv6', 'require': 'false'},
          {'field': 'ip_proto', 'type': 'string', 'require': 'false'},
          {'field': 'udp_dport', 'type': 'int', 'require': 'false'},
          {'field': 'udp_sport', 'type': 'int', 'require': 'false'},
        ]
      },
      '40': {
        'ipv4_multicast': [
          {'field':'vlan_id', 'type':'int','require':'true'},
          {'field': 'destination_ipv4', 'type': 'ipv4_multi', 'require': 'true'},
          {'field': 'source_ipv4', 'type': 'ipv4', 'require': 'false'},
          {'field': 'l3_in_port', 'type': 'int', 'require': 'false'},
        ],
        'ipv6_multicast': [
          {'field':'vlan_id', 'type':'int','require':'true'},
          {'field': 'destination_ipv6', 'type': 'ipv6', 'require': 'true'},
          {'field': 'source_ipv6', 'type': 'ipv6', 'require': 'false'},
          {'field': 'l3_in_port', 'type': 'int', 'require': 'false'},
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

  getFlowTableSecondInputRowByFilter(tableId, type){
    let secondInputs = this.getFlowTableSecondInputRow();
    return secondInputs[tableId][type];
  }

  getFlowTableApplyActionMaps(){
    return   {
      '10': [
        {'field': 'vlan_id', 'type': 'int', 'require': 'true'},
        {'field': 'push_vlan', 'type': 'int', 'require': 'false'},
      ],
      '20': [{'field': 'output_to_ctrl', 'require': 'false','input_type':'switch'}],
      '30': [{'field': 'output_to_ctrl', 'require': 'false','input_type':'switch'}],
      '40': [],
      '50': [{'field': 'output_to_ctrl', 'require': 'false','input_type':'switch'}],
      '60': [{'field': 'output_to_ctrl', 'require': 'false','input_type':'switch'}],
    }
  }

  getFlowTableApplyActionMapByTid(tableId){
    let maps = this.getFlowTableApplyActionMaps();
    return maps[tableId];
  }

  getFlowTableWriteActionMaps(){
    return   {
      '10': null,
      '20': null,
      '30': {
        'ipv4_multicast':['l3_ucast_group','l3_ecmp_group'],
        'ipv6_multicast':['l3_ucast_group','l3_ecmp_group']
      },
      '40':{
        'ipv4_multicast':['l3_mcast_group'],
        'ipv6_multicast':['l3_mcast_group']
      },
      '50': {
        'unicast_vlan_bridge': ['l2_intf_group', 'l2_unflt_intf_group'],
        'multicast_vlan_bridge': ['l2_mcast_group'],
        'dlf_vlan_bridge': ['l2_flood_group']
      },
      '60': ['l2_intf_group', 'l2_rewrite_group','l2_mcast_group','l3_ucast_group','l3_mcast_group','l3_ecmp_group','l2_unflt_intf_group'],
    }
  }

  getFlowTableWriteActionMapByFilter(tableId, type){
    let maps = this.getFlowTableWriteActionMaps();
    let res = maps[tableId];
    if(res === null || res instanceof Array){
      return res;
    } else {
      return res[type]
    }
  }

  getGroupTypeMapper(){
    return {
      'l2_intf_group':'0',
      'l2_rewrite_group':'1',
      'l3_ucast_group': '2',
      'l2_mcast_group':'3',
      'l2_flood_group':'4',
      'l3_intf_group':'5',
      'l3_mcast_group':'6',
      'l3_ecmp_group':'7',
      'l2_unflt_intf_group':'11'
    }
  }


  getGroupNameMapper(){
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


  getGroupNameByKey(key){
    let mapper = this.getGroupNameMapper();
    return mapper[key]
  }


  getGroupTypeId(groupName){
    return this.getGroupTypeMapper()[groupName];
  }



  getFlowTableAclOptionList(){
    return {
      'in_port': [
        {'field': 'in_port', 'type': 'int', 'require': 'true'},
      ],
      'ether_type': [
        {'field': 'ether_type', 'type': 'int', 'require': 'true', 'input_type':'select', 'select_value':['0x0800','0x86dd']},
      ],
      'source_mac': [
        {'field': 'source_mac', 'type': 'mac', 'require': 'true'},
        {'field': 'source_mac_mask', 'type': 'string', 'require': 'true'},
      ],
      'destination_mac': [
        {'field': 'destination_mac', 'type': 'mac', 'require': 'true'},
        {'field': 'destination_mac_mask', 'type': 'string', 'require': 'true'},
      ],
      'vlan_id': [
        {'field': 'vlan_id', 'type': 'int', 'require': 'true'},
      ],
      'vlan_pcp': [
        {'field': 'vlan_pcp', 'type': 'int', 'require': 'true'},
      ],
      'source_ipv4': [
        {'field': 'source_ipv4', 'type': 'ipv4', 'require': 'true'},
        {'field': 'source_ipv4_mask', 'type': 'string', 'require': 'true'},
      ],
      'destination_ipv4': [
        {'field': 'destination_ipv4', 'type': 'ipv4', 'require': 'true'},
        {'field': 'destination_ipv4_mask', 'type': 'string', 'require': 'true'},
      ],
      'source_ipv6': [
        {'field': 'source_ipv6', 'type': 'ipv6', 'require': 'true'},
        {'field': 'source_ipv6_mask', 'type': 'string', 'require': 'true'},
      ],
      'destination_ipv6': [
        {'field': 'destination_ipv6', 'type': 'ipv6', 'require': 'true'},
        {'field': 'destination_ipv6_mask', 'type': 'string', 'require': 'true'},
      ],
      'ipv4_arp_spa': [
        {'field': 'ipv4_arp_spa', 'type': 'int', 'require': 'true'},
      ],
      'ip_proto': [
        {'field': 'ip_proto', 'type': 'string', 'require': 'true'},
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
  isIpv4MultiMAC(mac){
    let pattern = '^(0[1-9a-fA-F]|[1-9a-fA-F][0-9a-fA-F]):[0-9a-fA-F]{2}:(5[e-fE-F]|[6-9a-fA-F][0-9a-fA-F]):([0-7][0-9a-fA-F]|80)(:00){2}$';
    return mac.search(pattern) === -1?false:true;
  }

  //333300000000/ffff00000000
  isIpv6MultiMAC(mac){
    let pattern = '^((3[3-9a-fA-F]|[4-9a-fA-F][0-9a-fA-F]):){2}(00:){3}00$';
    return mac.search(pattern) === -1?false:true;
  }


}

DeviceService.$inject = DeviceService.getDI();
DeviceService.$$ngIsClass = true;