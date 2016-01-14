var InterfaceButton = Class(InterfaceElement, {
	constructor: function(texture, options) {
		this.enabled = true;
		options.width = texture.width;
		options.height = texture.height;

		InterfaceButton.$super.call(this, options);

		this.isClickable = true;

		this.sprite = new PIXI.Sprite(texture);
		this.displayObject.addChild(this.sprite);
	},

	setEnabled: function(enabled) {
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
	},

	getClassName: function() {
		return "Button";
	}
});