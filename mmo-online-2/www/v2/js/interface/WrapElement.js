var WrapElement = Class(InterfaceElement, {
	constructor: function(options) {
		WrapElement.$super.call(this, options);
	},

	onChildResize: function(child) {
		this.width = child.width;
		this.height = child.height;
	}
});