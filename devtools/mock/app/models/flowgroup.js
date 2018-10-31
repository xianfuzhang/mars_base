const _ = require('lodash'),
  Chance = require('chance'),
  config = require('../config');

const chance = new Chance();

class FlowGroup {
  constructor (id, device_id, type, buckets, state, life, packets, bytes, referenceCount, appId, givenGroupId) {
    this.id = id;
    this.appCookie = id;
    this.deviceId = device_id;
    this.type = type;
    this.buckets = buckets;
    this.state = state;
    this.life = life;
    this.packets = packets;
    this.bytes = bytes;
    this.referenceCount = referenceCount;
    this.appId = appId;
    this.givenGroupId = givenGroupId;
  }
  
  _createBucket() {
    // TODO:
  }
}


module.exports = FlowGroup;