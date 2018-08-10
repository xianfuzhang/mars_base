var _ = require('lodash'),
  PhysicalPort = require('./physicalport'),
  Chance = require('chance'),
  _physicalPorts = new WeakMap(),
  config = require('../config');

const chance = new Chance();

class Device {
  constructor (id, type, available, role, mac, rack_id, sw, hw, serial, mfr, chassisId, driver, portMinNum, leaf_group, community, name, ip, port, protocol) {
    this.id = id;
    this.type = type;
    this.available = available;
    this.role = role;
    this.mac = mac;
    this.rack_id = rack_id;
    this.sw = sw;
    this.hw = hw;
    this.serial = serial;
    this.mfr = mfr;
    this.chassisId = chassisId;
    this.driver = driver;
    this.community = community;
    this.leaf_group = leaf_group;
    this.lastUpdate = (new Date()).getMilliseconds();
    this.humanReadableLastUpdate = "connected 4m52s ago";
    this.annotations = this.createAnnotations(name, ip, port, protocol);
    this.ports = this.createPhysicalPorts(id, portMinNum + 8);
    this.storm = this.createStorm();
    this.uptime = chance.natural({min: 60 * 5, max: 60 * 60 * 24 * 2});
    this.statistic = this.createSystemStatistic();
  }

  createAnnotations (name, ip, port, protocol) {
    let annotations = {
      name: name,
      channelId: ip + ':' + port,
      protocol: protocol,
      managementAddress: ip
    };

    return annotations;
  }

  createPhysicalPorts (deviceId, count) {
    let physicalPorts = [];
    _.times(count, function (index) {
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
}


module.exports = Device;