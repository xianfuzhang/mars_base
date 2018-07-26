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
      let port = index;
      if (port === 0) {
        port = 'local';
      }
      
      let annotations = {
        linkStatus: chance.pickone(['Down', 'Up', 'Up', 'Up']),
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