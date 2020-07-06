var jsface = require("jsface"),
    Class  = jsface.Class,
    extend = jsface.extend;

var Events = {};
module.exports = Events;

Events.EventManager = Class({
	constructor: function(game) {
		this.game = game;
	}
})