const express = require('express'),
      router = express.Router(),
      cloudLib = require('../lib/cloud'),
      config = require('../config'),
      Chance = require('chance'),
      _ = require('lodash');

router.get('/devices', function (req, res) {
  let devices = [];
  let chance = new Chance();
  let num = chance.pickone([0,1,2]);
  // slice length-num devices
  let tmpDevices = cloudModel.devices.slice(0, cloudModel.devices.length - num);
  
  devices = _.cloneDeep(tmpDevices).map((device, index) => {
    return formatDevice(device);
  });
  
  return res.json({devices: devices});
});

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
      ports = ports.concat(device.ports);
    });
  
    return res.json({ports: formatPorts(ports)});
  }
  
  if(req.params.deviceId == 'config') {
    let configs = [];
  
    configs = _.cloneDeep(cloudModel.devices).map((device, index) => {
      let config = {
        id: device.id,
        name: device.annotations.name,
        type: device.type,
        available: device.available,
        mgmtIpAddress: device.annotations.managementAddress,
        mac: device.mac,
        mrf: device.mrf,
        port: 0,
        protocal: device.annotations.protocal,
        rack_id: device.rack_id,
        community: null,
        leafGroup: {
          name: null,
          switch_port: 0
        }
      };
    
      return config;
    });
  
    return res.json({configs: configs});
  }
  
  devices = _.cloneDeep(cloudModel.devices);
  
  // search using the instanceId in the instances array for each project
  let searchDevice = devices.find(device => device.id === req.params.deviceId);

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
        port: 0,
        protocal: device.annotations.protocal,
        rack_id: device.rack_id,
        community: null,
        leafGroup: {
          name: null,
          switch_port: 0
        }
      };
    
      return res.json(config);
    } else {
      return res.status(404).json("This device doesn't exist!");
    }
  }
  
  let devices = _.cloneDeep(cloudModel.devices);
  
  // search using the instanceId in the instances array for each project
  let searchDevice = devices.find(device => device.id === req.params.deviceId);
  
  if (searchDevice !== undefined) {
    switch(req.params.type) {
      case 'ports':
        return res.json(formatPorts(searchDevice.ports));
        
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
    return res.status(400).json("Failed to delete the device!");
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
  return res.json({links: cloudModel.links});
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