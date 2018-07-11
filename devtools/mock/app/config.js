let config = {
  numberOfProjects: 8,
  numberOfInstances: 100,
  minNumberOfInstances: 5,
  numberOfRacks: 5,
  numberOfSpines: 3,
  numberOfComputes: 15,
  resourceUsageDelay: 10000, // value in microseconds
  maxResourceUsageLength: 2,
  switchTypeSwitch: 'SWITCH',
  switchTypeRouter: 'ROUTER',
  switchRoleMaster: 'MASTER',
  switchRoleSlave: 'SLAVE',
  
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
