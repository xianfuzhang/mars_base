class Intent {
  constructor (id, type, appId, resources, priority, state) {
    this.id = id;
    this.type = type;
    this.appId = appId;
    
    this.priority = priority;
    this.state = state;
    if (this.type === 'PointToPointIntent') {
      this.ingressPoint = resources[0];
      this.egressPoint = resources[1];
    }
    else {
      this.resources = resources;
    }
  }
}
module.exports = Intent;