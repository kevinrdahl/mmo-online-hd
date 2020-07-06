var jsface = require("jsface"),
    Class  = jsface.Class,
    extend = jsface.extend;

var LinAlg = require('../../www/js/linalg');
var MMOOUtil = require('./mmoo-util');

var Projectiles = {};
module.exports = Projectiles;

Projectiles.Projectile = Class({
	$static: {
        idPool: new MMOOUtil.IdPool()
    },

	constructor: function(position, speed, graphic) {
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
		if (this.position.withinDistance(destination, this.speed)) {
			this.position.set(destination);
			this.hit = true;
		} else {
			this.position.offsetTo(destination, this.speed);
		}
	},

	messageParams: function() {
		return {};
	}
});

Projectiles.TargetProjectile = Class(Projectiles.Projectile, {
	constructor: function(position, speed, graphic, target) {
		this.target = target;
		Projectiles.TargetProjectile.$super.call(this, position, speed, graphic);
	},

	update: function() {
		if (this.target.exists) {
			this.stepTo(target.position);
		} else {
			this.disjointed = true;
		}
	},

	messageParams: function() {
		return {
			position: this.position,
			speed: this.speed,
			graphic: this.graphic,
			target: this.target.id
		};
	}
});

Projectiles.AttackProjectile = Class(Projectiles.TargetProjectile, {
	constructor: function(target, source) {
		Projectiles.AttackProjectile.$super.call(
			this, 
			source.position.copy(), 
			source.projectileSpeed,
			source.projecileGraphic,
			target
		);

		this.damage = source.attackDamage;
		this.damageType = 'physical';
		this.source = source;
	}
});

Projectiles.PointProjectile = Class(Projectiles.Projectile, {
	constructor: function(position, speed, graphic, point) {
		this.point = point;
		Projectiles.PointProjectile.$super.call(this, position, speed, graphic);
	},

	update: function() {
		this.stepTo(this.point);
	},

	messageParams: function() {
		return {
			position: this.position,
			speed: this.speed,
			graphic: this.graphic,
			point: this.point
		};
	}
});