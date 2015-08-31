var MaskElement = Class(InterfaceElement, {
	constructor: function(options) {
		MaskElement.$super.call(this, options);

		this.mask = new PIXI.Graphics();
		this.mask.alpha = 0;
		this.displayObject.addChild(this.mask);

		this.drawMask();
	},

	drawMask: function() {
		this.mask.clear();
		this.mask.beginFill();
		this.mask.drawRect(0, 0, this.width, this.height);
		this.mask.endFill();
	},

	addChild: function(child) {
		MaskElement.$superp.addChild.call(this, child);
		child.displayObject.mask = this.mask;
	},

	removeChild: function(child) {
		MaskElement.$superp.removeChild.call(this, child);
		child.displayObject.mask = null;
	},

	getClassName: function() {
		return "Mask Element";
	}
});