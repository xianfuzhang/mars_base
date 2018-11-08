var _ = require('lodash'),
  PhysicalPort = require('./physicalport'),
  Chance = require('chance'),
  _physicalPorts = new WeakMap(),
  config = require('../config');

const chance = new Chance();

class Device {
  constructor (id, type, available, role, mac, rack_id, sw, hw, serial, mfr, chassisId, driver, leaf_group, community, name, ip, port, protocol) {
    this.id = id;
    this.type = type;
    this.available = available;
    this.role = role;
    this.mac = mac;
    this.rackId = rack_id;
    this.sw = sw;
    this.hw = hw;
    this.serial = serial;
    this.mfr = mfr;
    this.chassisId = chassisId;
    this.driver = driver;
    this.community = community;
    this.leaf_group = leaf_group;
    this.lastUpdate = Date.now();
    this.humanReadableLastUpdate = "connected 4m52s ago";
    this.annotations = this.createAnnotations(name, ip, port, protocol);
    this.ports = this.createPhysicalPorts(id);
    this.storm = this.createStorm();
    this.uptime = chance.natural({min: 60 * 5, max: 60 * 60 * 24 * 2});
    this.statistic = this.createSystemStatistic();
  }

  createAnnotations (name, ip, port, protocol) {
    let annotations = {
      name: name,
      channelId: ip + ':' + port,
      protocol: protocol,
      managementAddress: ip,
      port: port
    };

    return annotations;
  }

  createPhysicalPorts (deviceId) {
    let physicalPorts = [];
    _.times(config.devicePortNum, function (index) {
      let port = `${index}`;
      if (port == '0') {
        port = 'local';
      }
      
      let annotations = {
        linkStatus: chance.pickone(['Down', 'Up', 'Up', 'Up']),
        interfaceType: chance.word(),
        portName: 'Port_' + chance.word(),
        portMac: chance.mac_address()
      };
      
      let physicalPort = new PhysicalPort(deviceId, port, chance.bool({ likelihood: 70 }), chance.word(), chance.natural({max: 1000}), annotations);
      physicalPorts.push(physicalPort);
    });

    return physicalPorts;
  };
  
  createStorm (){
    return {
      unicast: chance.natural({min: 500, max: 14880000}),
      bcast: chance.natural({min: 500, max: 14880000}),
      mcast: chance.natural({min: 500, max: 14880000})
    }
  }
  
  createSystemStatistic() {
    
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
}


module.exports = Device;