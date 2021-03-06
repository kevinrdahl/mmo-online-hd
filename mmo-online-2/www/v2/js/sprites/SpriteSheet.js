var SpriteSheet = Class({
	constructor: function(animSet, parts, colorMap) {
		this.animSet = animSet;
		this.parts = parts;
		this.colorMap = colorMap;
		this.canvas = document.createElement('canvas');
		this.atlas = {}; //lists starting y of each animation
		this.version = 0;

		this.x = 0;
		this.y = 0;
	},

	render: function() {
		this.atlas = {};
		console.time('SpriteSheet.render()');

		var dimensions = this.getDimensions();
		var numFrames, anim, frame;
		var canvas = this.canvas;
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
						image = game.recolorManager.getImage(partVersion.image, colorMap);

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

		this.version += 1;

		//this.texture = PIXI.Texture.fromCanvas(canvas);
		console.timeEnd('SpriteSheet.render()');
		console.log('Final size ' + canvas.width + 'x' + canvas.height);
	},

	getPartColorMap: function(part, mapList) {
		var map = mapList[part.name];
		if (map)
			return map;

		map = {from:[], to:[]};
		if (this.colorMap === null)
			return map;

		//want 'to' to always be in the same order, so identical calls always have the same key
		//otherwise, object keys are iterated in definition order
		var to;
		var colorNames = Object.keys(part.colors);
		var colorName;
		colorNames.sort();
		for (var i = colorNames.length; i >= 0; i--) {
			colorName = colorNames[i];
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

	//origin is 0,0 of the image, under the assumption that it is 24x24
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

function testSpriteSheets() {
	var testColors = ['White', 'Red', 'Yellow', 'Blue', 'Green', 'Turquoise', 'Majenta', 'Black', 'Grey', 'Brown', 'LightGreen'];
	var skins = ['Fair', 'Olive', 'SunTouched', 'Cocoa', 'Ebony', 'Slate', 'LapisLazuli', 'Emerald'];
	var testSprites = [];
	var spriteSheets = [];

	var animSet = Animations.man;
	var partList = {
        head:[
            {part:Parts.Heads.Human},
            {part:Parts.Hats.WizHood}
        ],
        body:[{part:Parts.Bodies.Human}],
        handleft:[{part:Parts.Hands.Hand}],
        handright:[{part:Parts.Hands.Hand}],
        weaponright:[{part:Parts.Weapons.Staff, offset:[-2,1]}],
        footleft:[{part:Parts.Feet.Boot}],
        footright:[{part:Parts.Feet.Boot}]
    };

	var colorMap = {};
    applyMaterial(colorMap, Materials.Metals.Steel, 'rightMat');
    applyMaterial(colorMap, Materials.Metals.Steel, 'leftMat');
    applyMaterial(colorMap, Materials.Skins.Olive, 'skin');
    applyMaterial(colorMap, Materials.Hairs.Chestnut, 'hair');
    applyMaterial(colorMap, Materials.Clothing.Black, 'foot');
    applyMaterial(colorMap, Materials.Woods.Ash, 'rightMat');
    colorMap.cloakHem = Materials.Metals.Gold.Light;
    colorMap.cloakClasp = Materials.Metals.Gold.Light;
    colorMap.hatMat2 = Materials.Metals.Gold.Light;
    colorMap.belt = Materials.Clothing.Black[''];

	var color, spriteSheet, spr;
	for (var i = 0; i < testColors.length; i++) {
		color = testColors[i];
		applyMaterial(colorMap, Materials.Clothing[color], 'hatMat');
	    applyMaterial(colorMap, Materials.Clothing[color], 'body');
	    applyMaterial(colorMap, Materials.Clothing[color], 'cloak');
	    applyMaterial(colorMap, Materials.Skins[skins[i%skins.length]], 'skin');

	    spriteSheet = new SpriteSheet(animSet, partList, colorMap);
	    spriteSheet.render();
	    spr = new PIXI.Sprite(spriteSheet.texture);
	    spr.scale.x = -2;
	    spr.scale.y = 2;
	    spr.position.x = 96 + 72*i;
	    spr.position.y = 144 + i * (48/testColors.length);
	    game.stage.addChild(spr);
	    testSprites.push(spr);
	    spriteSheets.push(spriteSheet);
	}

    setInterval(function() {
    	var frame, spr;
    	for (var i = 0; i < testSprites.length; i++) {
    		spr = testSprites[i];
    		frame = spriteSheets[i].getFrame('walkhold', Date.now() + 100*i);
    		spriteSheets[i].texture.frame = frame.rect;
    	}
    },
    50);
}