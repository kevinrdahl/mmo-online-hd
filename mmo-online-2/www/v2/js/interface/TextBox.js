var TextBox = Class(Panel, {
	$static: {
		alphanumeric:[[97,122],[65,90],[48,57]], //[a-z], [A-Z], [0-9]
		characterName:[[97,122],[65,90],39,45,32], //apostrophe, dash, space
		userName:[[97,122],[65,90],[48,57],39,45,32,95,46,47], //underscore, dot, slash,
		any:[[32,95],[97,126]],

		createLabelled: function(label, name, text, hideInput, allowedCharacters) {
			var box = new TextBox({
				text:text,
				name:name,
				hideInput:hideInput,
				allowedCharacters:allowedCharacters,
				width:250,
				height:30
			});

			var labelText = new InterfaceText(label, {
				name:"label",
				font: UIConfig.menuLabelText,
				parent: box,
				attach:{
					where:[0,0],
					parentWhere:[0,1],
					offset:[5,3]
				}
			});
			box.addChild(labelText, {noMask:true});

			return box;
		}
	},

	constructor: function(options) {
		this.hideInput = false;
		this.maxChars = 30;
		this.text = '';
		this.active = false;
		this.cursorBlinkInterval = 500;
		this.allowedCharacters = TextBox.alphanumeric;

		TextBox.$super.call(this, options);

		this.displayText = new InterfaceText(this.text, {
			font:UIConfig.formText,
			parent:this,
			attach:{
				where:[0,0.5],
				parentWhere:[0,0.5],
				offset:[this.borderWidth + UIConfig.textBoxPadding, -2]
			}
		});
		this.addChild(this.displayText);

		this.cursor = new InterfaceText('|', {
			font:UIConfig.formText,
			parent:this.displayText,
			attach:{
				where:[0,0.5],
				parentWhere:[1,0.5],
				offset:[-2,0]
			}
		});
		this.displayText.addChild(this.cursor);

		if (this.hideInput)
			this.updateDisplay();

		var localBounds = this.getInnerBounds();
		localBounds.x -= this.x;
		localBounds.y -= this.y;
		this.applyMask(localBounds);
	},

	draw: function() {
		TextBox.$superp.draw.call(this);

		if (this.active) {
			this.cursor.displayObject.alpha = Math.floor(Date.now() / this.cursorBlinkInterval) % 2;
		} else {
			this.cursor.displayObject.alpha = 0;
		}
	},

	addCharacter: function(c) {
		//logger.log('ui', 'add character "' + c + '" to ' + this.getFullName());
		if (!this.characterAllowed(c) || this.text.length >= this.maxChars) {
			createjs.Sound.play('ui/nope');
			return;
		}		

		this.text += c;
		this.updateDisplay();
	},

	deleteCharacter: function() {
		if (this.text.length > 0)
			this.text = this.text.substr(0,this.text.length-1);
		this.updateDisplay();
	},

	updateDisplay: function() {
		if (this.hideInput) {
			var s = '';
			for (var i = 0; i < this.text.length; i++) {
				s += '*';
			}
			this.displayText.changeString(s);
		} else {
			this.displayText.changeString(this.text);
		}

		//ensure cursor is in view
		var width = this.width - 2*this.borderWidth - 2*UIConfig.textBoxPadding;
		var textWidth = this.displayText.width + this.cursor.width;
		
		this.displayText.attach.offset[0] = this.borderWidth + UIConfig.textBoxPadding;
		if (textWidth > width) {
			this.displayText.attach.offset[0] -= textWidth - width;
		}

		this.displayText.reposition();
	},

	characterAllowed: function(c) {
		var code = c.charCodeAt(0);
		var set;
		for (var i = 0; i < this.allowedCharacters.length; i++) {
			set = this.allowedCharacters[i];
			if (Array.isArray(set) && code >= set[0] && code <= set[1])
				return true;
			else if (set === code)
				return true;
		}

		return false;
	},
});