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

		this.onClick = InterfaceElement.NOOP;
		this.onHover = InterfaceElement.NOOP;

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

	addChild: function(child, noMask) {
		this.children.push(child);
		this.displayObject.addChild(child.displayObject);
		child.parent = this;

		if (!noMask && this.maskSprite !== null)
			child.displayObject.mask = this.maskSprite;
	},

	removeChild: function(child) {
		child.remove();

		this.children.splice(this.children.indexOf(child), 1);
		this.displayObject.removeChild(child.displayObject);

		if (child.parent == this)
			child.parent = null;

		child.displayObject.mask = null;
	},

	remove: function() {
		return;
		console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
		while (this.children.length > 0) {
			this.children[0].remove();
		}
		
		if (this.parent !== null) {
			this.parent.children.splice(this.parent.children.indexOf(this), 1);
			this.parent.displayObject.removeChild(this.displayObject);
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
			

		var coords = [
			this.parent.width * this.attach.parentWhere[0] - this.width * this.attach.where[0] + this.attach.offset[0],
			this.parent.height * this.attach.parentWhere[1] - this.height * this.attach.where[1] + this.attach.offset[1]
		];

		//logger.log("ui", "position " + this.getFullName() + " " + JSON.stringify(coords));

		this.x = coords[0];
		this.y = coords[1];

		this.toNearestPixel();
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

	},

	onMouse: function(event) {

	}
});