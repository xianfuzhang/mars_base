let config = {
  // new config
  deviceNumber: 20,
  deviceTypes: ['spine', 'unknown', 'leaf'],
  deviceRoles: ['MASTER', 'SLAVE'],
  deviceProtocols: ['Rest', 'gRPC', 'SNMP', 'OF_13'],
  
  linkLeafNumber: 5,
  linkProtocols: ['LLDP', 'Manual'],
  linkTypes: ['DIRECT'],
  linkStates: ['ACTIVE'],
  
  endpointsNumber: 5,
};

module.exports = config;
