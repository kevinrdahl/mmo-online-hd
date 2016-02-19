/*
	Each frame descriptor should have a number of properties, one of which
	describes a list of parts to place on the sprite

	//Should also list attachment points, for items/effects
*/
var AnimationFrame = Class({
	$static: {
		PartInfo: Class({
			constructor: function(image, x, y, rotation) {
				this.image = image;
				this.x = x;
				this.y = y;
				this.rotation = (typeof rotation !== 'undefined') ? rotation : 0;
			}
		})
	},

	constructor: function(obj) {
		this.parts = [];
		this.duration = 100;
		this.sound = null;

		if (typeof obj !== 'undefined')
			this.parse(obj);
	},

	parse: function(obj) {
		for (var i = 0; i < obj.parts.length; i++) {
			this.parts.push(this.parsePart(obj.parts[i]))
		}

		this.duration = obj.duration;
		if (typeof obj.sound !== 'undefined')
			this.sound = obj.sound;
	},

	parsePart: function(obj) {
		return new AnimationFrame.PartInfo(obj.image, obj.x, obj.y, obj.rotation);
	}
});