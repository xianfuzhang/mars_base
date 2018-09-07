var _ = require('lodash'),
  Chance = require('chance'),
  config = require('../config');

const chance = new Chance();

class ConfigHistory {
  constructor (time, type, subject, history_class, config) {
    this.time = time;
    this.type = type;
    this.subject = subject;
    this.class = history_class;
    this.config = config;
  }
}

exports.ConfigHistory = ConfigHistory;