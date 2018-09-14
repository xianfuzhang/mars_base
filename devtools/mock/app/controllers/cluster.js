const express = require('express'),
  router = express.Router(),
  config = require('../config'),
  Cluster = require('../models/cluster'),
  _ = require('lodash');

router.get('/', function (req, res) {
  cloudModel.clusters.forEach((cluster) => {
    cluster.humanReadableLastUpdate = cluster._getHumanReadableLastUpdate();
  });
  
  let clusters = _.cloneDeep(cloudModel.clusters);
  clusters.forEach((cluster) => {
    delete cluster.statistic;
  })
  
  return res.json({nodes: clusters});
});

router.post('/configuration', function (req, res) {
  
  if(res.body.ip && res.body.tcpPort && res.body.status){
    let cluster = new Cluster(
      req.body.ip,
      req.body.tcpPort,
      req.body.status,
      Date.now()
    )
    
    cloudModel.clusters.push(cluster);
  }
  
  if(cloudModel.addDevice(req.body)) {
    return res.status(200).json('Success to add new device!');
  } else {
    return res.status(400).json('Failed to add new device!');
  }
  
  return res.json({clusters: cloudModel.clusters});
});


module.exports = router;