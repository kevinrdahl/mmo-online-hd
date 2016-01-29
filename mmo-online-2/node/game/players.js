var jsface = require("jsface"),
    Class  = jsface.Class,
    extend = jsface.extend;

var Players = {};
module.exports = Players;

Players.Player = Class({
	$static: {
		STEP_UPDATE_INTERVAL:5
	},

	constructor: function(id, client) {
		this.id = id;
		this.client = client;
		this.lastMessageStep = -1000;
		this.unit = null;
	}
});