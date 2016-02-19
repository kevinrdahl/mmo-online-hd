/*
	Animation

	Simple data class, parses one animation (not a set)
	and provides access functions.
*/
var Animation = Class({
	constructor: function(obj) {
		//I don't think this even needs a name. AnimSet should keep these in a dict.
		this.frames = [];

		if (typeof obj !== 'undefined')
			this.parse(obj);
	},

	parse: function(obj) {
		for (var i = 0; i < obj.frames.length; i++) {
			this.frames.push(new AnimationFrame(obj.frames[i]));
		}
	}
});