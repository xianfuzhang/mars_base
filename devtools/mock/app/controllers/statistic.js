const express = require('express'),
  router = express.Router(),
  _ = require('lodash');

router.get('/ports', function (req, res) {
  let statistics = cloudModel.devices.map((device, index) => {
    let ports = device.ports.map(port => {
      return formatPortStatistic(port);
    });
    
    return {
      device: device.id,
      ports: ports
    };
  });
  
  return res.json({statistics});
});

router.get('/ports/:deviceId', function (req, res) {
  let devices = [];
  
  if (!req.params.deviceId) {
    return res.status(404).json('Device ID is required');
  }
  
  // search using the instanceId in the instances array for each project
  let searchDevice = _.cloneDeep(cloudModel.devices).find(device => device.id === req.params.deviceId);
  
  let statistics = [];
  if (searchDevice !== undefined) {
    statistics = searchDevice.ports.map((port) => {
      return formatPortStatistic(port)
    });
    
    return res.json({statistics: [{
      device: searchDevice.id,
      ports: statistics
    }]});
  } else {
    return res.status(404).json("This device doesn't exist!");
  }
});

router.get('/ports/:deviceId/:port', function (req, res) {
  let devices = [];
  
  if (!req.params.deviceId) {
    return res.status(404).json('Device ID is required');
  }
  
  if (!req.params.port) {
    return res.status(404).json('Port ID is required');
  }
  
  // search using the instanceId in the instances array for each project
  let searchDevice = _.cloneDeep(cloudModel.devices).find(device => device.id === req.params.deviceId);
  
  let statistics = [];
  if (searchDevice !== undefined) {
    let searchPort = searchDevice.ports.find(port => port.port === req.params.port);
    
    if(searchPort) {
      return res.json(formatPortStatistic(searchPort));
    } else {
      return res.status(404).json("This port doesn't exist!");
    }
  } else {
    return res.status(404).json("This device doesn't exist!");
  }
});

router.get('/system/devices', function (req, res) {
  let statistics = [];
  
  cloudModel.devices.forEach((device) => {
    statistics.push(device.statistic);
  })
  return res.json({statistics: statistics});
});

router.get('/system/device/:deviceId', function (req, res) {
  let devices = [];
  
  if (!req.params.deviceId) {
    return res.status(404).json('Device ID is required');
  }
  
  // search using the instanceId in the instances array for each project
  let searchDevice = cloudModel.devices.find(device => device.id === req.params.deviceId);
  
  let statistics = [];
  if (searchDevice !== undefined) {
    return res.json(searchDevice.statistic);
  } else {
    return res.status(404).json("This device doesn't exist!");
  }
});

function formatPortStatistic(port) {
  return {
    port: port.port,
    ...port.statistic
  }
}

module.exports = router;