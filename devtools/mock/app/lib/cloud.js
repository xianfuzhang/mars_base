var Device = require('../models/device'),
    Link = require('../models/link'),
    Endpoint = require('../models/endpoint'),
    UserAccount = require('../models/useraccount'),
    Flow = require('../models/flow'),
    {AlertRule, Alert} = require('../models/alert'),
    Log = require('../models/log'),
    Cluster = require('../models/cluster'),
    ConfigHistory = require('../models/confighistory'),
    Intent = require('../models/intent'),
    config = require('../config'),
    Chance = require('chance'),
    moment = require('moment'),
    _ = require('lodash');

const chance = new Chance();

// global model
global.cloudModel = {
  devices: [],
  droppedDevices: [],
  links: [],
  endpoints: [],
  flows: [],
  flowgroups: [],
  alert: {
    rules: [],
    history: [],
    groups: [],
  },
  logs: [],
  clusters: [],
  useraccounts: [{
    "user_name": "nocsys",
   "groups": ["supergroup"],
   "password": "nocsys"
  }],
  dhcpserver:{},
  confighistory: [],
  intents: []
};

let updateInterval;

let cloudLib = {
  isCloudEmpty: () => {
    if (cloudModel.devices.length == 0) {
      return true;
    }

    return false;
  },
  
  // create a new cloud
  createCloud: () => {
    // create device
    let spineNum = chance.natural({min:3, max:5});
    let unknownNum = chance.natural({min:2, max:4});
    let leafNum = config.deviceNumber - spineNum - unknownNum;
    let leafGroupNames = [];
    if(leafNum < 1) return;
    
    _.times(config.deviceNumber, (index) => {
      let type, portMinNum, name, leaf_group = {};
      if(index < spineNum) {
        type = config.deviceTypes[0];
        portMinNum = leafNum;
        name = 'Spine_' + chance.word();
      } else if(index < spineNum + unknownNum) {
        type = config.deviceTypes[1];
        portMinNum = 12;
        name = 'Unknown_' + chance.word();
      } else {
        type =  config.deviceTypes[2];
        portMinNum = spineNum;
        let leafGroupName = `Leaf_Group_${(index - spineNum - unknownNum) % Math.ceil(leafNum / 2 + 1)}`;
        let switchPort = chance.natural({ min: 1, max: portMinNum+8});
        
        if(index >= spineNum + unknownNum + 2){
          leaf_group = {
            name: leafGroupName,
            switch_port: switchPort
          }
          leafGroupNames.push(leafGroupName);
        } else {
          leaf_group = {}
        }
        
        name = 'Leaf_' + chance.word();
      }
      let device = new Device(
        chance.guid(),
        type,
        chance.bool({ likelihood: 90 }),
        chance.pickone(config.deviceRoles),
        chance.mac_address(),
        chance.guid().slice(0,8),
        chance.word(),
        chance.word(),
        chance.word(),
        chance.company(),
        chance.natural({ min: 1000, max: 9999 }),
        chance.word(),
        leaf_group,
        chance.company(),
        name,
        chance.ip(),
        chance.port(),
        chance.pickone(config.deviceProtocols));
  
      // adding data to the cloud
      cloudModel.devices.push(device);
    });
    
    // create links
    // 1.spine--leaf links
    for(let i = 0; i < spineNum; i++) {
      for(let j = spineNum + unknownNum; j < cloudModel.devices.length; j++) {
        let linkType = chance.pickone(config.linkTypes);
        let linkState = chance.pickone(config.linkStates);
  
        let linkPair = getLinkPair(cloudModel.devices[i], cloudModel.devices[j]);
        let link = new Link(
          linkPair[0].src.port,
          linkPair[0].src.device,
          linkPair[0].dst.port,
          linkPair[0].dst.device,
          linkType,
          linkState);
        // adding data to the cloud
        cloudModel.links.push(link);
  
        link = new Link(
          linkPair[1].src.port,
          linkPair[1].src.device,
          linkPair[1].dst.port,
          linkPair[1].dst.device,
          linkType,
          linkState);
        // adding data to the cloud
        cloudModel.links.push(link);
      }
    }
    
    // 2.leaf--leaf links
    leafGroupNames.forEach((name) => {
      let result = _.find(cloudModel.devices.slice(spineNum+unknownNum), (device) => {
        return device.leaf_group.name == name;
      });
      
      if(result && result.length > 1) {
        let linkType = chance.pickone(config.linkTypes);
        let linkState = chance.pickone(config.linkStates);
        let pairDevices = chance.pick(cloudModel.devices.slice(spineNum+unknownNum), 2);
  
        let linkPair = getLinkPair(pairDevices[0], pairDevices[1]);
        let link = new Link(
          linkPair[0].src.port,
          linkPair[0].src.device,
          linkPair[0].dst.port,
          linkPair[0].dst.device,
          linkType,
          linkState);
        // adding data to the cloud
        cloudModel.links.push(link);
  
        link = new Link(
          linkPair[1].src.port,
          linkPair[1].src.device,
          linkPair[1].dst.port,
          linkPair[1].dst.device,
          linkType,
          linkState);
        // adding data to the cloud
        cloudModel.links.push(link);
      }
    });
    
    // create endpoints
    _.times(config.endpointsNumber, () => {
      let ip_addresses = [];
      _.times(chance.natural({min:1,max:3}), () => {
        ip_addresses.push(chance.ip());
      });
      
      let endpoint = new Endpoint(
        chance.guid(),
        chance.mac_address(),
        'tanent_' + chance.word(),
        'segment_' + chance.word(),
        ip_addresses);
    
      // adding data to the cloud
      cloudModel.endpoints.push(endpoint);
    });
    
    // create flows
    let deviceIds = [];
    cloudModel.devices.forEach((device) => {
      deviceIds.push(device.id);
    });
    _.times(config.flowNumber, () => {
      let flow = new Flow(
        chance.guid(),
        chance.natural({min:0, max:5}),
        'org.onosproject.core',
        chance.natural({min:0, max:3}),
        chance.natural({min:40000, max:40005}),
        chance.natural({min:0, max:1000}),
        chance.bool({likelihood: 90}),
        chance.pickone(deviceIds),
        'ADDED',
        chance.natural({min: 1000, max: 1000000}),
        chance.natural({min: 100, max: 100000}),
        chance.natural({min: 1000, max: 10000000}),
        "UNKNOWN",
        Date.now()
      );
      
      cloudModel.flows.push(flow);
    });
    
    // create alert group
    cloudModel.alert.groups = _.cloneDeep(config.alertInitGroups);
    
    // create alert rule
    _.times(config.alertRuleNumber, (index) => {
      let from = index < config.alertRuleNumber / 2 ? 'controller' : 'switch';
      let type = from == 'switch' ? chance.pickone(config.alertRuleTypes.concat('port')) : chance.pickone(config.alertRuleTypes);
      let query = getAlertQuery(type);
      let group = chance.pickone(cloudModel.alert.groups);
      
      let alertRule = new AlertRule(
        'Alert_Rule_' + chance.word(),
        chance.pickone(config.alertRuleStatus),
        chance.pickone(config.alertRuleLevels),
        group.name,
        query,
        from,
        type
      );
      
      cloudModel.alert.rules.push(alertRule);
    });
  
    // create alert
    let rules = _.filter(cloudModel.alert.rules, (rule) => {
      return rule.status === 'enabled';
    })
    _.times(config.alertNumber, (index) => {
      let rule = chance.pickone(rules);
      
      let msg = `${rule.type} `;
      Object.keys(rule.query).forEach((key) => {
        msg += `${rule.query[key]} `
      })
      
      let alert = new Alert(
        chance.guid(),
        rule.name,
        rule.alert_level,
        rule.receive_group,
        rule.from,
        msg
      );
    
      cloudModel.alert.history.push(alert);
    });
    
    // create logs
    _.times(config.logNumber, () => {
      let now = moment();
      let beforeDay = chance.pickone([0,1,2,3]);
      let created_time = now.subtract(beforeDay, 'd').valueOf();
      
      let log = new Log(
        chance.guid(),
        chance.pickone(config.logCreators),
        chance.pickone(config.logOpertations),
        chance.pickone(config.logLevels),
        chance.pickone(config.logTypes),
        chance.sentence(),
        created_time
      );
      
      cloudModel.logs.push(log);
    });
    
    // create controller cluster
    _.times(config.clusterNumber, () => {
      let cluster = new Cluster(
        chance.ip(),
        chance.integer({min:1000,  max:65535}),
        chance.pickone(config.clusterStatus),
        Date.now()
      );
      
      cloudModel.clusters.push(cluster);
    });

    //create dhcp
    cloudModel.dhcpserver = {
      "startip": "192.168.40.10",
      "endip": "192.168.40.100",
      "subnet": "255.255.252.0",
      "router": "255.255.252.0",
      "domain": "8.8.8.8",
      "ttl": 63,
      "lease": 150,
      "renew": 75,
      "rebind": 200,
      "delay": 2,
      "timeout": 150
    }


    // create config history
    _.times(config.confighistoryNumber, () => {
      let now = moment();
      let beforeDay = chance.pickone([0,1,2,3]);
      let time = now.subtract(beforeDay, 'd').valueOf();
      let configHistory = getConfiguration();
      let history = new ConfigHistory(
        time,
        chance.pickone(config.configHistoryTypes),
        "snmp:192.168.2.1:161",
        "org.onosproject.provider.snmp.device.impl.SnmpDeviceConfig",
        configHistory
      );
      
      cloudModel.confighistory.push(history);
    });
    
    updateStatistics();
  },
  
  addDevice: (reqParams) => {
    let device = new Device(
      reqParams.deviceId || chance.guid(),
      reqParams.type,
      reqParams.available,
      reqParams.role || chance.pickone(config.deviceRoles),
      reqParams.mac,
      reqParams.rack_id || chance.guid(),
      reqParams.sw || chance.word(),
      reqParams.hw || chance.word(),
      reqParams.serial || chance.word(),
      reqParams.mfr || chance.company(),
      reqParams.chanssId || chance.natural({ min: 1000, max: 9999 }),
      reqParams.driver || chance.word(),
      reqParams.leaf_group,
      reqParams.community,
      reqParams.name,
      reqParams.managementAddress,
      reqParams.port,
      reqParams.protocol
    );
    
    // adding data to the cloud
    cloudModel.devices.push(device);
    
    return true;
  },
  
  updateDevice: (deviceId, reqParams) => {
    let device = cloudModel.devices.find(device => device.id === deviceId && !cloudModel.droppedDevices.includes(deviceId));
    
    // TODO: how to update, which key
    if (device !== undefined) {
      device.type = reqParams.type || device.type;
      device.available = reqParams.available || device.available;
      device.role = reqParams.role || device.role;
      device.mac = reqParams.mac || device.mac;
      device.rack_id = reqParams.rack_id || device.rack_id;
      device.sw = reqParams.sw || device.sw;
      device.hw = reqParams.hw || device.hw;
      device.serial = reqParams.serial || device.serial;
      device.mfr = reqParams.mfr || device.mfr;
      device.chassisId = reqParams.chassisId || device.chassisId;
      device.community = reqParams.community || device.community;
      device.leaf_group =  reqParams.leaf_group || device.leaf_group;
      device.annotations.name = reqParams.name || device.annotations.name;
      device.annotations.managementAddress = reqParams.managementAddress || device.annotations.managementAddress;
      device.annotations.channelId = reqParams.managementAddress + ':' + reqParams.port || device.annotations.channelId;
      device.annotations.protocol = reqParams.protocol || device.annotations.protocol;
      device.annotations.port = reqParams.port || device.annotations.port;
  
      return true;
    }
  
    return false;
  },
  
  updatePort: (deviceId, portId, reqParams) => {
    let device = cloudModel.devices.find(device => device.id === deviceId && !cloudModel.droppedDevices.includes(deviceId));
    
    if (device) {
      let port = device.ports.find(port => port.port == portId);
      
      if(port) {
        port.isEnabled = reqParams.enabled === undefined ? port.isEnabled : reqParams.enabled;
        return true;
      }
      
      return false;
    }
    
    return false;
  },
  
  updateStorm: (deviceId, reqParams) => {
    let device = cloudModel.devices.findIndex(device => device.id === deviceId && !cloudModel.droppedDevices.includes(deviceId));
    if (device) {
      device.storm.unicast = reqParams.unicast;
      device.storm.bcast = reqParams.bcast;
      device.storm.mcast = reqParams.mcast;
      
      return true;
    }
  
    return false;
  },
  
  deleteDevice: (deviceId) => {
    // search using the instanceId in the instances array for each project
    let index = cloudModel.devices.findIndex(device => device.id === deviceId && !cloudModel.droppedDevices.includes(deviceId));
    if (index !== -1) {
      cloudModel.devices.splice(index, 1);
      return true;
    }
    
    return false;
  },
  
  deleteEndpoint: (vlan, mac) => {
    // search using the instanceId in the instances array for each project
    let index = cloudModel.endpoints.findIndex((endpoint) => {
      return endpoint.vlan === vlan
          && endpoint.mac === mac
    });
    
    if (index !== -1) {
      cloudModel.endpoints.splice(index, 1);
      return true;
    }
    
    return false;
  },
  
  addEndpoint: (reqParams) => {
    let endpoint = new Endpoint(
      chance.guid(),
      reqParams.mac,
      reqParams.tenant || -1,
      reqParams.vlan,
      reqParams.ipAddresses,
      reqParams.locations
    );
    
    cloudModel.endpoints.push(endpoint);
    
    return true;
  },

  addUserAccount: (reqParams) => {
    let user = new UserAccount(
      reqParams.user_name,
      reqParams.groups,
      reqParams.password
    );

    cloudModel.useraccounts.push(user);
  },

  deleteUserAccount: (userName) => {
    let index = cloudModel.useraccounts.findIndex((useraccount) => {
      return useraccount.user_name === userName;
    });

    if (index !== -1) {
      cloudModel.useraccounts.splice(index, 1);
      return true;
    }
    return false;
  },
  
  addFlow: (appId, flow) => {
   let newFlow = new Flow(
      chance.guid(),
      chance.natural({min:0, max:5}),
      appId,
      chance.natural({min:0, max:3}),
      flow.priority,
      flow.timeout,
      flow.isPermanent,
      flow.deviceId,
      'ADDED',
      chance.natural({min: 1000, max: 1000000}),
      chance.natural({min: 100, max: 100000}),
      chance.natural({min: 1000, max: 10000000}),
      "UNKNOWN",
      Date.now()
    );

    // adding data to the cloud
    cloudModel.flows.push(newFlow);
    
    return true;
  },

  addIntent: (reqParams) => {
    let intent;
    if (reqParams.type === "PointToPointIntent") {
      intent = new Intent(
        chance.guid(),
        reqParams.type,
        reqParams.appId,
        [reqParams.ingressPoint, reqParams.egressPoint],
        reqParams.priority,
        chance.pickone(['FAILED', 'SUCCESS'])
      );
    }
    else {
      intent = new Intent(
        chance.guid(),
        reqParams.type,
        reqParams.appId,
        [reqParams.one, reqParams.two],
        reqParams.priority,
        chance.pickone(['FAILED', 'SUCCESS'])
      );
    }
    cloudModel.intents.push(intent);
    return true;
  }
};

function updateStatistics() {
  if(!updateInterval) {
    updateInterval = setInterval(() => {
      cloudModel.devices.forEach(device => {
        if(!device.available) return;
    
        device.ports.forEach((port) => {
          if(!port.isEnabled) return;
      
          port.statistic.packetsReceived += _.random(1, 10);
          port.statistic.packetsSent += _.random(1, 100);
          port.statistic.bytesReceived += _.random(10000, 100000);
          port.statistic.bytesSent += _.random(100, 1000);
          port.statistic.packetsRxDropped += _.random(0, 5);
          port.statistic.packetsTxDropped += _.random(0, 5);
          port.statistic.packetsRxErrors += _.random(0, 5);
          port.statistic.packetsTxErrors += _.random(0, 5);
          port.statistic.durationSec += config.statisticUpdateIntervalSeconds;
        });
        
        // update time
        device.uptime += config.statisticUpdateIntervalSeconds;
        device.statistic = device.createSystemStatistic();
      });
  
      cloudModel.clusters.forEach(cluster => {
        // update time
        cluster.uptime += config.statisticUpdateIntervalSeconds;
        cluster.statistic = cluster._createStatistic();
      });
    }, config.statisticUpdateIntervalSeconds * 1000);
  }
}

function getLinkPair(preDevice, postDevice) {
  let linkPair = [];
  let linkObj1 = {}, linkObj2 = {};
  do {
    let srcLink = chance.pickone(preDevice.ports.slice(1));
    let dstLink = chance.pickone(postDevice.ports.slice(1));
  
    linkObj1.src = {
      port: srcLink.port,
      device: srcLink.element
    };
  
    linkObj1.dst = {
      port: dstLink.port,
      device: dstLink.element
    }
  } while(!isLinkUnique(linkObj1));
  
  linkObj2.src = linkObj1.dst;
  linkObj2.dst = linkObj1.src;
  
  return [linkObj1, linkObj2];
}

function isLinkUnique(linkObj) {
  let res = cloudModel.links.find((link) => {
    return _.isEqual(link.src, linkObj.src)
        || _.isEqual(link.src, linkObj.dst)
        || _.isEqual(link.dst, linkObj.src)
        || _.isEqual(link.dst, linkObj.dst)
  });
  
  return res ? false : true;
}

function getAlertQuery(type) {
  switch (type) {
    case 'cpu':
      return [{
        util: 60,
        condition: "gt",
        continue: 120
      }];
    case 'ram':
      return [{
        used_ratio: 80,
        condition: "gt",
        continue: 180
      }]
    case 'disk':
      return [{
        root_used_ratio: 90,
        condition: "gt",
        continue: 1800
      }]
    case 'port':
      let tmp =
        [
          {
            query_rx: [{
              rx_util: 70,
              condition: "gt",
              continue: 600
            }],
          },
          {
            query_tx: [{
              tx_util: 60,
              condition: "gt",
              continue: 600
            }]
          }
        ]
      
      return chance.pickone(tmp);
  }
}

function getConfiguration() {
  // TODO: return configuration
  return {
    ip: "192.168.2.1",
    port: 161,
    username: "admin",
    password: "admin"
  }
}

module.exports = cloudLib;
