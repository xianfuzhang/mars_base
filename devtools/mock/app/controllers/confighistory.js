const express = require('express'),
  router = express.Router(),
  config = require('../config'),
  {AlertRule} = require('../models/alert'),
  moment = require('moment'),
  _ = require('lodash');

router.get('/', function (req, res) {
  let configs;
  if(req.query.from && req.query.to) {
    let timeFrom = (new Date(req.query.from + ' 00:00:00')).getTime();
    let timeTo = (new Date(req.query.to + ' 23:59:59')).getTime();
    
    configs = _.filter(cloudModel.confighistory, (config) => {
      return config.time >= timeFrom && config.time <= timeTo
    });
  } else {
    configs = cloudModel.confighistory;
  }
  
  configs = formatConfig(configs);
  return res.status(200).json({configs: configs});
});

function formatConfig(configs) {
  let tmpConfigArr = _.cloneDeep(configs);
  
  tmpConfigArr.forEach((config) => {
    let time = moment(config.time).format();
    config.time = time;
  });
  
  return tmpConfigArr;
}

module.exports = router;