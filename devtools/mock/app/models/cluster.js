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
    
    let user_proc = chance.floating({min:10.0, max: 40.0, fixed:1});
    let system = chance.floating({min:10.0, max: 40.0, fixed:1});
    let wait = chance.floating({min:0, max: 10.0, fixed:1});
    
    let mem_total = 1012 * 1024 * chance.integer({min: 12, max: 16});
    let mem_buffered = chance.natural({min: 1024*100, max: 1024*1024});
    let mem_used = chance.natural({min: 1024*1024, max: 1024*1024*8});
    let mem_cached = chance.natural({min: 1024*1000, max: 1024*1024*2});
    let mem_slab_recl = chance.natural({min: 1024 * 100, max: 1024*600});
    let mem_slab_unrecl = chance.natural({min: 1024 * 100, max: 1024*600});
    let mem_free = mem_total - mem_buffered - mem_used - mem_cached - mem_slab_recl - mem_slab_unrecl;
    
    let disk_total = 1012 * 1024 * chance.integer({min: 400, max: 600});
    let disk_used = chance.natural({min: 1024*1024*100, max: 1024*1024*300});
    let disk_reserved = chance.natural({min: 1024*1024*10, max: 1024*1024*100});
    let disk_free = disk_total - disk_used - disk_reserved;
    
    return {
      cpu_info: {
        wait: wait,
        user: user_proc,
        system: system,
        idle: (100.0 - user_proc - system - wait).toFixed(1),
        nice: 0,
        interrupt: 0,
        softirq: 0,
        steal: 0
      },
      memory_info: {
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
      },
      disk_info: {
        free: disk_free,
        free_percent: disk_free / disk_total,
        used: disk_used,
        used_percent: disk_used / disk_total,
        reserved: disk_reserved,
        reserved_percent: disk_reserved / disk_total
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