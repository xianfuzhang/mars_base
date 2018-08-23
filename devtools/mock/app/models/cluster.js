var _ = require('lodash'),
  Chance = require('chance'),
  config = require('../config');

const chance = new Chance();

class Cluster {
  constructor (ip, tcpPort, status, lastUpdate) {
    this.id = ip;
    this.ip = ip;
    this.status = status;
    this.lastUpdate = lastUpdate;
    this.uptime = chance.natural({min: 60 * 5, max: 60 * 60 * 24 * 2});
    this.statistic = this._createStatistic();
    this.humanReadableLastUpdate = this._getHumanReadableLastUpdate();
  }
  
  _createStatistic() {
    let uptime = this.uptime;
    let day = Math.floor(uptime/(60*60*24));
    let hour = Math.floor(uptime % (60 * 60 * 24) / (3600));
    let minute = Math.floor(uptime % (60 * 60 * 24) % 3600 / 60);
    
    let user_proc = chance.floating({min:0.5, max: 30.0, fixed:1});
    let hardware_int = chance.floating({min:0.5, max: 30.0, fixed:1});
    let mem_total = 1012 * 1024 * 12;
    let mem_free = chance.natural({min: 1024*100, max: 1024*1024*4});
    let swap_total = 1012 * 1024 * 4;
    let swap_free = chance.natural({min: 1024*1024*2, max: 1024*1024*4});
    let disk_total = chance.floating({min: 8, max: 16, fixed: 1});
    let disk_used = chance.floating({min: 1.0, max: 7.9, fixed: 1});
    
    return {
      "global": {
        "uptime": `${day} day, ${hour}:${minute}`,
        "avg_last_min": chance.floating({min: 0.02, max: 1.0, fixed: 2}),
        "avg_5_min": chance.floating({min: 0.12, max: 3.0, fixed: 2}),
        "avg_15_min": chance.floating({min: 0.07, max: 5.0, fixed: 2})
      },
      "cpu_info": {
        "user_proc": user_proc,
        "sys_proc": 0.0,
        "idle": (100.0 - user_proc - hardware_int).toFixed(1),
        "wait_io": 0,
        "hardware_int": hardware_int,
        "software_int": 0
      },
      "memory_info": {
        "mem":
          {
            "total": `${mem_total}k`,
            "free": `${mem_free}k`,
            "used": `${mem_total - mem_free}k`,
            "buffers": `${chance.natural({min: 2000000, max: 8000000})}k`
          },
        "swap":
          {
            "total": `${swap_total}k`,
            "used": `${swap_total - swap_free}k`,
            "free": `${swap_free}k`,
            "cached": `${chance.natural({min: 200000, max: 1000000})}k`
          }
      },
      "disk_info": {
        "partition": [
          {
            "filesystem": "/dev/sda2",
            "size": `${disk_total}G`,
            "used": `${disk_used}G`,
            "Available": `${(disk_total - disk_used).toFixed(1)}G`,
          }
        ]
      }
    }
  }
  
  _getHumanReadableLastUpdate() {
    let now = Date.now();
    let diff = now - this.lastUpdate;
    
    let day = Math.floor(diff / (24 * 60 * 60 * 1000));
    let hour = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
  
    let readableLastUpdate = `${day}d ${hour}h ago`;
    
    return readableLastUpdate;
  }
}


module.exports = Cluster;