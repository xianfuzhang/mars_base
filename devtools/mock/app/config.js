let config = {
  // test mode
  testMode: true,
  // new config
  deviceNumber: 20,
  deviceTypes: ['spine', 'unknown', 'leaf'],
  deviceRoles: ['MASTER', 'SLAVE'],
  deviceProtocols: ['REST', 'SNMP', 'GRPC', 'Openflow'],
  devicePortNum: 56,
  // deviceLeafGroups: ['R1L1', 'R1L2', 'R1L3', 'R2L1', 'R2L2', 'R2L3'],
  linkLeafNumber: 5,
  linkProtocols: ['LLDP', 'Manual'],
  linkTypes: ['DIRECT'],
  linkStates: ['ACTIVE', 'INACTIVE'],
  endpointsNumber: 5,
  statisticUpdateIntervalSeconds: 15,
  flowNumber: 10,
  alertRuleNumber: 10,
  alertRuleStatus: ['enabled', 'disabled'],
  alertRuleTypes: ['cpu', 'ram', 'disk'],
  alertRuleLevels: [0, 1],
  alertInitGroups: [{
    name: "Alert_Group_1",
    receive: {
      wechat: [
        {
          department: "department1",
          agentId: 1002121,
          agent_corpsecret: "testeE7JIe3vwVeaH30XbHj0uY_7tOy0tw_VlmhGe0g",
        }
      ],
      email: [
        {
          name: "email_name_2",
          email: "email1@noc.com"
        }
      ],
      sms: [
        {
          phone_number: "8860926895615",
          content_code: "SMS_0001",
          Content_Pattern: {"code":"1234", "project":"mars", "msg":"xxxxxx"}
        }
      ]
    }
  }, {
    name: "Alert_Group_2",
    receive: {
      wechat: [
        {
          department: "department2",
          agentId: 1002122,
          agent_corpsecret: "voeveE7JIe3vwVeaH30XbHj0uY_7tOy0tw_VlmhGe0g"
        }
      ],
      email: [
        {
          name: "email_name_1",
          email: "email2@noc.com"
        }
      ],
      sms: [
        {
          phone_number: "8860926895615",
          content_code: "SMS_0002",
          Content_Pattern: {"code":"1234", "project":"mars", "msg":"xxxxxx"}
        }
      ]
    }
  }],
  alertNumber: 10,
  logNumber: 15,
  logCreators: ['org.apache.felix.fileinstall'],
  logOpertations: ['fileinstall', 'fillremove', 'fillupdate'],
  logTypes: ['INFO', 'WARNING'],
  logLevels: ['FelixStartLevel'],
  clusterNumber: 3,
  clusterStatus: ['ACTIVE', 'INACTIVE', 'READY'],
  confighistoryNumber: 15,
  configHistoryTypes: ['added', 'updated', 'deleted']
};

module.exports = config;
