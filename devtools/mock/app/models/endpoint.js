var _ = require('lodash'),
  Chance = require('chance'),
  config = require('../config'),
  PhysicalPort = require('./physicalport');

const chance = new Chance();

class Endpoint {
  constructor (id, mac, tenant, vlan, ip_addresses, locations) {
    this.id = id;
    this.mac = mac;
    this.tenant = tenant;
    this.vlan = vlan;
    this.ip_addresses = ip_addresses;
    if(locations) {
      this.locations = locations;
    } else {
      this.locations = this.createLocations();
    }
  }
  
  createLocations () {
    let locations = [];
    let ports = [];
    cloudModel.devices.forEach((device) => {
      ports = ports.concat(device.ports);
    })
    
    let chancePorts = chance.pick(ports, chance.natural({min:1, max:3}));
    if(chancePorts instanceof PhysicalPort) {
      locations.push({
        device_id: chancePorts.element,
        port: chancePorts.port
      });
    } else {
      chancePorts.forEach((port) => {
        locations.push({
          device_id: port.element,
          port: port.port
        });
      });
    }

    return locations;
  }
}

module.exports = Endpoint;