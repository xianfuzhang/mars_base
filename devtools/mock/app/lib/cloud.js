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
    _.times(config.deviceNumber, () => {
      let device = new Device(
        chance.guid(),
        chance.pickone(config.deviceTypes),
        chance.bool({ likelihood: 10 }),
        chance.pickone(config.deviceRoles),
        chance.mac_address(),
        chance.guid(),
        chance.word(),
        chance.word(),
        chance.word(),
        chance.company(),
        chance.natural({ min: 1000, max: 9999 }));
  
      // adding data to the cloud
      cloudModel.devices.push(device);
    });
    
    // create links
    _.times(config.linkNumber, () => {
      let linkObj = getLinkObj();
      let link = new Link(
        linkObj.src.port,
        linkObj.src.device,
        linkObj.dst.port,
        linkObj.dst.device,
        chance.pickone(config.linkTypes),
        chance.pickone(config.linkStates));
    
      // adding data to the cloud
      cloudModel.links.push(link);
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
      reqParams.role,
      reqParams.mac,
      reqParams.rack_id,
      reqParams.sw,
      reqParams.hw,
      reqParams.serial,
      reqParams.mfr,
      reqParams.chanssId
    );
    
    // adding data to the cloud
    cloudModel.devices.push(device);
    
    return true;
  },
  
  updateDevice: (deviceId, reqParams) => {
    let device = cloudModel.devices.find(device => device.id === deviceId);
    
    // TODO: how to update, which key
    if (device !== undefined) {
      device.type = reqParams.type;
      device.available = reqParams.available;
      device.role = reqParams.role;
      device.mac = reqParams.mac;
      device.rack_id = reqParams.rack_id;
      device.sw = reqParams.sw;
      device.hw = reqParams.hw;
      device.serial = reqParams.serial;
      device.mfr = reqParams.mfr;
      device.chanssId = reqParams.chanssId;
  
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


function getLinkObj() {
  let linkObj = {};
  let counter = 0;
  do {
    let links = chance.pick(cloudModel.devices, 2);
  
    let srcLink = chance.pickone(links[0].ports.slice(1));
    let dstLink = chance.pickone(links[1].ports.slice(1));
  
    linkObj.src = {
      port: srcLink.port,
      device: srcLink.element
    };
  
    linkObj.dst = {
      port: dstLink.port,
      device: dstLink.element
    }
  } while(!isLinkUnique(linkObj));
  
  return linkObj;
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
