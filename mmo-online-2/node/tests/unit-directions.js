var Units = require('../game/units');

console.log('%s directions', Units.Unit.NUM_DIRECTIONS);

console.log('\n');
var angles = Units.Unit.DIRECTIONS;
var vectors = Units.Unit.DIRECTION_VECTORS;
for (var i = 0; i < angles.length; i++) {
	console.log('' + angles[i] + ': ' + JSON.stringify(vectors[i]));
}