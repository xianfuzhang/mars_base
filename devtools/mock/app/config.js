let config = {
  // new config
  deviceNumber: 5,
  deviceTypes: ['leaf', 'spine', 'unknown'],
  deviceRoles: ['MASTER', 'SLAVE'],
  deviceProtocols: ['Rest', 'gRPC', 'SNMP', 'OF_13'],
  
  linkNumber: 10,
  linkProtocols: ['LLDP', 'Manual'],
  linkTypes: ['DIRECT'],
  linkStates: ['ACTIVE'],
  
  endpointsNumber: 5,
};

module.exports = config;
