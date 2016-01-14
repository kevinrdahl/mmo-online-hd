var WindowPanel = Class(Panel, {
	constructor: function(options) {
		this.title = "";

		WindowPanel.$super.call(this, options);

		//don't move this when the view changes
		this.attach.firstOnly = true;

		//add the header bar
		this.headerBar = new Panel({
			width:this.width,
			height:UIConfig.headerHeight,
			bgColor:UIConfig.headerBgColor,
			draggable:true,
			dragElement:this
		});
		this.headerBar.name = "headerBar";
		this.addChild(this.headerBar);

		//add the header text, if this has a title
		this.headerText = null;
		if (this.title != "") {
			this.headerText = new PIXI.Text(this.title, UIConfig.headerText);
			this.headerText.position.x = UIConfig.headerTextX;
			this.headerText.position.y = UIConfig.headerTextY;
			this.displayObject.addChild(this.headerText);
		}

		//add the close button
		//TODO: keep a semi-global texture, don't need to make a new one every time
		var w = UIConfig.headerHeight - 2 * UIConfig.windowBorderWidth;
		var tex = new PIXI.RenderTexture(w,w);
		var g = game.volatileGraphics;

		var group = new PIXI.DisplayObjectContainer();

		g.clear();
		g.lineStyle(0,0,0);
		g.beginFill(UIConfig.closeButtonColor);
		g.drawRect(0,0,w,w);
		g.endFill();

		var text = new PIXI.Text("X", UIConfig.headerText);
		text.position.x = Math.round(w/2 - text.width/2);
		text.position.y = Math.round(w/2 - text.height/2) + 3;

		group.addChild(g);
		group.addChild(text);

		tex.render(group);

		this.closeButton = new InterfaceButton(tex, {
			name:"close",
			parent:this,
			attach:{
				where:[1,0],
				parentWhere:[1,0],
				offset:[-UIConfig.windowBorderWidth, UIConfig.windowBorderWidth]
			}
		});
		this.addChild(this.closeButton);
	},

	getClassName: function() {
		return "WindowPanel";
	}
});