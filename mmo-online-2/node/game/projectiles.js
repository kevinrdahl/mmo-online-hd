var jsface = require("jsface"),
    Class  = jsface.Class,
    extend = jsface.extend;

var MMOOUtil = require('./mmoo-util');

var Projectiles = {};
module.exports = Projectiles;

Projectiles.Projectile = Class({
	$static: {
        idPool: new MMOOUtil.IdPool()
    },

	constructor: function(id, position, destination, speed, graphic) {
		this.id = id;
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
	},

	toJSON: function() {
		return {
			id: this.id,
			position: this.position,
			destination: this.destination,
			speed: this.speed,
			graphic: this.graphic
		}
	}
});