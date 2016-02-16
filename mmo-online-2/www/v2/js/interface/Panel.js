var Panel = Class(InterfaceElement, {
	constructor: function(options) {
		this.bgColor = UIConfig.backgroundColor;

		if (typeof options.borderWidth === "undefined")
			options.borderWidth = UIConfig.windowBorderWidth;
		if (typeof options.borderColor === "undefined")
			options.borderColor = UIConfig.borderColor;
		this.alpha = 1;

		Panel.$super.call(this, options);

		this.isClickable = true;

		this.renderTexture = new PIXI.RenderTexture(game.renderer, this.width, this.height);
		this.sprite = new PIXI.Sprite(this.renderTexture);
		this.displayObject.addChild(this.sprite);
		this.displayObject.alpha = this.alpha;

		this.drawNeeded = true;
	},

	draw: function() {
		//draw!
		if (this.drawNeeded) {
			this.drawNeeded = false;

			TextureGenerator.rectangle(this.width, this.height, this.bgColor, this.borderWidth, this.borderColor, this.renderTexture);
		}

		Panel.$superp.draw.call(this);
	},

	resize: function(w, h) {
		Panel.$superp.resize.call(this,w,h);

		this.renderTexture = new PIXI.RenderTexture(game.renderer, this.width, this.height);
		this.sprite.texture = this.renderTexture;
		this.drawNeeded = true;
	},

	getInnerBounds: function() {
		var coords = this.getGlobalPosition();
		return new PIXI.Rectangle(
			coords[0] + this.borderWidth,
			coords[1] + this.borderWidth,
			this.width - (this.borderWidth*2),
			this.height - (this.borderWidth*2)
		)
	},

	getClassName: function() {
		return "Panel";
	}
});