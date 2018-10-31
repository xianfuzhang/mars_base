const express = require('express'),
  router = express.Router(),
  config = require('../config'),
  FlowGroup = require('../models/flowgroup'),
  _ = require('lodash');

router.get('/', function (req, res) {
  return res.json({groups: cloudModel.flowgroups});
});

router.get('/:deviceId', function (req, res) {
  let groups = cloudModel.flowgroups.filter((group) => {
    return group.deviceId === req.params.deviceId;
  });
  
  if(groups.length) {
    return res.json({groups});
  } else {
    return res.status(404).json("No data exists!");
  }
  
});

router.get('/:deviceId/:appCookie', function (req, res) {
  let groups = cloudModel.flowgroups.filter((group) => {
    return group.deviceId === req.params.deviceId && group.appCookie === req.params.appCookie;
  });
  
  if(groups.length) {
    return res.json({groups});
  } else {
    return res.status(404).json("No data exists!");
  }
});

router.post('/:deviceId', function (req, res) {
  let group = new FlowGroup(
    req.body.groupId,
    req.params.deviceId,
    req.body.type,
    req.body.buckets,
    'ADDED',
    10568,
    0,
    0,
    0,
    "org.onosproject.rest",
    req.body.groupId
  );
  
  cloudModel.flowgroups.push(group);
  
  return res.status(200).json("This group has been added!");
});

router.delete('/:deviceId/:appCookie/', function (req, res) {
  let index = cloudModel.flowgroups.findIndex((group) => {
    return group.deviceId === req.params.deviceId && group.appCookie === req.params.appCookie;
  });
  
  if(ruleIndex !== -1) {
    cloudModel.flowgroups.splice(index,1);
    return res.status(200).json("This group has been deleted!");
  } else {
    return res.status(404).json("No data exists!");
  }
});


// function formatGroups(flowgroups) {
//   let groups = _.cloneDeep(flowgroups)
// }
module.exports = router;