var Interface = {
	defaultPaneProps:{
		bgAlpha:0.8,
		bgColor:0x000000,
		borderWidth:1,
		borderColor:0xffffff,
		borderAlpha:1
	},
	cooldownFlashTime:1000,
	buttonHoverColor:0xffffff,
	buttonHoverAlpha:0.5,
	buttonActiveColor:0x00ff00,
	buttonActiveAlpha:0.5,
	buttonDisabledColor:0x000000,
	buttonDisabledAlpha:0.7
};

Interface.HUDLayer = function() {
	this.container = new PIXI.DisplayObjectContainer();
	this.children = {};

	this.addElement = function(name, e) {
		this.children[name] = e;
		this.container.addChild(e.container);
	};

	this.removeElement = function(name) {
		this.container.removeChild(this.children[name].container);
		delete this.children[name];
	};

	this.draw = function(graphics) {
		for (var name in this.children) {
			this.children[name].draw(graphics);
		}
	};

	this.isClicked = function(v) {
		for (var name in this.children) {
			var clicked = this.children[name].isClicked(v);
			if (clicked) {
				return true;
			}
		}	
		return false;
	};
};

/*
Each Pane is allowed its own Graphics object, so they can resize without 
creating a million RenderTextures.
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

	this.container.x = this.x;
	this.container.y = this.y;

	this.addElement = function(e) {
		this.children.push(e);
		this.container.addChild(e.container);
	};

	this.removeElement = function(e) {
		this.children.splice(this.children.indexOf(e),1);
		this.container.removeChild(e.container);
	};

	this.draw = function(graphics) {
		if (this.drawNeeded) {
			this.drawNeeded = false;
			this.graphics.clear()

			//background
			this.graphics.beginFill(this.bgColor, this.bgAlpha);
			this.graphics.drawRect(0, 0, this.w, this.h);
			this.graphics.endFill();

			//border
			this.graphics.lineStyle(this.borderWidth, this.borderColor, this.borderAlpha);
			this.graphics.drawRect(0, 0, this.w, this.h);
		}

		for (var i = 0; i < this.children.length; i++) {
			this.children[i].draw(graphics);
		}
	};

	this.changeDrawProps = function(props) {
		this.drawNeeded = true;
		for (var p in props) {
			this[p] = props[p];
		}
	};

	this.isClicked = function(v) {
		for (var i = 0; i < this.children.length; i++) {
			var clicked = this.children[i].isClicked(v);
			if (clicked) {
				return true;
			}
		}
		return false;
	}

	this.changeDrawProps(Interface.defaultPaneProps);
};

Interface.ActionButton = function(x,y,sprite) {
	this.x = x;
	this.y = y;
	this.sprite = sprite;

	this.overlayColor = 0x000000;
	this.overlayAlpha = 0;
	this.borderColor = Interface.defaultPaneProps.borderColor;
	this.borderWidth = 1;

	this.hover = false;
	this.active = false;
	this.clicked = false;
	this.disabled = false;
	this.cooldownBegin = 0;
	this.cooldownEnd = 0;
	this.cooldownFlashEnd = 0;

	this.container = new PIXI.DisplayObjectContainer();
	this.renderTexture = new PIXI.RenderTexture(sprite.width+2*this.borderWidth, sprite.height+2*this.borderWidth);
	this.renderTextureSprite = new PIXI.Sprite(this.renderTexture);

	this.container.addChild(this.sprite);
	this.container.addChild(this.renderTextureSprite);

	this.container.position.x = x;
	this.container.position.y = y;
	this.sprite.position.x = this.borderWidth;
	this.sprite.position.y = this.borderWidth;
	

	this.drawNeeded = true;

	this.draw = function(graphics) {
		if (this.drawNeeded) {
			this.drawNeeded = false;
			this.renderTexture.clear();

			var currentTime = Date.now();
			var spriteW = this.sprite.width;
			var spriteH = this.sprite.height;
			var fullW = spriteW + 2*this.borderWidth;
			var fullH = spriteH + 2*this.borderWidth;
			var halfBorder = this.borderWidth/2;

			//highlight
			if (currentTime >= this.cooldownFlashEnd) {
				graphics.clear();
				if (this.disabled) {
					graphics.beginFill(Interface.buttonDisabledColor, Interface.buttonDisabledAlpha);
					graphics.drawRect(this.borderWidth, this.borderWidth, spriteW, spriteH);
					graphics.endFill();	
				} else if (this.active) {
					graphics.beginFill(Interface.buttonActiveColor, Interface.buttonActiveAlpha);
					graphics.drawRect(this.borderWidth, this.borderWidth, spriteW, spriteH);
					graphics.endFill();
				} else if (this.hover) {
					graphics.beginFill(Interface.buttonHoverColor, Interface.buttonHoverAlpha);
					graphics.drawRect(this.borderWidth, this.borderWidth, spriteW, spriteH);
					graphics.endFill();
				}
				this.renderTexture.render(graphics);
			} else {
				this.drawNeeded = true;
				var timeRemaining = this.cooldownEnd - currentTime;
				if (timeRemaining <= 0) {
					this.cooldownText.visible = false;
					var progress = (currentTime - this.cooldownEnd) / (this.cooldownFlashEnd - this.cooldownEnd);
					progress = HUD.easeOutSine(progress, 0, 1, 1);
					graphics.clear();
					graphics.beginFill(0xffffff, (1-progress)*0.65);
					graphics.drawRect(0,0,fullW,fullH);
					graphics.endFill();
					this.renderTexture.render(graphics);
				} else {
					var progress = (currentTime - this.cooldownBegin) / (this.cooldownEnd - this.cooldownBegin);
					this.cooldownText.setText(Math.ceil(timeRemaining/1000));

					//cooldown wipe
					graphics.clear();
					graphics.beginFill(Interface.buttonDisabledColor, Interface.buttonDisabledAlpha);
					graphics.drawRect(0,fullH*progress,fullW,fullH*(1-progress));
					graphics.endFill();
					this.renderTexture.render(graphics);
				}
			}

			//border
			var color;
			if (currentTime < this.cooldownEnd || this.disabled) {
				color = 0x333333;
			} else {
				color = 0xffffff;
			}

			graphics.clear();
			graphics.lineStyle(this.borderWidth, color, 1);
			graphics.drawRect(halfBorder, halfBorder, fullW-this.borderWidth, fullH-this.borderWidth);
			this.renderTexture.render(graphics);
		}
	};

	this.setState = function(props) {
		this.drawNeeded = true;
		for (p in props) {
			this[p] = props[p];
		}
	};

	//display only, doesn't bind
	this.setHotkey = function(key) {
		if (this.hotkeyText) {
			this.hotkeyText.setText(key);
		} else {
			this.hotkeyText = new PIXI.Text(key, {
				font:"14px Tahoma", 
				fill:"white", 
				align:"right", 
				stroke:"#000000",
                strokeThickness:3
            });
			this.hotkeyText.position.x = this.sprite.width-19;
			this.hotkeyText.position.y = this.sprite.height-16;
			this.container.addChild(this.hotkeyText);
		}
	};

	this.setCooldown = function(endTime) {
		this.drawNeeded = true;

		this.cooldownBegin = Date.now();
		this.cooldownEnd = endTime;
		this.cooldownFlashEnd = endTime + Interface.cooldownFlashTime;

		if (this.cooldownText) {
			this.cooldownText.visible = true;
		} else {
			this.cooldownText = new PIXI.Text('', {
				font:"20px Tahoma", 
				fill:"white", 
				align:"right", 
				stroke:"#000000",
                strokeThickness:3
            });
			this.cooldownText.anchor.x = 0.5;
			this.cooldownText.anchor.y = 0.5;
			this.cooldownText.position.x = Math.round(this.sprite.width/2) + this.borderWidth;
			this.cooldownText.position.y = Math.round(this.sprite.height/2) + this.borderWidth;
			this.container.addChild(this.cooldownText);
		}
	};

	this.isClicked = function(v) {
		return this.renderTextureSprite.getBounds().contains(v.x, v.y);
	};
};

Interface.ActionPane = function(x, y, cols, rows, colW, rowH, buttonW, buttonH, spacing) {
	var w = cols * buttonW + (cols+2) * spacing;
	var h = rows * buttonH + (rows+2) * spacing;

	this.pane = new Interface.Pane(x,y,w,h);
	this.container = pane.container;

	this.slots = new Array(cols);
	for (var i = 0; i < cols; i++) {
		this.slots[i] = [];
	}

	this.addButton = function(row, col, button) {
		this.pane.addElement(button);
		this.slots[row][col] = button;
	};
};