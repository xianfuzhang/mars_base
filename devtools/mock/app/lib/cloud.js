var Device = require('../models/device'),
    Link = require('../models/link'),
    Endpoint = require('../models/endpoint'),
    config = require('../config'),
    Chance = require('chance'),
    _ = require('lodash');

const chance = new Chance();

// global model
global.cloudModel = {
  devices: [],
  links: [],
  endpoints: []
};

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
    let leafGroups = [];
    if(leafNum < 1) return;
    
    _.times(config.deviceNumber, (index) => {
      let type, portMinNum, leaf_group = "";
      if(index < spineNum) {
        type = config.deviceTypes[0];
        portMinNum = leafNum;
      } else if(index < spineNum + unknownNum) {
        type = config.deviceTypes[1];
        portMinNum = 12;
      } else {
        type =  config.deviceTypes[2];
        portMinNum = spineNum;
        leaf_group = `${(index - spineNum - unknownNum) % Math.ceil(leafNum / 2 + 1)}`;
        leafGroups.push(leaf_group);
      }
      let device = new Device(
        chance.guid(),
        type,
        chance.bool({ likelihood: 10 }),
        chance.pickone(config.deviceRoles),
        chance.mac_address(),
        chance.guid().slice(0,8),
        chance.word(),
        chance.word(),
        chance.word(),
        chance.company(),
        chance.natural({ min: 1000, max: 9999 }),
        chance.word(),
        portMinNum,
        leaf_group,
        chance.company(),
        chance.name(),
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
    leafGroups.forEach((leaf_group) => {
      let result = _.find(cloudModel.devices.slice(spineNum+unknownNum), (device) => {
        return device.leaf_group == leaf_group;
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
  },
  
  addDevice: (reqParams) => {
    let device = new Device(
      chance.guid(),
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
      24,
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
    let device = cloudModel.devices.find(device => device.id === deviceId);
    
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
  
      return true;
    }
  
    return false;
  },
  
  updatePort: (deviceId, portId, reqParams) => {
    let device = cloudModel.devices.find(device => device.id === deviceId);
    
    if (device) {
      let port = device.ports.find(port => port == portId);
      
      if(port) {
        port.isEnabled == reqParams.enabled;
        return true;
      }
      
      return false;
    }
    
    return false;
  },
  
  updateStorm: (deviceId, reqParams) => {
    let device = cloudModel.devices.findIndex(device => device.id === deviceId);
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
    let index = cloudModel.devices.findIndex(device => device.id === deviceId);
    if (index !== -1) {
      cloudModel.devices.splice(index, 1);
      return true;
    }
    
    return false;
  },
  
  deleteEndpoint: (tenant, segment, mac) => {
    // search using the instanceId in the instances array for each project
    let index = cloudModel.endpoints.findIndex((endpoint) => {
      return endpoint.tenant === tenant
          && endpoint.segment === segment
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
      reqParams.tenant,
      reqParams.segment,
      reqParams.ip_addresses,
      reqParams.location
    );
    
    cloudModel.endpoints.push(endpoint);
    
    return true;
  }
};


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

module.exports = cloudLib;
