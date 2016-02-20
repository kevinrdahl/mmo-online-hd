var AnimatedSprite = Class({
	constructor: function(animSet, parts, colorMap) {
		this.animSet = animSet;
		this.parts = parts;
		this.colorMap = colorMap;
		this.texture = null;
		this.atlas = {}; //lists starting y of each animation
	},

	cleanup: function() {
		if (this.texture !== null) {
			this.texture.destroy();
			this.texture = null;
			this.atlas = {};
		}
	},

	render: function() {
		console.time('AnimatedSprite.render()');
		this.cleanup();

		var dimensions = this.getDimensions();
		var numFrames, anim, frame;
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		canvas.width = dimensions[0];
		canvas.height = dimensions[1];

		var x = 0, y = 0;
		var point, attached, image, partVersion, drawX, drawY, frameOrigin, altNum, altStar, colorMap;

		var partColorMaps = {};

		//loops!
		var animName, t, i, j, len1, len2, len3;

		//for each animation(row)
		for (animName in this.animSet) {
			x = 0;
			anim = this.animSet[animName];

			//for each frame(column)
			len1 = anim.frames.length;
			for (t = 0; t < len1; t++) {
				frame = anim.frames[t];
				if (frame.origin)
					frameOrigin = frame.origin;
				else
					frameOrigin = [0,0];

				//for each attachment point in the animation...
				len2 = frame.points.length;
				for (i = 0; i < len2; i++) {
					point = frame.points[i];
					altNum = point.name + animName + t;
					altStar = point.name + animName + '*';
					
					//get list of parts attached to it
					attached = this.parts[point.name];

					if (typeof attached === 'undefined')
						continue;

					//draw each of those parts
					len3 = attached.length;
					for (j = 0; j < len3; j++) {
						if (altNum in attached[j].part)
							partVersion = attached[j].part[altNum];
						else if (altStar in attached[j].part)
							partVersion = attached[j].part[altStar];
						else
							partVersion = attached[j].part.basic;

						colorMap = this.getPartColorMap(attached[j].part, partColorMaps);
						image = recolorManager.getImage(partVersion.image, colorMap);
						//image = resources[partVersion.image].texture.baseTexture.source;

						drawX = x + frameOrigin[0] + point.x - partVersion.attach[0];
						drawY = y + frameOrigin[1] + point.y - partVersion.attach[1];

						if (attached[j].offset) {
							drawX += attached[j].offset[0];
							drawY += attached[j].offset[1];
						}

						//FINALLY DRAW
						ctx.drawImage(image, drawX, drawY);
					}
				}

				x += anim.gridSize[0];
			}
			this.atlas[animName] = y;
			y += anim.gridSize[1];
		}

		this.texture = PIXI.Texture.fromCanvas(canvas);
		console.timeEnd('AnimatedSprite.render()');
		console.log('Final size ' + this.texture.width + 'x' + this.texture.height);
	},

	getPartColorMap: function(part, mapList) {
		var map = mapList[part.name];
		if (map)
			return map;

		map = {from:[], to:[]};
		if (this.colorMap === null)
			return map;

		var to;
		for (var colorName in part.colors) {
			to = this.colorMap[colorName];
			if (!to)
				continue;
			map.from.push(part.colors[colorName]);
			map.to.push(to);
		}

		mapList[part.name] = map;
		return map;
	},

	//return widest anim, and sum of height
	getDimensions: function() {
		var width = 0;
		var height = 0;
		var anim, animWidth;
		for (var animName in this.animSet) {
			anim = this.animSet[animName];
			height += anim.gridSize[1];
			animWidth = anim.gridSize[0] * anim.frames.length;
			if (animWidth > width)
				width = animWidth;
		}

		return [width, height];
	},

	getFrame: function(animName, time) {
		var anim = this.animSet[animName];
		var frame;
		time = time % anim.fullDuration;
		var x = -1;
		var y = this.atlas[animName];
		while (time >= 0) {
			x += 1;
			time -= anim.frames[x].duration;
		}
		frame = anim.frames[x];
		x *= anim.gridSize[0];

		return {
			rect: new PIXI.Rectangle(x,y, anim.gridSize[0], anim.gridSize[1]),
			origin: frame.origin,
			sound: frame.sound
		};
	}
});