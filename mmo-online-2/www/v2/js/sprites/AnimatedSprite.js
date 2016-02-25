var AnimatedSprite = Class({
	constructor: function(spriteSheet, animName) {
		this.position = new PIXI.Point(0,0);
		this.spriteSheet = spriteSheet;
		this.spriteSheetVersion = spriteSheet.version;
		this.sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(spriteSheet.canvas));

		this.animation = animName;
		this.animStartTime = Date.now();
		this.update(this.animStartTime);
	},

	setAnimation: function(name, timeOffset) {
		timeOffset = (typeof timeOffset === 'undefined') ? 0 : timeOffset;
		this.animStartTime = Date.now() - timeOffset;
		this.animation = name;
	},

	update: function(time) {
		if (this.spriteSheet.version != this.spriteSheetVersion) {
			this.spriteSheetVersion = this.spriteSheet.version;
			this.sprite.texture.update();
		}

		var frame = this.spriteSheet.getFrame(this.animation, time - this.animStartTime);
		this.sprite.texture.frame = frame.rect;
		this.sprite.position.x = this.position.x - (frame.origin[0] * this.sprite.scale.x);
		this.sprite.position.y = this.position.y - (frame.origin[1] * this.sprite.scale.y);
	}
})