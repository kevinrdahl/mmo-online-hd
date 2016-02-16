var MmooUtil = {};

MmooUtil.shallowClone = function(o) {
	var r = {};
	for (var prop in o) {
		r[prop] = o[prop];
	}
	return r;
};

MmooUtil.applyProps = function(obj, props, onlyNew) {
	if (typeof props === 'undefined')
		return

	for (var propName in props) {
		if (!onlyNew || typeof obj[propName] === 'undefined') {
			obj[propName] = props[propName];
		}
	}
};

MmooUtil.chooseRandom = function(list) {
	return list[Math.floor(Math.random() * list.length)];
};

//takes equal-sized list of cumulative probabilities (final should be 1, otherwise might return element 0)
MmooUtil.chooseRandomCumulative = function(list, probs) {
	var roll = Math.random();
	for (var i = 0; i < probs.length; i++) {
		if (roll < probs[i])
			return list[i];
	}

	return list[0];
};

MmooUtil.chooseRandomWeighted = function(list, weights) {
	var total = 0;
	var sum = 0;
	var i;
	var probs = [];
	for (i = 0; i < weights.length; i++) {
		total += weights[i];
	}

	for (i = 0; i < weights.length; i++) {
		sum += weights[i] / total;
		probs.push(sum);
	}

	return MmooUtil.chooseRandomCumulative(list, probs);
};

MmooUtil.randomInt = function(min, max) {
	if (typeof max === 'undefined') {
		max = min;
		min = 0;
	}
	return Math.floor(Math.random() * (max - min)) + min;
};

MmooUtil.noop = function() {};

MmooUtil.colorString = function(color) {
	var s = color.toString(16);
	var s2 = '#';
	for (var i = 0; i < s.length-6; i++) {
		s2 += '0';
	}
	return s2+s;
}

MmooUtil.createFontDef = function(options) {
	var font = (typeof options.font !== 'undefined') ? options.font : UIConfig.fontName;
	var size = (typeof options.size !== 'undefined') ? options.size : UIConfig.fontSize;
	var color = (typeof options.color !== 'undefined') ? options.color : UIConfig.fontColor;

	var s = (options.bold) ? 'bold ' : '';
	return {
		fill: MmooUtil.colorString(color),
		font: s + size + 'px ' + font
	};
}