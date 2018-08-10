var _ = require('lodash'),
  Chance = require('chance'),
  config = require('../config');

const chance = new Chance();

class Alert {
  constructor (uuid, name, alert_level, from, msg, receive_group) {
    this.uuid = uuid;
    this.name = name;
    this.alert_level = alert_level;
    this.from = from;
    this.msg = msg;
    this.receive_group = receive_group;
  }
}


module.exports = Alert;