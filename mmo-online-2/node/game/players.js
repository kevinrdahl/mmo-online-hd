var jsface = require("jsface"),
    Class  = jsface.Class,
    extend = jsface.extend;

var Players = {};
module.exports = Players;

Players.Player = Class({
	constructor: function(id) {
		this.id = id;
		this.lastMessageStep = -1000;
	}
});