var ElementGrid = Class(InterfaceElement, {
	constructor: function(options) {
		MmooUtil.applyProps(options, {
			//by default, 3 columns and add rows as needed
			gridWidth: 0,
			gridHeight: 0,
			gridMaxWidth: 3,
			gridMaxHeight: -1,
			growAxis: 'x', //add to right first, if possible
			cellWidth: 50,
			cellHeight: 50,
			rowPadding: 2,
			colPadding: 2
		}, true);
		ElementGrid.$super.call(this, options);

		this.rows = [];
	},

	addChild: function(child, x, y) {
		if (typeof x === 'undefined') {
			//put in next available cell, assuming no gaps
			var fail = false;
			var currentRow = this.rows[this.gridHeight-1];
			if (typeof currentRow === 'undefined') {
				x = 0;
				y = 0;
			} else if (this.growAxis === 'x') {
				if (currentRow.length < this.gridMaxWidth || this.gridMaxWidth <= 0) {
					x = currentRow.length;
					y = this.gridHeight-1;
				} else if (this.gridHeight < this.gridMaxHeight || this.gridMaxHeight <= 0) {
					x = 0;
					y = this.gridHeight;
				} else {
					fail = true;
				}
			} else {
				if (this.gridHeight < this.gridMaxHeight || this.gridMaxHeight <= 0) {
					x = 0;
					y = this.gridHeight;
				} else if (currentRow.length < this.gridMaxWidth || this.gridMaxWidth <= 0) {
					x = currentRow.length;
					y = this.gridHeight-1;
				} else {
					fail = true;
				}
			}

			if (fail) {
				console.error('No room in grid for element.');
				console.log(child);
				return;
			}
		}

		while (y >= this.rows.length) {
			this.rows.push([]);
			this.gridHeight += 1;
		}

		if (x+1 > this.gridWidth)
			this.gridWidth = x+1;

		this.rows[y][x] = child;
		child.attach.parentWhere = [0,0];
		child.attach.offset = [x * (this.cellWidth+this.colPadding), y * (this.cellHeight+this.rowPadding)];

		ElementGrid.$superp.addChild.call(this, child);
		this.updateDimensions();
	},

	updateDimensions: function() {
		this.width = Math.max(this.gridWidth * (this.cellWidth + this.colPadding) - this.colPadding, 0);
		this.height = Math.max(this.gridHeight * (this.cellHeight + this.rowPadding) - this.rowPadding, 0);

	},

	getElementAtCoords: function(coords) {
		var element = null;
		var globalPosition = this.getGlobalPosition();
		var bounds = new PIXI.Rectangle(globalPosition[0], globalPosition[1], this.width, this.height);

		if (bounds.contains(coords[0], coords[1])) {
			var localCoords = [coords[0]-bounds.x, coords[1]-bounds.y];
			element = this.getElement(Math.floor(localCoords[0] / (this.cellWidth+this.rowPadding)), Math.floor(localCoords[1] / (this.cellHeight+this.rowPadding)));
			if (element instanceof InterfaceElement)
				return element.getElementAtCoords(coords);
		}
		
		return null;
	},

	centerElement: function(x, y) {
		var element = this.rows[y][x];
		if (!(element instanceof InterfaceElement))
			return;

		element.attach = {
			where:[0.5, 0.5],
			parentWhere: [0,0],
			offset:[
				this.cellWidth/2 + this.cellWidth*x,
				this.cellHeight/2 + this.cellHeight*y
			]
		};
		element.reposition(true);
	},

	//use if there are gaps in the grid
	addChildFillGaps: function(child) {
		for (var y = 0; y < this.rows.length; y++) {
			for (var x = 0; x < this.rows[y].length; x++) {
				if (!(this.rows[y][x] instanceof InterfaceElement)) {
					this.addChild(child, x, y);
					break;
				}
			}
		}

		//extend or give up
		this.addChild(child);
	},

	getElement: function(x, y) {
		var element = this.rows[y][x];
		if (element instanceof InterfaceElement)
			return element;
		return null;
	}
});

var SelectGrid = Class(ElementGrid, {
	$static: {
		elementHighlight: function() {this.sprite.tint = UIConfig.highlightColor; createjs.Sound.play('ui/rollover');},
		elementUnHighlight: function() {this.sprite.tint = 0xffffff;},
		elementSelect: function() {this.parent.selectChild(this); createjs.Sound.play('ui/click');}
	},

	constructor: function(options) {
		this.selectedChild = null;
		this.onChange = InterfaceElement.NOOP;
		MmooUtil.applyProps(options, {
			cellWidth:32, 
	    	cellHeight:32, 
	    	rowPadding:3, 
	    	colPadding:3,
	    	gridMaxWidth:7,
	    	gridMaxHeight:-1,
    	}, true);

    	SelectGrid.$super.call(this, options);

    	var tex = new PIXI.RenderTexture(game.renderer, this.cellWidth+2, this.cellHeight+2);
    	var graphics = getVolatileGraphics();
    	graphics.lineStyle(3, 0xffffff, 1);
    	graphics.drawRect(2, 2, this.cellWidth-1, this.cellHeight-1);
    	tex.render(graphics);
    	this.selectSpr = new PIXI.Sprite(tex);
	},

	addChild: function(child) {
		child.onHoverStart = SelectGrid.elementHighlight;
		child.onHoverEnd = SelectGrid.elementUnHighlight;
		child.onClick = SelectGrid.elementSelect;

		SelectGrid.$superp.addChild.call(this, child);

		if (this.children.length === 1)
			this.selectChild(child);
	},

	selectChild: function(child) {
		if (this.selectedChild !== null)
			this.selectedChild.displayObject.removeChild(this.selectSpr);
		this.selectedChild = child;
		this.selectedChild.displayObject.addChild(this.selectSpr);
		this.selectSpr.position.x = -1;
		this.selectSpr.position.y = -1;

		this.onChange();
	},

	selectRandom: function() {
		var index = MmooUtil.randomInt(0, this.children.length);
		this.selectChild(this.children[index]);
	}
})