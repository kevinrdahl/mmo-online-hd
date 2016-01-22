var Util = require('../game/mmoo-util');

var names = [
	'Bob',
	'bob',
	'B',
	'Bob Johnson',
	'Bob johnson',
	'Bob B',
	'Bob Is The Man',
	'Kal-El',
	'Kal-el',
	'Space -Dash',
	'Dash- Space',
	'Trailing ',
	'Trailing-',
	' Leading',
	'-Leading'
];

for (var i = 0; i < names.length; i++) {
	console.log(names[i] + ':  ' + Util.isValidPlayerName(names[i]));
}