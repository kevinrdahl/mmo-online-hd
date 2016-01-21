var LinAlg = require('../../www/js/linalg');
var Units = require('./units'),
    Unit = Units.Unit;
var Orders = require('./orders');
var Messages = require('./messages');

var GameLogic = {};
module.exports = GameLogic;

GameLogic.setup = function(game) {
	console.log('Initializing world...');

	var unit1 = new Units.Unit(null, 'test', new LinAlg.Vector2(0,0));
	game.addUnit(unit1);
	unit1.issueOrder(new Orders.PointOrder(Messages.TYPES.MOVE, new LinAlg.Vector2(1000,1000)));

	var unit2 = new Units.Unit(null, 'test2', new LinAlg.Vector2(-2000,2000));
	game.addUnit(unit2);
	unit2.issueOrder(new Orders.UnitOrder(Messages.TYPES.ATTACK, unit1.id));
}

GameLogic.update = function(game) {
	var keys = Object.keys(game.units);
	var key, unit;

	//console.log('===== Step %d =====', game.currentStep);

	for (var i = 0; i < keys.length; i++) {
		key = keys[i];
		unit = game.units[key];


		//console.log(unit.id + ' ' + JSON.stringify(unit.position));

	}
}