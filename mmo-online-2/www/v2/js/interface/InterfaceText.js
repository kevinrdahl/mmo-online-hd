var InterfaceText = Class(InterfaceElement, {
	constructor: function(str, options) {
		this.str = str;
		if (typeof options.font === "undefined") { this.font = MmooUtil.shallowClone(UIConfig.bodyText); }

		InterfaceText.$super.call(this, options);

		this.text = new PIXI.Text(str, this.font);
		this.displayObject.addChild(this.text);
		this.onResize();
	},

	changeFont: function(font) {
		if (typeof font !== "undefined") { this.font = MmooUtil.shallowClone(font); }
		this.text.setStyle(this.font);
		
		this.onResize();
	},

	changeString: function(str) {
		this.str = str;
		this.text.setText(str);

		this.onResize();
	},

	onResize: function() {
		this.updateDimensions();
		this.reposition(true);
		if (this.parent instanceof ElementList) {
			this.parent.onChildResize(this);
		}
	},

	updateDimensions: function() {
		this.width = this.text.width;
		this.height = this.text.height;
	},

	fitToParent: function() {
		this.font.wordWrap = true;
		this.font.wordWrapWidth = this.parent.width - this.x;
		this.changeFont();

		game.logger.log("ui", this.getFullName() + " wrap to " + this.font.wordWrapWidth + "px");
	},

	getClassName: function() {
		return "Text";
	}
});