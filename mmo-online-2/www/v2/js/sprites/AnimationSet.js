var AnimationSet = Class({
	constructor: function(animations) {
		if (typeof animations !== 'undefined')
			this.animations = animations;
		else
			this.animations = {};
	},

	addAnimation: function(name, animation) {
		this.animations[name] = animation;
	}
});