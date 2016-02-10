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

MmooUtil.noop = function() {};