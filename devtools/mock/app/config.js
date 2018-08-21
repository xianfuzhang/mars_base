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
  
  alertNumber: 10,
  alertNames: ['Alert_1', 'Alert_2', 'Alert_3'],
  alertLevels: [1, 2, 3],
  alertGroups: ['Group_1', 'Group_2', 'Group_3'],
  
  logNumber: 10,
  logCreators: ['org.apache.felix.fileinstall'],
  logOpertations: ['fileinstall', 'fillremove', 'fillupdate'],
  logTypes: ['INFO', 'WARNING'],
  logLevels: ['FelixStartLevel'],
  
  clusterNumber: 10,
  clusterStatus: ['ACTIVE', 'INACTIVE', 'READY']
};

module.exports = config;
