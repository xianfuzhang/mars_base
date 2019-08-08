var _ = require('lodash'),
  Chance = require('chance'),
  config = require('../config');

const chance = new Chance();

class Link {
  constructor (srcPort, srcDevice, dstPort, dstDevice, type, state) {
    this.src = {
      port: srcPort,
      device: srcDevice
    };
    
    this.dst = {
      port: dstPort,
      device: dstDevice
    };
    
    this.type = type;
    this.state = state;
    
    this.annotations = this.createAnnotations();
  }
  
  createAnnotations () {
    let annotations = {
      durable: chance.word(),
      protocol: chance.pickone(config.linkProtocols),
      latency: chance.word()
    };

    return annotations;
  }
}

module.exports = Link;