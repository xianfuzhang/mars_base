var _ = require('lodash'),
  Chance = require('chance'),
  config = require('../config');

const chance = new Chance();

class Log {
  constructor (id, creator, operation, level, type, content, created_time) {
    this.id = id;
    this.creator = creator;
    this.operation = operation;
    this.level = level;
    this.type = type;
    this.content = content;
    this.created_time = created_time;
  }
}


module.exports = Log;