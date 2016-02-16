var InterfaceElement = Class({
	$static:{
		NOOP:function(){}
	},

	constructor: function(options) {
		this.id = "";
		this.name = "";
		this.x = 0;
		this.y = 0;
		this.width = 100;
		this.height = 100;
		this.displayObject = new PIXI.Container();
		this.children = [];
		this.parent = null;
		this.isClickable = false;
		this.draggable = false;
		this.dragElement = this;
		this.maskSprite = null;
		this.enabled = true;

		this.onClick = InterfaceElement.NOOP;
		this.onHoverStart = InterfaceElement.NOOP;
		this.onHoverEnd = InterfaceElement.NOOP;

		this.attach = {
			where:[0,0],
			parentWhere:[0,0],
			offset:[0,0],
			firstOnly:false
		}

		//hard override all properties with options
		if (typeof options !== 'undefined') {
			MmooUtil.applyProps(this, options, false);	
		}

		if (this.maskSprite !== null) {
			logger.log('ui', 'Specifying a mask is not supported at instantiation. Use the applyMask function instead.');
			this.maskSprite = null;
		}

		this.reposition(true);
	},

	draw: function() {
		this.updateDisplayObjectPosition();

		for (var i = 0; i < this.children.length; i++) {
			this.children[i].draw();
		}
	},

	getElementAtCoords: function(coords) {
		var element = null;
		var bounds = this.displayObject.getBounds();

		if (bounds.contains(coords[0], coords[1])) {
			//Work backwards. Most recently added children are on top.
			for (var i = this.children.length-1; i >= 0; i--) {
				element = this.children[i].getElementAtCoords(coords);
				if (element != null) {
					break;
				}
			}

			if (element == null && this.isClickable) {
				element = this;
			}
		}
		
		return element;
	},

	addChild: function(child, options) {
		options = (typeof options === 'object') ? options : {};

		this.children.push(child);
		this.displayObject.addChild(child.displayObject);
		child.parent = this;
		child.reposition(false);

		if (!options.noMask && this.maskSprite !== null)
			child.displayObject.mask = this.maskSprite;
	},

	removeChild: function(child) {
		this.children.splice(this.children.indexOf(child), 1);
		this.displayObject.removeChild(child.displayObject);

		if (child.parent == this)
			child.parent = null;

		child.displayObject.mask = null;
	},

	removeAllChildren: function(exclude) {
		exclude = (typeof exclude !== 'undefined') ? exclude : [];
		var toRemove = this.children.filter(function(x) {
			return (exclude.indexOf(x) > -1)
		});

		for (var i = 0; i < toRemove.length; i++) {
			this.removeChild(toRemove[i]);
		}
	},

	findChildById: function(id) {
		var toCheck = this.children.slice();
		var child;
		while (toCheck.length > 0) {
			child = toCheck.shift();
			if (child.id === id) {
				return child;
			} else if (child.children.length > 0) {
				toCheck = toCheck.concat(child.children)
			}
		}
		return null;
	},

	findChildrenByFunction: function(f, list) {
		if (typeof list === 'undefined')
			list = [];

		var child;
		for (var i = 0; i < this.children.length; i++) {
			child = this.children[i];
			if (f(child)) {
				list.push(child);
			}

			child.findChildrenByFunction(f, list);
		}

		return list;
	},

	//dirty? clever? both?
	moveChildToTop: function(child) {
		this.removeChild(child);
		this.addChild(child);
	},

	findTopParent: function(root) {
		root = (typeof root !== "undefined") ? root : game.ui;
		if (this == root || this.parent == null) {
			logger.log("error", "Error in findTopParent on " + this.getFullName());
			return null;
		}

		var element = this;
		while (element.parent != game.ui) {
			element = element.parent;
		}
		return element;
	},

	getClassName: function() {
		return "Interface Element";
	},

	getFullName: function() {
		var s = this.getClassName();
		if (this.id != "")
			s += " " + this.id;
		if (this.name != "")
			s += " \"" + this.name + "\"";
		if (this.draggable)
			s += " (draggable)";

		return s;
	},

	resize: function(w,h) {
		this.width = w;
		this.height = h;

		logger.log("ui", "resize " + this.getFullName() + " " + w + "x" + h);

		for (var i = 0; i < this.children.length; i++) {
			this.children[i].reposition();
		}

		this.updateDisplayObjectPosition();
	},

	reposition: function(firstTime) {
		firstTime = (typeof firstTime !== "undefined") ? firstTime : false;

		if (this.parent == null || (this.attach.firstOnly && !firstTime)) {
			this.updateDisplayObjectPosition();
			return;
		}

		var coords = this.getAttachCoords();

		//logger.log("debug", "position " + this.getFullName() + " " + JSON.stringify(coords));

		this.x = coords[0];
		this.y = coords[1];

		this.toNearestPixel();
	},

	getGlobalPosition: function() {
		var x = this.x;
		var y = this.y;
		var parent = this.parent;
		while (parent != null) {
			x += parent.x;
			y += parent.y;
			parent = parent.parent;
		}

		return [x,y];
	},

	getAttachCoords: function() {
		return [
			this.parent.width * this.attach.parentWhere[0] - this.width * this.attach.where[0] + this.attach.offset[0],
			this.parent.height * this.attach.parentWhere[1] - this.height * this.attach.where[1] + this.attach.offset[1]
		];
	},

	updateDisplayObjectPosition: function() {
		this.displayObject.position.x = this.x;
		this.displayObject.position.y = this.y;
	},

	//TODO: account for actual positioning
	toNearestPixel: function() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.updateDisplayObjectPosition();
	},

	//this will show a big white rectangle if the element has no children
	applyMask: function(bounds, exclude) {
		exclude = (typeof exclude !== 'undefined') ? exclude : [];

		this.maskSprite = new PIXI.Sprite(game.maskTexture);
		this.displayObject.addChild(this.maskSprite);
		
		//apply to existing children
		var child;
		for (var i = 0; i < this.children.length; i++) {
			child = this.children[i];
			if (exclude.indexOf(child) === -1) {
				child.displayObject.mask = this.maskSprite;
			}
		}

		this.maskSprite.position.x = bounds.x;
		this.maskSprite.position.y = bounds.y;
		this.maskSprite.scale.x = bounds.width/10;
		this.maskSprite.scale.y = bounds.height/10;
	},

	removeMask: function() {
		//TODO
		logger.log('ui', '---InterfaceElement.removeMask isn\'t implemented yet!---');
	},

	addFilter: function(filter) {
		if (this.displayObject.filters == null || typeof this.displayObject.filters === 'undefined') {
			this.displayObject.filters = [filter];
		} else if (this.displayObject.filters.indexOf(filter) === -1) {
			this.displayObject.filters = this.displayObject.filters.concat([filter]);
		}
	},

	removeFilter: function(filter) {
		if (!Array.isArray(this.displayObject.filters))
			return;

		try {
			var index = this.displayObject.filters.indexOf(filter);
			this.displayObject.filters = this.displayObject.filters.filter(function(val) {
				return val != filter;
			});

			if (this.displayObject.filters.length == 0) {
				this.displayObject.filters = null;
			}
		} catch (e) {
			logger.log('ui', 'removeFilter ' + e.toString());
		}
	},

	removeAllFilters: function() {
		this.displayObject.filters = null;
	},

	addFilterToChildren: function(filter, exclude) {
		exclude = (typeof exclude !== 'undefined') ? exclude : [];

		for (var i = 0; i < this.children.length; i++) {
			if (exclude.indexOf(this.children[i]) === -1)
				this.children[i].addFilter(filter);
		}
	},

	removeFilterFromChildren: function(filter, exclude) {
		exclude = (typeof exclude !== 'undefined') ? exclude : [];
		for (var i = 0; i < this.children.length; i++) {
			if (exclude.indexOf(this.children[i]) === -1)
				this.children[i].removeFilter(filter);
		}
	},

	setAttachDimension: function(dimension, where, parentWhere, offset) {
		this.attach.where[dimension] = where;
		this.attach.parentWhere[dimension] = parentWhere;
		if (typeof offset === 'number')
			this.attach.offset[dimension] = offset;
	},

	//convenient alias
	setAttachX: function(where, parentWhere, offset) {
		this.setAttachDimension(0, where, parentWhere, offset);
	},

	//convenient alias
	setAttachY: function(where, parentWhere, offset) {
		this.setAttachDimension(1, where, parentWhere, offset);
	},

	setAttachToPosition: function() {
		var coords = this.getAttachCoords();
		this.attach[0] += this.x - coords[0];
		this.attach[1] += this.y - coords[1];
	}
});