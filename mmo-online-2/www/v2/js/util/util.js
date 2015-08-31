var MmooUtil = {};

MmooUtil.shallowClone = function(o) {
	var r = {};
	for (var prop in o) {
		r[prop] = o[prop];
	}
	return r;
}