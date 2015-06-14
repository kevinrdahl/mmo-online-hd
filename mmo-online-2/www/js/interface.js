var Interface = {
	defaultPaneProps:{
		bgAlpha:0.8,
		bgColor:0x000000,
		borderWidth:2,
		borderColor:0xffffff,
		borderAlpha:1
	}
};

Interface.HUDLayer = function() {
	this.container = new PIXI.DisplayObjectContainer();
	this.children = [];

	this.addElement = function(e) {
		this.children.push(e);
		this.container.addChild(e.container);
	};

	this.removeElement = function(e) {
		this.children.splice(this.children.indexOf(e),1);
		this.container.removeChild(e.container);
	};

	this.draw = function() {
		for (var i = 0; i < this.children.length; i++) {
			this.children[i].draw();
		}
	};
};

/*
Each Pane is allowed its own Graphics object, so they can resize without 
creating a million RenderTextures. This should also make window effects easier.
*/
Interface.Pane = function(x,y,w,h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;

	this.container = new PIXI.DisplayObjectContainer();
	this.graphics = new PIXI.Graphics();
	this.container.addChild(this.graphics);
	this.children = [];
	//note: draw props set at bottom because javascript

	this.init = function() {

	};

	this.addElement = function(e) {
		this.children.push(e);
		this.container.addChild(e.displayObject);
	};

	this.removeElement = function(e) {
		this.children.splice(this.children.indexOf(e),1);
		this.container.removeChild(e.displayObject);
	};

	this.draw = function() {
		if (this.drawNeeded) {
			this.drawNeeded = false;
			this.graphics.clear()

			//background
			this.graphics.beginFill(this.bgColor, this.bgAlpha);
			this.graphics.drawRect(this.x, this.y, this.w, this.h);
			this.graphics.endFill();

			//border
			this.graphics.lineStyle(this.borderWidth, this.borderColor, this.borderAlpha);
			this.graphics.drawRect(this.x, this.y, this.w, this.h);
		}

		for (var i = 0; i < this.children.length; i++) {
			this.children[i].draw();
		}
	};

	this.changeDrawProps = function(props) {
		this.drawNeeded = true;
		for (var p in props) {
			this[p] = props[p];
		}
	};

	this.changeDrawProps(Interface.defaultPaneProps);
};

Interface.ActionButton = function(x,y,sprite) {
	this.x = x;
	this.y = y;
	this.sprite = sprite;

	this.overlayColor = 0xffffff;
	this.overlayAlpha = 0;
	this.borderColor = 0xffffff;
	this.borderWidth = 2;

	this.container = new PIXI.DisplayObjectContainer();
	this.overlay = new PIXI.RenderTexture(sprite.width, sprite.height);

	this.drawNeeded = true;

	this.draw = function(graphics) {
		if (this.drawNeeded) {
			this.drawNeeded = false;
		}
	};

	this.setHover = function(hover) {
		this.drawNeeded = true;
		if (hover) {

		}
	};
};