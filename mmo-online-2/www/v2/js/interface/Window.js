var WindowPanel = Class(Panel, {
	$static: {
		closeButtonTexture: null,
		getCloseButtonTexture: function() {
			if (WindowPanel.closeButtonTexture === null) {
				var width = UIConfig.headerHeight - 2 * UIConfig.windowBorderWidth;
				var tex = new PIXI.RenderTexture(game.renderer, width,width);
				var g = getVolatileGraphics();

				var group = new PIXI.Container();

				g.beginFill(UIConfig.negativeColor);
				g.drawRect(0,0,width,width);
				g.endFill();

				var text = new PIXI.Text("X", UIConfig.headerText);
				text.position.x = Math.round(width/2 - text.width/2);
				text.position.y = Math.round(width/2 - text.height/2) - 1;

				group.addChild(g);
				group.addChild(text);

				tex.render(group);
				WindowPanel.closeButtonTexture = tex;
			}

			return WindowPanel.closeButtonTexture;
		}
	},

	constructor: function(options) {
		this.title = "";

		WindowPanel.$super.call(this, options);
		//this.displayObject.filters = [game.filters.dropShadow];

		//don't move this when the view changes
		this.attach.firstOnly = true;

		//add the header bar
		this.headerBar = new Panel({
			width:this.width,
			height:UIConfig.headerHeight,
			bgColor:UIConfig.borderColor,
			draggable:true,
			dragElement:this,
			attach: {
				where:[1,1],
				parentWhere:[1,0],
				offset:[0,UIConfig.windowBorderWidth]
			}
		});
		this.headerBar.name = "headerBar";
		this.addChild(this.headerBar, true);
		this.headerBar.reposition(true);

		//add the header text, if this has a title
		this.headerText = null;
		if (this.title != "") {
			this.headerText = new PIXI.Text(this.title, UIConfig.headerText);
			this.headerText.position.x = UIConfig.headerTextX;
			this.headerText.position.y = UIConfig.headerTextY - UIConfig.headerHeight;
			this.headerText.filters = [game.filters.dropShadow];
			this.displayObject.addChild(this.headerText);
		}

		//add the close button
		this.closeButton = new InterfaceTexture(WindowPanel.getCloseButtonTexture(), {
			name:"close",
			parent:this,
			attach:{
				where:[1,1],
				parentWhere:[1,0],
				offset:[-UIConfig.windowBorderWidth, 0]
			}
		});
		this.addChild(this.closeButton, true);
	},

	applyMask: function(bounds, exclude) {
		exclude = (typeof exclude !== 'undefined') ? exclude : [];
		exclude.push(this.headerBar, this.closeButton);
		WindowPanel.$superp.applyMask.call(this, bounds, exclude);
	},

	getClassName: function() {
		return "WindowPanel";
	}
});