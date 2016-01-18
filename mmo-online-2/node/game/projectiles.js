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

	constructor: function(id, position, speed, graphic) {
		this.id = id;
		this.position = position;
		this.speed = speed;
		this.graphic = graphic;
		
		this.hit = false;
		this.disjointed = false;
	},

	update: function() {
		//Vanilla projectile shouldn't exist!
		this.disjointed = true;
	},

	stepTo: function(destination) {
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

Projectiles.TargetProjectile = Class(Projectiles.Projectile, {
	constructor: function(id, position, speed, graphic, target) {
		this.target = target;
		Projectiles.TargetProjectile.$super.call(this, id, position, speed, graphic);
	},

	update: function() {
		if (this.target.exists) {
			this.stepTo(target.position);
		} else {
			this.disjointed = true;
		}
	}
});

Projectiles.PointProjectile = Class(Projectiles.Projectile, {
	constructor: function(id, position, speed, graphic, point) {
		this.point = point;
		Projectiles.PointProjectile.$super.call(this, id, position, speed, graphic);
	},

	update: function() {
		this.stepTo(this.point);
	}
});