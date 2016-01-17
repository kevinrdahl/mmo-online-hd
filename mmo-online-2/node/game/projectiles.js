var jsface = require("jsface"),
    Class  = jsface.Class,
    extend = jsface.extend;

var Projectiles = {};
module.exports = Projectiles;

Projectiles.Projectile = Class({
	constructor: function(position, destination, speed, graphic) {
		this.position = position;
		this.destination = destination;
		this.speed = speed;
		this.graphic = graphic;
		
		this.hit = false;
	},

	update: function() {
		if (this.position.distanceTo(this.destination) <= this.speed) {
			this.position.set(this.destination);
			this.hit = true;
		} else {
			this.position.offsetTo(this.destination, this.speed);
		}
	}
});