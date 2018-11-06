const express = require('express'),
      router = express.Router(),
      cloudLib = require('../lib/cloud'),
      config = require('../config'),
      Chance = require('chance'),
      _ = require('lodash');

let chance = new Chance();

router.get('/devices', function (req, res) {
  let devices = [];
  let tmpDevices = _.cloneDeep(cloudModel.devices);
  
  if(config.TEST_MODE) { // test mode
    if(cloudModel.droppedDevices.length == 0) { // first request
      // delete one device as dropped randomly
      let droppedIndex = chance.natural({min:0, max: tmpDevices.length - 1});
      cloudModel.droppedDevices.push(tmpDevices[droppedIndex].id);
      tmpDevices.splice(droppedIndex, 1);
    } else {
      cloudModel.droppedDevices.forEach((droppedId) => {
        let index = _.findIndex(tmpDevices, (device) => {
          return device.id === droppedId;
        });
        tmpDevices.splice(index, 1);
      });
    }
  }
  
  devices = tmpDevices.map((device, index) => {
    return formatDevice(device);
  });
  
  return res.json({devices: devices});
});

router.get('/devices/drop', (req, res) => {
  let tmpDevices = _.cloneDeep(cloudModel.devices);
  
  if(cloudModel.droppedDevices.length < config.MAX_DROPPED_NUM) {
    // delete one device as dropped randomly
    let droppedIndex = chance.natural({min:0, max: tmpDevices.length - 1});
    let deviceId = tmpDevices[droppedIndex].id;
    cloudModel.droppedDevices.push(deviceId);
    tmpDevices.splice(droppedIndex, 1);
    
    res.status(200).json(`Dropped successfully! Dropped device: ${deviceId}`)
  } else {
    res.status(200).json(`Failed to drop! Dropped devices: ${deviceId}`)
  }
})

router.get('/devices/drop/list', (req, res) => {
  res.status(200).json(`Dropped devices: [${cloudModel.droppedDevices}]`)
})

router.get('/devices/recover', (req, res) => {
  cloudModel.droppedDevices = [];
  
  res.status(200).json('Dropped device recovered!')
})

router.post('/devices', function(req, res) {
  //  TODO: need validation
  if(!validateDeviceRequest(req.body)) {
    return res.status(400).json('The request params to add new device are invalid!');
  }
  
  if(cloudLib.addDevice(req.body)) {
    return res.status(200).json('Success to add new device!');
  } else {
    return res.status(400).json('Failed to add new device!');
  }
});

router.delete('/devices/:deviceId', function(req, res) {
  if (!req.params.deviceId) {
    return res.status(404).json('Device ID is required!');
  }
  
  let result = cloudLib.deleteDevice(req.params.deviceId);
  if (result) {
    return res.status(200).json("This device has been deleted!");
  } else {
    return res.status(400).json("Failed to delete the device!");
  }
})

router.get('/devices/:deviceId', function (req, res) {
  let devices = [];
  
  if (!req.params.deviceId) {
    return res.status(404).json('Device ID is required');
  }

  if(req.params.deviceId == 'ports') {
    let ports = [];
    _.forEach(cloudModel.devices,(device) => {
      if(!cloudModel.droppedDevices.includes(device.id)) {
        ports = ports.concat(device.ports);
      }
    });
  
    return res.json({ports: formatPorts(ports)});
  }
  
  if(req.params.deviceId == 'config') {
    let configs = [];
  
    configs = _.cloneDeep(cloudModel.devices).map((device, index) => {
      // if(index %10 === 0){
      //   return null
      // }
      let config = {
        id: device.id,
        // name: device.annotations.name,
        type: device.type,
        available: device.available,
        mgmtIpAddress: device.annotations.managementAddress,
        mac: device.mac,
        mrf: device.mrf,
        port: device.annotations.port,
        protocol: device.annotations.protocol,
        rack_id: device.rack_id,
        community: device.community,
        leafGroup: device.leaf_group
      };
    
      return config;
    });

    configs.splice(5, 5);
  
    _.times(chance.natural({min:1,max:3}), () => {
      let index = _.findIndex(configs, (config) => {
        return config.protocol == 'Openflow'
      })
      
      if(index != -1)
        configs.splice(index,1)
    })
    
    return res.json({configs: configs});
  }
  
  devices = _.cloneDeep(cloudModel.devices);
  
  // search using the instanceId in the instances array for each project
  let searchDevice = devices.find(device => device.id === req.params.deviceId && !cloudModel.droppedDevices.includes(req.params.deviceId));

  if (searchDevice !== undefined) {
    return res.json(formatDevice(searchDevice));
  } else {
    return res.status(404).json("This device doesn't exist!");
  }
});

router.get('/devices/:deviceId/:type', function (req, res) {
  if (!req.params.deviceId) {
    return res.status(404).json('Device ID is required');
  }
  
  if(req.params.deviceId == 'config'){
    let devices = [];
  
    if (!req.params.type) {
      return res.status(404).json('Device ID is required');
    }
  
    devices = _.cloneDeep(cloudModel.devices);
  
    // search using the instanceId in the instances array for each project
    let device = devices.find(device => device.id === req.params.type);
  
    if (device !== undefined) {
      let config = {
        id: device.id,
        name: device.annotations.name,
        type: device.type,
        available: device.available,
        mgmtIpAddress: device.annotations.managementAddress,
        mac: device.mac,
        mrf: device.mrf,
        port: device.annotations.port,
        protocol: device.annotations.protocol,
        rack_id: device.rack_id,
        community: device.community,
        leafGroup: device.leaf_group
      };
    
      return res.json(config);
    } else {
      return res.status(404).json("This device doesn't exist!");
    }
  }
  
  let devices = _.cloneDeep(cloudModel.devices);
  
  // search using the instanceId in the instances array for each project
  let searchDevice = devices.find(device => device.id === req.params.deviceId && !cloudModel.droppedDevices.includes(req.params.deviceId));
  
  if (searchDevice !== undefined) {
    switch(req.params.type) {
      case 'ports':
        return res.json(searchDevice);
        
      case 'storm':
        return res.json(searchDevice.storm);
        
      case 'links':
        
        let result = _.filter(cloudModel.links, (link) => {
          return link.src.device == req.params.deviceId || link.dst.device == req.params.deviceId
        });
        
        if(result) {
          return res.json(result);
        } else {
          return res.status(404).json("This device doesn't exist!");
        }
        
      default:
        break;
    }
  } else {
    return res.status(404).json("This device doesn't exist!");
  }
});

router.put('/devices/:deviceId', function(req, res) {
  if (!req.params.deviceId) {
    return res.status(404).json('Device ID is required!');
  }
  
  let result = cloudLib.updateDevice(req.params.deviceId, req.body);
  if (result) {
    return res.status(200).json("This device has been changed!");
  } else {
    return res.status(400).json("Failed to update the device!");
  }
})

router.post('/devices/:deviceId/portstate/:portId', function(req, res) {
  if (!req.params.deviceId) {
    return res.status(404).json('Device ID is required');
  }
  
  if (!req.params.portId) {
    return res.status(404).json('Port ID is required');
  }
  
  if(cloudLib.updatePort(req.params.deviceId, req.params.portId, req.body)) {
    return res.status(200).json('Success to update port!');
  } else {
    return res.status(400).json('Failed to update port!');
  }
});

router.post('/devices/:deviceId/storm', function(req, res) {
  if (!req.params.deviceId) {
    return res.status(404).json('Device ID is required');
  }
  
  if(cloudLib.updateStorm(req.params.deviceId, req.body)) {
    return res.status(200).json('Success to update storm!');
  } else {
    return res.status(400).json('Failed to update storm!');
  }
});

router.get('/links', function (req, res) {
  if(cloudModel.droppedDevices.includes(req.query.device)) {
    return res.status(404).json("This device doesn't exist!");
  }
  
  if(req.query.device){
    let result = _.filter(cloudModel.links, (link) => {
      return link.src.device == req.query.device || link.dst.device == req.query.device
    });

    if(result) {
      return res.json({links: result});
    } else {
      return res.status(404).json("This device doesn't exist!");
    }
  } else {
    let result = _.filter(cloudModel.links, (link) => {
      return !cloudModel.droppedDevices.includes(link.src.device) && !cloudModel.droppedDevices.includes(link.dst.device);
    })
    return res.json({links: result});
  }
});

function validateDeviceRequest(params) {
  if(config.deviceTypes.indexOf(params.type) != -1
      && params.managementAddress
      && params.mac
      && params.port
      && config.deviceProtocols.indexOf(params.protocol) != -1) {
    
    return true;
  }
  
  return false;
}

function formatDevice(device) {
  let tmpDevice = _.cloneDeep(device);
  delete tmpDevice.ports;
  delete tmpDevice.storm;
  delete tmpDevice.statistic;
  delete tmpDevice.leaf_group;

  delete tmpDevice.name
  // TODO:change device type
  if(config.TEST_MODE) {
    tmpDevice.type = 'SWITCH';
  }
  
  return tmpDevice;
}

function formatPorts (ports) {
  let tmpPorts =  _.cloneDeep(ports).map((port) => {
    delete port.statistic;
  
    return port;
  });
  
  return tmpPorts;
}

module.exports = router;