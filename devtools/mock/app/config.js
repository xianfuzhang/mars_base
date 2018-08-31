let config = {
  // new config
  deviceNumber: 20,
  deviceTypes: ['spine', 'unknown', 'leaf'],
  deviceRoles: ['MASTER', 'SLAVE'],
  deviceProtocols: ['Rest', 'gRPC', 'SNMP', 'OF_13'],
  
  linkLeafNumber: 5,
  linkProtocols: ['LLDP', 'Manual'],
  linkTypes: ['DIRECT'],
  linkStates: ['ACTIVE', 'INACTIVE'],
  
  endpointsNumber: 5,
  
  statisticUpdateIntervalSeconds: 15,
  
  flowNumber: 10,
  
  alertRuleNumber: 5,
  alertRuleStatus: ['enabled', 'disabled'],
  alertRuleTypes: ['cpu', 'ram', 'disk'],
  alertRuleLevels: [0, 1],
  alertInitGroups: [{
    name: "Alert_Group_1",
    receive: {
      wechat: [
        {
          department: "department1",
          agentId: 1002121
        }
      ],
      email: [
        {
          name: "email_name_2",
          email: "email1@noc.com"
        }
      ]
    }
  }, {
    name: "Alert_Group_2",
    receive: {
      wechat: [
        {
          department: "department2",
          agentId: 1002122
        }
      ],
      email: [
        {
          name: "email_name_1",
          email: "email2@noc.com"
        }
      ]
    }
  }],
  alertNumber: 10,
  
  logNumber: 10,
  logCreators: ['org.apache.felix.fileinstall'],
  logOpertations: ['fileinstall', 'fillremove', 'fillupdate'],
  logTypes: ['INFO', 'WARNING'],
  logLevels: ['FelixStartLevel'],
  
  clusterNumber: 3,
  clusterStatus: ['ACTIVE', 'INACTIVE', 'READY']
};

module.exports = config;
