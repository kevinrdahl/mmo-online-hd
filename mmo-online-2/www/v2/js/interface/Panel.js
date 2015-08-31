var Panel = Class(InterfaceElement, {
	constructor: function(options) {
		this.bgColor = UIConfig.panelBgColor;

		if (typeof options.borderWidth === "undefined")
			options.borderWidth = UIConfig.windowBorderWidth;
		if (typeof options.borderColor === "undefined")
			options.borderColor = UIConfig.headerBgColor;
		this.alpha = 1;

		Panel.$super.call(this, options);

		this.isClickable = true;

		this.renderTexture = new PIXI.RenderTexture(this.width, this.height);
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

		this.renderTexture = new PIXI.RenderTexture(width, height);
		this.drawNeeded = true;
	},

	getInnerSize: function() {
		return {
			width:this.width - (this.borderWidth*2),
			height:this.height - (this.borderWidth*2)
		}
	},

	getClassName: function() {
		return "Panel";
	}
});