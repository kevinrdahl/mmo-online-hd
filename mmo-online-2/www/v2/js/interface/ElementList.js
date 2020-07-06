var ElementList = Class(InterfaceElement, {
	constructor: function(options) {
		this.padding = UIConfig.elementListPadding; //default padding
		this.paddings = []; //corresponds to children

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

	addChild: function(child, padding) {
		padding = (typeof padding === 'number') ? padding : this.padding;
		this.paddings.push(padding);

		var y = this.getTotalHeight();
		if (this.children.length > 0) {
			y += padding;
		}

		ElementList.$superp.addChild.call(this, child);

		//let it do whatever it wants along the x axis
		child.attach.where[1] = 0;
		child.attach.parentWhere[1] = 0;
		child.attach.offset = [0,y];

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

		for (var i = start; i < this.children.length; i++) {
			if (i > 0)
				y += this.paddings[i];
			child = this.children[i];
			child.attach.offset[1] = y;
			child.reposition(true);
			y += child.displayObject.height;
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
		var h = 0;

		for (var i = 0; i < num; i++) {
			if (i > 0)
				h += this.paddings[i];
			h += this.children[i].displayObject.height;
		}

		return h;
	},

	getClassName: function() {
		return "Element List";
	}
});