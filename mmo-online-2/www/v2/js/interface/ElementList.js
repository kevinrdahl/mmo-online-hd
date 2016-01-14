var ElementList = Class(InterfaceElement, {
	constructor: function(options) {
		this.padding = UIConfig.elementListPadding;
		this.resizeFrom = -1;

		ElementList.$super.call(this, options);
	},

	draw: function() {
		if (this.resizeFrom != -1) {
			this.setPositions(this.resizeFrom);
			this.resizeFrom = -1;
		}
		ElementList.$superp.draw.call(this);
	},

	addChild: function(child) {
		var y = this.getTotalHeight();
		if (this.children.length > 0) {
			y += this.padding;
		}

		ElementList.$superp.addChild.call(this, child);

		child.attach = {
			where:[0,0],
			parentWhere:[0,0],
			offset:[0,y]
		}
		child.reposition(true);
	},

	removeChild: function(child) {
		var index = this.children.indexOf(child);
		this.setResizeFrom(index);
		ElementList.$superp.removeChild.call(this, child);
	},

	setPositions: function(start) {
		start = (typeof start !== "undefined") ? start : 0;
		var y = this.getTotalHeight(start);
		var child;
		if (start > 0) {
			y += this.padding;
		}

		for (var i = start; i < this.children.length; i++) {
			child = this.children[i];
			child.attach.offset[1] = y;
			child.reposition(true);
			y += child.height + this.padding;
		}
	},

	onChildResize: function(child) {
		var index = this.children.indexOf(child);
		this.setResizeFrom(index);
	},

	setResizeFrom: function(index) {
		if (this.resizeFrom == -1 || index < this.resizeFrom) {
			this.resizeFrom = index;
		}
	},

	getTotalHeight: function(num) {
		num = (typeof num !== "undefined") ? num : this.children.length;
		var sum = 0;

		for (var i = 0; i < num; i++) {
			sum += this.children[i].height;
		}
		if (this.children.length > 1) {
			sum += (num-1) * this.padding;
		}

		return sum;
	},

	getClassName: function() {
		return "Element List";
	}
});