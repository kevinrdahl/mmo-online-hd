var Characters = {};
module.exports = Characters;

var jsface = require("jsface"),
    Class  = jsface.Class,
    extend = jsface.extend,
    LinAlg = require('../../www/js/linalg'),
    MMOOUtil = require('./mmoo-util');

Characters.Character = Class({
	constructor: function(name) {
		this.name = name;
	}
});

Characters.fromJSON = function(name, json) {
	var obj;

	if (!MMOOUtil.isValidCharacterName(name))
		return null;

	try {
		obj = JSON.parse(json);
	} catch (e) {
		return null;
	}


	return new Characters.Character(name);
};