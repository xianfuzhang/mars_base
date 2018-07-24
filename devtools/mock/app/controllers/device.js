const express = require('express'),
      router = express.Router(),
      cloudLib = require('../lib/cloud'),
      config = require('../config'),
      _ = require('lodash');

router.get('/devices', function (req, res) {
  let devices = [];
  
  devices = _.cloneDeep(cloudModel.devices).map((device, index) => {
    delete device.ports;
    delete device.storm;

    return device;
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
  
    return res.json({ports: ports});
  }
  
  devices = _.cloneDeep(cloudModel.devices);
  
  // search using the instanceId in the instances array for each project
  let searchDevice = devices.find(device => device.id === req.params.deviceId);

  if (searchDevice !== undefined) {
    delete searchDevice.ports;
    delete searchDevice.storm;
  
    return res.json(searchDevice);
  } else {
    return res.status(404).json("This device doesn't exist!");
  }
});

router.get('/devices/:deviceId/:type', function (req, res) {
  if (!req.params.deviceId) {
    return res.status(404).json('Device ID is required');
  }
  
  let devices = _.cloneDeep(cloudModel.devices);
  
  // search using the instanceId in the instances array for each project
  let searchDevice = devices.find(device => device.id === req.params.deviceId);
  
  if (searchDevice !== undefined) {
    switch(req.params.type) {
      case 'ports':
        return res.json(searchDevice.ports);
        
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
    return res.status(200).json("This device has been deleted!");
  } else {
    return res.status(400).json("Failed to delete the device!");
  }
})

router.post('/devices/:deviceId/poststate/:portId', function(req, res) {
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

module.exports = router;