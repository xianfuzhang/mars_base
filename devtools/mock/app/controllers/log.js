const express = require('express'),
  router = express.Router(),
  _ = require('lodash'),
  Chance = require('chance'),
  chance = new Chance(),
  moment = require('moment'),
  path = require('path');

router.get('/controller', function (req, res) {
  let timeFrom = (new Date(req.query.from + ' 00:00:00')).getTime();
  let timeTo = (new Date(req.query.to + ' 23:59:59')).getTime();
  
  let logs = _.cloneDeep(cloudModel.logs);
  // let result = _.filter(logs, (log) => {
  //   return log.created_time >= timeFrom && log.created_time <= timeTo;
  // });
  
  return res.json({logs: formatLog(logs), count: logs.length});
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