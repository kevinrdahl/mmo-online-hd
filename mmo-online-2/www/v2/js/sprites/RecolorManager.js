/*
Since these images are only used on the fly, they can be discarded without
taking them away from something else.
*/
var RecolorManager = Class({
	constructor: function() {
		this.capacity = 50;
		this.images = {};
		this.queue = [];
	},

	/*
		colorMap = {from:[], to:[]}
	*/
	getImage: function(name, colorMap) {
		var image;
		var key = name + ':' + JSON.stringify(colorMap.to);
		
		image = this.images[key];
		if (typeof image === 'undefined')
			return this.createImage(name, colorMap, key);
		return image;
	},

	createImage: function(name, colorMap, key) {
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		var baseTex = resources[name].texture.baseTexture;
		var width = baseTex.width;
		var height = baseTex.height;
		canvas.width = width;
		canvas.height = height;
		ctx.clearRect(0, 0, width, height);
		ctx.drawImage(baseTex.source, 0, 0);

		var fromR = [];
		var toRGB = [];
		var len = colorMap.from.length;
		for (var i = 0; i < len; i++) {
			fromR.push(hexToRGB(colorMap.from[i])[0]); //assumes greyscale source
			toRGB.push(hexToRGB(colorMap.to[i]));
		}

		var imgData = ctx.getImageData(0, 0, width, height);
		var data = imgData.data;
		var x,y,red,toColor;
		for (x = 0; x < width; x++) {
			for (y = 0; y < height; y++) {
				red = (y*width + x)*4;
				toColor = toRGB[fromR.indexOf(data[red])];
				if (!toColor)
					continue;
				ctx.fillStyle = 'rgba(' + toColor[0] + ',' + toColor[1] + ',' + toColor[2] + ',1)';
				ctx.fillRect(x,y,1,1); //for some reason, this is the most consistently fast approach
			}
		}

		this.cacheImage(canvas, key);
		return canvas;
	},

	cacheImage: function(image, key) {
		this.images[key] = image;
		this.queue.push(key);
		if (this.queue.length > this.capacity)
			delete this.images(queue.shift());
	}
});

hexToRGB = function(hex){
    var r = hex >> 16;
    var g = hex >> 8 & 0xFF;
    var b = hex & 0xFF;
    return [r,g,b];
}