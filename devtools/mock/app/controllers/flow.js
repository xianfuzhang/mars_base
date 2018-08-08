const express = require('express'),
      router = express.Router(),
      cloudLib = require('../lib/cloud'),
      config = require('../config'),
      _ = require('lodash');

router.get('/', function (req, res) {
  let devices = [];
  
  // devices = _.cloneDeep(cloudModel.flows).map((device, index) => {
  //   return formatDevice(device);
  // });
  
  return res.json({flows: cloudModel.flows});
});

router.post('/', function(req, res) {
  if (!req.params.appId) {
    return res.status(404).json('AppId is required!');
  }
  
  if(cloudLib.addFlow(req.body)) {
    return res.status(200).json('Success to add new flow!');
  } else {
    return res.status(400).json('Failed to add new flow!');
  }
});

router.get('/:deviceId/:flowId', function (req, res) {
  let devices = [];
  
  if (!req.params.deviceId) {
    return res.status(404).json('Device ID is required');
  }
  
  if (!req.params.flowId) {
    return res.status(404).json('Flow ID is required');
  }
  
  // TODO:
});

router.delete('/:deviceId/:flowId', function(req, res) {
  if (!req.params.deviceId) {
    return res.status(404).json('Device ID is required!');
  }
  
  if (!req.params.flowId) {
    return res.status(404).json('Flow ID is required!');
  }
  
  // TODO:
  let result = cloudLib.deleteDevice(req.params.deviceId);
  
  if (result) {
    return res.status(200).json("This device has been deleted!");
  } else {
    return res.status(400).json("Failed to delete the device!");
  }
});

module.exports = router;