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
			if (this.growAxis === 'x') {
				if (currentRow.length < this.gridMaxWidth) {
					x = currentRow.length;
					y = this.gridHeight-1;
				} else if (this.gridHeight < this.gridMaxHeight) {
					x = 0;
					y = this.gridHeight;
				} else {
					fail = true;
				}
			} else {
				if (this.gridHeight < this.gridMaxHeight) {
					x = 0;
					y = this.gridHeight;
				} else if (currentRow.length < this.gridMaxWidth) {
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

		Element.$superp.addChild.call(this, child);
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
			var localCoords = [coords[0]-this.x, coords[1]-this.y];
			element = this.getElement(Math.floor(coords[0] / (this.cellWidth+this.rowPadding)), Math.floor(coords[1] / (this.cellHeight+this.rowPadding)));
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