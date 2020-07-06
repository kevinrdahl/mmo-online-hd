var InterfaceTexture = Class(InterfaceElement, {
	constructor: function(texture, options) {
		options.width = texture.width;
		options.height = texture.height;

		InterfaceTexture.$super.call(this, options);

		this.isClickable = true;

		this.sprite = new PIXI.Sprite(texture);
		this.displayObject.addChild(this.sprite);
	},

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