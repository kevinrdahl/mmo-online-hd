var Util = require('../game/mmoo-util');

var pool = new Util.IdPool('01');
var ids = [];

console.log("Get ten ids")
for (var i = 0; i < 10; i++) {
	ids.push(pool.get());
}
console.log(JSON.stringify(ids));

console.log("\nGive back the last five");
for (var i = 0; i < 5; i++) {
	pool.relinquish(ids.pop());
}
console.log(JSON.stringify(ids));

console.log("\nGet ten more")
for (var i = 0; i < 10; i++) {
	ids.push(pool.get());
}
console.log(JSON.stringify(ids));