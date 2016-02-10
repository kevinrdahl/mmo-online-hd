var MMOOUtil = {};
module.exports = MMOOUtil;

var jsface = require("jsface"),
    Class  = jsface.Class,
    extend = jsface.extend;
var regexp = require('node-regexp');

MMOOUtil.IdPool = Class({
	$static: {
		ALPHABET: '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~`!@#$%^&*()-_=+[]{}|;:<>,.?/'
	},

	constructor: function(alphabet) {
		this.alphabet = (typeof alphabet !== 'undefined') ? alphabet : MMOOUtil.IdPool.ALPHABET;
		this.indeces = [0];
		this.unused = [];
	},

	get: function() {
		if (this.unused.length > 0)
			return this.unused.pop();
		else
			return this.create();
	},

	relinquish: function(id, skipCheck) {
		if (skipCheck || this.unused.indexOf(id) === -1)
			this.unused.push(id);
	},

	create: function() {
		var id = '';

		for (var i = 0; i < this.indeces.length; i++) {
			id += this.alphabet[this.indeces[i]];
		}

		this.increment();
		return id;
	},

	increment: function() {
		var index = this.indeces.length-1;

		while (true) {
			this.indeces[index] += 1;
			if (this.indeces[index] == this.alphabet.length) {
				this.indeces[index] = 0;
				index -= 1;
				if (index < 0)
					this.indeces.unshift(0);
				else
					continue;
			}
			break;
		}
	}
});

//converts units/sec to units/tick
MMOOUtil.rateToDelta = function(rate) {
	return rate * (GLOBAL.settings.tickLen / 1000.0);
};

MMOOUtil.secondsToFrames = function(secs) {
	return Math.round(secs * 1000.0 / GLOBAL.settings.tickLen);
};

MMOOUtil.isValidCharacterName = function(name) {
	var re = new RegExp('^[A-Z][a-z]+(?:[\\s-\'][A-Z][a-z]+)?$');
	return name.length <= 15 && re.test(name);
};

MMOOUtil.isValidUserName = function(name) {
	var re = new RegExp('^[A-Za-z0-9]+(?:[\\s\\._-/\'][A-Za-z0-9]+)?(?:[\\s\\._-/\'][A-Za-z0-9]+)?$');
	return name.length <= 25 && re.test(name);
};