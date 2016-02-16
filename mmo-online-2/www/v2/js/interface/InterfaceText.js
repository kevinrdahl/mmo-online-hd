var InterfaceText = Class(InterfaceElement, {
	$static: {
		createMenuButton: function(text, name) {
			var t = new InterfaceText(text, {
				name: name,
				font: UIConfig.titleText,
				isClickable: true,
				onHoverStart: function() {
					this.changeFont(UIConfig.titleTextHover);
					createjs.Sound.play('ui/rollover');
				},
				onHoverEnd: function() {
					this.changeFont(UIConfig.titleText);
				}
			});

			return t;
		}
	},

	constructor: function(str, options) {
		this.str = str;
		if (typeof options.font === "undefined") { this.font = MmooUtil.shallowClone(UIConfig.bodyText); }

		InterfaceText.$super.call(this, options);

		this.pixiText = new PIXI.Text(str, this.font);
		this.displayObject.addChild(this.pixiText);
		this.onResize();
	},

	changeFont: function(font) {
		if (typeof font !== "undefined") {
			this.font = MmooUtil.shallowClone(font);
			this.pixiText.style = this.font;
		
			this.onResize();
		}
	},

	changeString: function(str) {
		this.str = str;
		this.pixiText.text = str;

		this.onResize();
	},

	onResize: function() {
		this.updateDimensions();
		this.reposition(true);
		if (this.parent instanceof ElementList) {
			this.parent.onChildResize(this);
		}

		for (var i = 0; i < this.children.length; i++) {
			this.children[i].reposition(true);
		}
	},

	updateDimensions: function() {
		this.width = this.pixiText.width;
		this.height = this.pixiText.height;
	},

	fitToWidth: function(width) {
		this.font = MmooUtil.shallowClone(this.font);
		this.font.wordWrap = true;
		this.font.wordWrapWidth = width;
		this.pixiText.style = this.font;

		logger.log("ui", this.getFullName() + " wrap to " + this.font.wordWrapWidth + "px");
		this.onResize();
	},

	fitToParent: function() {
		this.fitToWidth(this.parent.width - UIConfig.elementListOuterPadding*2);
	},

	getClassName: function() {
		return "Text";
	}
});