var _ = require('lodash'),
  Chance = require('chance'),
  config = require('../config');

const chance = new Chance();

class AlertRule {
  constructor (rule_name, status, alert_level, receive_group, query, from, type) {
    this.name = rule_name;
    this.status = status;
    this.alert_level = alert_level;
    this.receive_group = receive_group;
    this.query = query;
    this.from = from;
    this.type = type;
  }
}

exports.AlertRule = AlertRule;


class Alert {
  constructor (uuid, rule_name, alert_level, receive_group, from, msg) {
    this.uuid = uuid;
    this.name = rule_name;
    this.alert_level = alert_level;
    this.receive_group = receive_group;
    this.from = from;
    this.msg = msg;
  }
}

exports.Alert = Alert;