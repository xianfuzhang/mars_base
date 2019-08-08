const express = require('express'),
      router = express.Router(),
      cloudLib = require('../lib/cloud'),
      config = require('../config'),
      _ = require('lodash');

router.get('/', function (req, res) {
  return res.json({flows: cloudModel.flows});
});

router.post('/', function(req, res) {
  if (!req.query.appId) {
    return res.status(404).json('AppId is required!');
  }
  
  if(!Array.isArray(req.body.flows)) {
    return res.status(404).json('Paramater error,please check first!');
  }
  
  req.body.flows.forEach((flow) => {
    cloudLib.addFlow(req.query.appId, flow);
  });
  
  return res.status(200).json('Success to add new flows!');
});

router.get('/:deviceId', function (req, res) {
  if (!req.params.deviceId) {
    return res.status(404).json('Device ID is required');
  }
  
  let flows = cloudModel.flows.filter((flow) => {
    return flow.deviceId === req.params.deviceId;
  });
  
  return res.status(200).json({flows: flows});
});

router.post('/:deviceId', function (req, res) {
  if (!req.params.deviceId) {
    return res.status(404).json('Device ID is required');
  }
  
  if (!req.query.appId) {
    return res.status(404).json('App id is required');
  }
  
  if (!req.body) {
    return res.status(404).json('Paramater stream is required');
  }
  
  cloudLib.addFlow(req.query.appId, req.body);
  return res.status(200).json("This flow has been added!");
  
});

// router.get('/:deviceId/:flowId', function (req, res) {
//   let devices = [];
//
//   if (!req.params.deviceId) {
//     return res.status(404).json('Device ID is required');
//   }
//
//   if (!req.params.flowId) {
//     return res.status(404).json('Flow ID is required');
//   }
//
//   // TODO:
// });

router.delete('/:deviceId/:flowId', function(req, res) {
  if (!req.params.deviceId) {
    return res.status(404).json('Device ID is required!');
  }
  
  if (!req.params.flowId) {
    return res.status(404).json('Flow ID is required!');
  }
  
  let index = cloudModel.flows.findIndex((flow) => {
    return flow.id === req.params.flowId && flow.deviceId === req.params.deviceId;
  })
  
  if (index != -1) {
    cloudModel.flows.splice(index, 1);
    return res.status(200).json("This flow has been deleted!");
  } else {
    return res.status(404).json("This flow does not exist!");
  }
});

module.exports = router;