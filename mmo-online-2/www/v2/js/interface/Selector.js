var Selector = Class(Panel, {
	$static: {
		createLabelled: function(items, label, name) {
			var select = new Selector(items, {name:name});
			var labelText = new InterfaceText(label, {
				name:"label",
				font: UIConfig.bodyText,
				parent: select,
				attach:{
					where:[0.5,1],
					parentWhere:[0.5,0],
					offset:[0,-1]
				}
			});
			select.addChild(labelText, {noMask:true});

			return select;
		}
	},

	constructor: function(items, options) {
		this.items = items;
		this.index = 0;
		this.onChange = InterfaceElement.NOOP;

		MmooUtil.applyProps(options, {width:125, height:30}, true);
		Selector.$super.call(this, options);

		this.displayText = new InterfaceText(this.items[this.index].name, {
			font:UIConfig.formText,
			parent:this,
			attach:{
				where:[0.5,0.5],
				parentWhere:[0.5,0.5],
				offset:[0,0]
			}
		});
		this.addChild(this.displayText);

		var leftArrow = InterfaceText.createMenuButton(String.fromCharCode(9664), 'left');
		leftArrow.attach = {
			where:[1, 0.5],
			parentWhere:[0, 0.5],
			offset:[-5, 0]
		};
		this.addChild(leftArrow);
		leftArrow.onClick = this.onArrowClick.bind(this, false);

		var rightArrow = InterfaceText.createMenuButton(String.fromCharCode(9654), 'right');
		rightArrow.attach = {
			where:[0, 0.5],
			parentWhere:[1, 0.5],
			offset:[5, 0]
		};
		this.addChild(rightArrow);
		rightArrow.onClick = this.onArrowClick.bind(this, true);
	},

	onArrowClick: function(isRight) {
		var index;
		if (isRight) {
			index = (this.index+1) % this.items.length;
		} else {
			index = this.index-1;
			if (index < 0)
				index = this.items.length-1;

		}
		this.setIndex(index);
		this.onChange();
	},

	setIndex: function(index) {
		var item = this.items[index];
		if (typeof item === 'undefined')
			return;

		this.index = index;
		this.displayText.changeString(item.name);
	},

	setRandom: function() {
		this.setIndex(MmooUtil.randomInt(0, this.items.length));
	},

	getValue: function() {
		return this.items[this.index].value;
	}
})