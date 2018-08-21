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
    this.humanReadableLastUpdate = this.getHumanReadableLastUpdate();
  }
  
  getHumanReadableLastUpdate() {
    let now = Date.now();
    let diff = now - this.lastUpdate;
    
    let day = Math.floor(diff / (24 * 60 * 60 * 1000));
    let hour = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
  
    let readableLastUpdate = `${day}d ${hour}h ago`;
    
    return readableLastUpdate;
  }
}


module.exports = Cluster;