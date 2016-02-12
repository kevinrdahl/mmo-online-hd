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

MmooUtil.randomInt = function(min, max) {
	if (typeof max === 'undefined') {
		max = min;
		min = 0;
	}
	return Math.floor(Math.random() * (max - min)) + min;
};

MmooUtil.noop = function() {};