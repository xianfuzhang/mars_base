var _ = require('lodash'),
  Chance = require('chance'),
  config = require('../config');

const chance = new Chance();

class Flow {
  constructor (id, tableId, appId, groupId, priority, timeout, isPermanent, deviceId, state, life, packets, bytes, liveType, lastSeen) {
    this.id = id;
    this.tableId = tableId;
    this.appId = appId;
    this.groupId = groupId;
    this.priority = priority;
    this.timeout = timeout;
    this.isPermanent = isPermanent;
    this.deviceId = deviceId;
    this.state = state;
    this.life = life;
    this.packets = packets;
    this.bytes = bytes;
    this.liveType = liveType;
    this.lastSeen = lastSeen;
    this.treatment = this.createTreatment();
    this.selector = this.createSelector();
  }

  createTreatment () {
    return {
      instructions: [
        {
          "type": "OUTPUT",
          "port": "CONTROLLER"
        }
      ],
      clearDeferred: true,
      deferred: []
    }
  }

  createSelector (){
    return {
      criteria: [
        {
          type: "ETH_TYPE",
          ethType: "0x88cc"
        }
      ]
    }
  }
}


module.exports = Flow;