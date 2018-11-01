class Intent {
	constructor (id, type, appId, resources, priority, state) {
		this.id = id;
		this.type = type;
		this.appId = appId;
		this.resources = resources;
		this.priority = priority;
		this.state = state;
	}
}
module.exports = Intent;