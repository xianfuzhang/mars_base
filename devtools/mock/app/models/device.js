var _ = require('lodash'),
  PhysicalPort = require('./physicalport'),
  Chance = require('chance'),
  _physicalPorts = new WeakMap(),
  config = require('../config');

const chance = new Chance();

class Device {
  constructor (id, type, available, role, mac, rack_id, sw, hw, serial, mfr, chassId) {
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
    this.chanssId = chassId;
    this.annotations = this.createAnnotations();
    this.ports = this.createPhysicalPorts(id, chance.natural({min:6, max:8}));
    this.storm = this.createStorm();
  }

  createAnnotations () {
    let annotations = {
      ipaddress: chance.ip(),
      protocol: chance.pickone(config.deviceProtocols),
      driver: chance.natural({min:1, max:100}),
      name: chance.word()
    };

    return annotations;
  }

  createPhysicalPorts (deviceId, count) {
    let physicalPorts = [];
    _.times(count, function (index) {
      let port = index;
      if (port === 0) {
        port = 'local';
      }
      
      let annotations = {
        linkStatus: chance.pickone(['Down', 'Up']),
        interfaceType: chance.word(),
        portName: chance.word(),
        portMac: chance.mac_address()
      };
      
      let physicalPort = new PhysicalPort(deviceId, port, chance.bool({ likelihood: 30 }), chance.word(), chance.natural({max: 1000}), annotations);
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
}

module.exports = Device;