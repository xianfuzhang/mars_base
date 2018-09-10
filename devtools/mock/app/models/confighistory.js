
class  ConfigHistory {
  constructor (time, type, subject, history_class, config) {
    this.time = time;
    this.type = type;
    this.subject = subject;
    this.class = history_class;
    this.config = config;
  }
}

module.exports = ConfigHistory;