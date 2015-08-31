var Tweens = {};

/*
t = Start time
b = Start value
c = Final Change
d = Duration
*/

Tweens.linear = function (t, b, c, d) {
	return c*t/d + b;
};

Tweens.easeInQuad = function (t, b, c, d) {
	t /= d;
	return c*t*t + b;
};

Tweens.easeOutQuad = function (t, b, c, d) {
	t /= d;
	return -c * t*(t-2) + b;
};

Tweens.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

Tweens.easeInCubic = function (t, b, c, d) {
	t /= d;
	return c*t*t*t + b;
};

Tweens.easeOutCubic = function (t, b, c, d) {
	t /= d;
	t--;
	return c*(t*t*t + 1) + b;
};

Tweens.easeInOutCubic = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t + b;
	t -= 2;
	return c/2*(t*t*t + 2) + b;
};

Tweens.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};

Tweens.easeOutQuart = function (t, b, c, d) {
	t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};

Tweens.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};

Tweens.easeInQuint = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t*t + b;
};

Tweens.easeOutQuint = function (t, b, c, d) {
	t /= d;
	t--;
	return c*(t*t*t*t*t + 1) + b;
};

Tweens.easeInOutQuint = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t*t + b;
	t -= 2;
	return c/2*(t*t*t*t*t + 2) + b;
};

Tweens.easeInSine = function (t, b, c, d) {
	return -c * Tweens.cos(t/d * (Tweens.PI/2)) + c + b;
};

Tweens.easeOutSine = function (t, b, c, d) {
	return c * Tweens.sin(t/d * (Tweens.PI/2)) + b;
};

Tweens.easeInOutSine = function (t, b, c, d) {
	return -c/2 * (Tweens.cos(Tweens.PI*t/d) - 1) + b;
};

Tweens.easeInExpo = function (t, b, c, d) {
	return c * Tweens.pow( 2, 10 * (t/d - 1) ) + b;
};

Tweens.easeOutExpo = function (t, b, c, d) {
	return c * ( -Tweens.pow( 2, -10 * t/d ) + 1 ) + b;
};

Tweens.easeInOutExpo = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2 * Tweens.pow( 2, 10 * (t - 1) ) + b;
	t--;
	return c/2 * ( -Tweens.pow( 2, -10 * t) + 2 ) + b;
};

Tweens.easeInCirc = function (t, b, c, d) {
	t /= d;
	return -c * (Tweens.sqrt(1 - t*t) - 1) + b;
};

Tweens.easeOutCirc = function (t, b, c, d) {
	t /= d;
	t--;
	return c * Tweens.sqrt(1 - t*t) + b;
};

Tweens.easeInOutCirc = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return -c/2 * (Tweens.sqrt(1 - t*t) - 1) + b;
	t -= 2;
	return c/2 * (Tweens.sqrt(1 - t*t) + 1) + b;
};