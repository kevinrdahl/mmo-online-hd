var Interpolation = function() {};

Interpolation.linear = function(x1, x2, progress) {
	return x1 + (x2-x1)*progress;
};