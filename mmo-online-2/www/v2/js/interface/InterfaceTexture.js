var InterfaceTexture = Class(InterfaceElement, {
	constructor: function(texture, options) {
		//this.enabled = true;
		options.width = texture.width;
		options.height = texture.height;

		InterfaceTexture.$super.call(this, options);

		this.isClickable = true;

		this.sprite = new PIXI.Sprite(texture);
		this.displayObject.addChild(this.sprite);
	},

	//might be worth adding to base class

	/*setEnabled: function(enabled) {
		this.enabled = enabled;

		if (enabled) {
			this.enabledEffect();
		} else {
			this.disabledEffect();
		}
	},

	enabledEffect: function() {
		this.sprite.filters = null;
		this.sprite.tint = 0xffffff;
	},

	disabledEffect: function() {
		this.sprite.filters = [game.filters.gray];
		this.sprite.tint = 0xaaaaaa;
	},*/

	getClassName: function() {
		return "Texture";
	}
});

var ActiveTexture = Class(InterfaceTexture, {
	constructor: function(textures, startTexture, options) {
		this.textures = textures;

		ActiveTexture.$super.call(this, textures[startTexture], options);
	},

	getClassName: function() {
		return "Active Texture";
	}
});