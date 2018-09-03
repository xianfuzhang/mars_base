const express = require('express'),
  router = express.Router(),
  config = require('../config'),
  {AlertRule} = require('../models/alert'),
  _ = require('lodash');

router.get('/history/list', function (req, res) {
  
  return res.json({history: cloudModel.alert.history});
});

router.delete('/history/uuid/:id', function (req, res) {
  
  let ruleIndex = cloudModel.alert.history.findIndex((alert) => {
    return alert.uuid === req.params.id;
  });
  
  if(ruleIndex !== -1) {
    cloudModel.alert.history.splice(ruleIndex, 1);
    return res.status(200).json("This alert has been deleted!");
  } else {
    return res.status(404).json("No data exists!");
  }
});

router.post('/history/select', function (req, res) {
  let uuids = req.body.uuid;
  
  if(_.isArray(uuids)) {
    cloudModel.alert.history.forEach((alert) => {
      let index = uuids.indexOf(alert.uuid);
      if(index !== -1)
        cloudModel.alert.history.splice(index, 1);
    });
  
    return res.status(200).json("This history has existed!");
  } else {
    return res.status(400).json("Uuids array is required!");
  }
});

router.delete('/history/all', function (req, res) {
  cloudModel.alert.history = [];
  
  return res.status(200).json('All alerts had been deleted!');
});

router.get('/group/receiver', function (req, res) {
  return res.status(200).json({groups: cloudModel.alert.groups});
});

router.get('/group/receiver/:groupName', function (req, res) {
  let index = cloudModel.alert.groups.findIndex((group) => {
    return group.name === req.params.groupName;
  });
  
  if(index === -1) {
    return res.status(404).json("This group doesn't exist!");
  }
  
  return res.status(200).json({data: cloudModel.alert.groups[index]});
});

router.post('/group/receiver', function (req, res) {
  if(!req.body.name || !req.body.receive) {
    return res.status(400).json("Valid params are required!");
  }
  
  let group = _.find(cloudModel.alert.groups, (group) => {
    return group.name === req.body.name;
  });
  
  if(group) {
    return res.status(400).json("This group has existed!");
  }
  
  group = {
    name: req.body.name,
    receive: req.body.receive
  }
  
  cloudModel.alert.groups.push(group);
  return res.status(200).json('Alert group has been added!');
});

router.delete('/group/receiver/:groupName', function (req, res) {
  let index = cloudModel.alert.groups.findIndex((group) => {
    return group.name === req.params.groupName;
  });
  
  if(index === -1) {
    return res.status(400).json("This group doesn't exist!");
  }
  
  cloudModel.alert.groups.splice(index, 1);
  return res.status(200).json('This group has been deleted!');
});


router.post('/basicconfig', function(req, res) {
  if(!req.body.wechat && !req.body.smtp && !req.body.sms) {
    return res.status(400).json("The paramater is invalid!");
  }
  
  let config = {};
  if(req.body.wechat)
    config.wechat = req.body.wechat;
  
  if(req.body.smtp)
    config.smtp = req.body.smtp;
  
  if(req.body.sms)
    config.sms = req.body.sms;
  
  cloudModel.alert.basicconfig = config;
  
  return res.status(200).json('This config has been added!');
})

router.get('/basicconfig', function (req, res) {
  return res.status(200).json({data: cloudModel.alert.basicconfig});
});

router.delete('/basicconfig', function (req, res) {
  cloudModel.alert.basicconfig = {};
  
  return res.status(200).json('The alert basicconfig has been deleted!');
});

module.exports = router;