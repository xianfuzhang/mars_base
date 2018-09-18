const express = require('express'),
  router = express.Router(),
  Chance = require('chance'),
  chance = new Chance(),
  moment = require('moment'),
  config = require('../config');

router.get('/:type/:deviceId/:timeStart/:timeEnd/:seconds', function (req, res) {
  let startTime = moment(req.params.timeStart);
  let endTime = moment(req.params.timeEnd);
  let interval = parseInt(req.params.seconds);
  let pointNum = Math.floor((endTime.valueOf() - startTime.valueOf()) / interval / 1000);
  
  let responseArr = [];
  if(!pointNum || pointNum > 50 || pointNum <= 0) {
    return res.status(400).json('Failed due to the invalid time parameter');
  } else {
    
    let minute = startTime.utcOffset();
    startTime.add(minute, 'm');
    for(let i=0; i < pointNum; i++){
      let diff  = i == 0 ? 0 : interval;
      let curTime = startTime.add(diff, 's');
      let response;
      if(req.params.type.toLowerCase() == 'cpu') {
        let tmpTime =
        response = generateCpu(curTime.toISOString());
      } else if(req.params.type.toLowerCase() == 'memory'){
        response = generateMem(curTime.toISOString())
      } else {
        return res.status(400).json('Failed due to the invalid type parameter');
      }
      
      responseArr.push(response);
    }
  
    let result = {};
    if(req.params.type.toLowerCase() == 'cpu') {
      result = {cpu: responseArr}
    } else {
      result = {memory: responseArr}
    }
    return res.status(200).json(result);
  }
  
});

router.get('/portstats/:portno/:deviceId/:timeStart/:timeEnd/:seconds', function (req, res) {
  let startTime = moment(req.params.timeStart);
  let endTime = moment(req.params.timeEnd);
  let interval = parseInt(req.params.seconds);
  let pointNum = Math.floor((endTime.valueOf() - startTime.valueOf()) / interval / 1000);
  
  let responseArr = [];
  if(!pointNum || pointNum > 50 || pointNum <= 0) {
    return res.status(400).json('Failed due to the invalid time parameter');
  } else {
    
    let minute = startTime.utcOffset();
    startTime.add(minute, 'm');
    for(let i=0; i < pointNum; i++){
      let diff  = i == 0 ? 0 : interval;
      let curTime = startTime.add(diff, 's');
      let response = generatePort(curTime.toISOString());
      
      responseArr.push(response);
    }
    
    return res.status(200).json({portstats:responseArr});
  }
  
});

function generateCpu(timeString) {
  let system = chance.floating({min: 20.00, max: 50.00, fixed: 2});
  let idle = chance.floating({min: 30.00, max: 100 - 20 - system, fixed: 2});
  let user = chance.floating({min:10, max: 15, fixed: 2});
  let wait = chance.floating({min:0, max: 5, fixed: 2});
  let softirq = (100 - system - idle - user - wait).toFixed(2);
  return {
    timepoint: timeString,
    system_percent: system,
    steal_percent: 0,
    idle_percent: idle,
    wait_percent: wait,
    softirq_percent: softirq,
    user_percent: user,
    nice_percent: 0,
    interrupt_percent: 0
  }
}

function generateMem(timeString) {
  let mem_total = 1012 * 1024 * chance.integer({min: 12, max: 16});
  let mem_buffered = chance.natural({min: 1024*100, max: 1024*1024});
  let mem_used = chance.natural({min: 1024*1024, max: 1024*1024*8});
  let mem_cached = chance.natural({min: 1024*1000, max: 1024*1024*2});
  let mem_slab_recl = chance.natural({min: 1024 * 100, max: 1024*600});
  let mem_slab_unrecl = chance.natural({min: 1024 * 100, max: 1024*600});
  let mem_free = mem_total - mem_buffered - mem_used - mem_cached - mem_slab_recl - mem_slab_unrecl;
  
  return {
    timepoint: timeString,
    cached: mem_cached,
    slab_recl: mem_slab_recl,
    slab_unrecl_percent: mem_slab_unrecl / mem_total,
    used: mem_used,
    used_percent: mem_used / mem_total,
    free_percent: mem_free / mem_total,
    slab_recl_percent: mem_slab_recl / mem_total,
    buffered: mem_buffered,
    free: mem_free,
    buffered_percent: mem_buffered / mem_total,
    slab_unrecl: mem_slab_unrecl,
    cached_percent: mem_cached / mem_total
  }
}

function generatePort(timeString) {
  
  return {
    timepoint: timeString,
    packetsReceived: chance.natural({min: 100000, max: 10000000}),
    packetsSent: chance.natural({min: 100000, max: 10000000}),
    bytesReceived: chance.natural({min: 10000000, max: 1000000000}),
    bytesSent: chance.natural({min: 100000, max: 10000000}),
    packetsRxDropped: chance.natural({min: 10000, max: 1000000}),
    packetsTxDropped: chance.natural({min: 10000, max: 1000000}),
    packetsRxErrors: chance.natural({min: 1000, max: 10000}),
    packetsTxErrors: chance.natural({min: 1000, max: 10000}),
  }
}

module.exports = router;