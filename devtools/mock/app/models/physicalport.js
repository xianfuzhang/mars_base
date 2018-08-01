const _ =  require('lodash');

class PhysicalPort {
  constructor (id, port, isEnabled, type, portSpeed, annotations) {
    this.element = id;
    this.port = port;
    this.isEnabled = isEnabled;
    this.type = type;
    this.portSpeed = portSpeed;
    this.annotations = annotations;
    this.statistic = this._createStatistic(isEnabled);
  }
  
  _createStatistic(isEnabled) {
    if(isEnabled) {
      return {
        packetsReceived: _.random(1, 100),
        packetsSent: _.random(1, 100),
        bytesReceived: _.random(10000, 100000),
        bytesSent: _.random(10000, 100000),
        packetsRxDropped: _.random(0, 10),
        packetsTxDropped: _.random(0, 10),
        packetsRxErrors: _.random(0, 10),
        packetsTxErrors: _.random(0, 10),
        durationSec: _.random(100, 10000),
      }
    } else {
      return {
        packetsReceived: 0,
        packetsSent: 0,
        bytesReceived: 0,
        bytesSent: 0,
        packetsRxDropped: 0,
        packetsTxDropped: 0,
        packetsRxErrors: 0,
        packetsTxErrors: 0,
        durationSec: 0,
      }
    }
  }
}

module.exports = PhysicalPort;
