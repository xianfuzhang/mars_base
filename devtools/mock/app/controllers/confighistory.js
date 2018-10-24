const express = require('express'),
  router = express.Router(),
  config = require('../config'),
  {AlertRule} = require('../models/alert'),
  moment = require('moment'),
  Chance = require('chance'),
  chance = new Chance(),
  path = require('path'),
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
  return res.status(200).json({configs: configs, count: configs.length});
});

router.get('/files', function (req, res) {
  let filesNum = chance.natural({min: 0, max: 15});
  let files = [];
  
  _.times(filesNum, () => {
    files.push(`file_${chance.word()}.log`)
  })
  
  return res.json({files});
});

router.get('/files/:filename', function (req, res) {
  if(!req.params.filename) {
    return res.status(400).json('Please specify the filename!');
  }
  
  let filepath = path.resolve(__dirname,'../assets/configuration.json');
  res.download(filepath, req.params.filename);
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