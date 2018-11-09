const express = require('express'),
  router = express.Router(),
  _ = require('lodash'),
  Chance = require('chance'),
  chance = new Chance(),
  moment = require('moment'),
  path = require('path');

router.get('/status', function (req, res) {
  let data = {
    indices:
      [
        {"name":"logstash", "size":"100MB"},
        {"name": "filebeat",  "size":"200MB"},
        {"name":"portstats", "size":"1GB"},
        {"name":"index1", "size":"1.5GB"},
        {"name":"index2", "size":"300MB"}
      ],
    nodes: ["mar1", "mars2"],
    snapshots:["snapshot1", "snapshot2"]
  }
  
  
  return res.json(data);
});

router.get('/controller/files', function (req, res) {
  let filesNum = chance.natural({min: 8, max: 15});
  let files = [];
  
  _.times(filesNum, () => {
    files.push(`file_${chance.word()}.log`)
  })
  
  return res.json({files});
});

router.get('/controller/files/:filename', function (req, res) {
  if(!req.params.filename) {
    return res.status(400).json('Please specify the filename!');
  }
  
  let filepath = path.resolve(__dirname,'../assets/configuration.json');
  res.download(filepath, req.params.filename);
});

function formatLog(logs){
  let tmpLogs = [];
  logs.forEach((log) => {
    log.created_time = moment(log.created_time).format('YYYY-MM-DD hh:mm:ss') + ',' + (new Date(log.created_time)).getMilliseconds();
  
    let tmpLogArr = [log.created_time, log.type, log.level, log.creator, log.operation, log.content];
    tmpLogs.push(tmpLogArr.join('|'));
  });
  
  return tmpLogs;
}


module.exports = router;