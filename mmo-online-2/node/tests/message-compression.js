var Messages = require('../game/messages');
var lzString = require("lz-string");

/*var handshake = new Messages.Handshake();
var s = handshake.serialize();

console.log("Serialized handshake:");
console.log(s);

console.log("\nTry to read it back:")
var msg = Messages.parse(s);
console.log(JSON.stringify(msg));*/

function writePrettyJSON(obj) {
	console.log(JSON.stringify(obj, null, 2));
}

function writeLine() {
	console.log('=================================================');
}

function showSize(s, label) {
	console.log('\n%s:\n%s\n%d chars', label, s, s.length);
}

function test(obj) {
	writeLine();
	writePrettyJSON(obj);

	var s;
	var method;
	var compressed;

	s = JSON.stringify(obj);
	showSize(s, 'JSON');

	if (obj instanceof Messages.Message) {
		s = obj.serialize();
		method = 'Serialized';
	} else {
		s = Messages.abbreviate(obj);
		method = 'Abbreviated';
	}
	showSize(s, method);
	compressed = lzString.compressToUTF16(s);
	showSize(compressed, 'lz-string');
}

/*test({
	unit:{
		position:[100,100],
		attackDamage:10
	},
	direction:2,
	password:"wow!"
});*/

//running for a week
//absurd number of units
var msg = new Messages.UnitMove(12096000, 'abc', 4, [1000000, 500000]);
//var msg = new Messages.UnitAttack(12096000, 'abc', 'abcd');

test(msg);

console.log();
writeLine();
console.log('PERFORMANCE')
writeLine();
var count = 10000;
var plain = msg.serialize();
var o;

console.log('Stringify and parse message %d times.', count);
var startTime = Date.now();
for (var i = 0; i < count; i++) {
	s = JSON.stringify(msg);
	o = JSON.parse(s);
}
var endTime = Date.now();
console.log('%d ms, %d chars each', endTime - startTime, s.length);

console.log('\nSerialize and parse message %d times.', count);
startTime = Date.now();
for (var i = 0; i < count; i++) {
	s = msg.serialize();
	o = Messages.parse(s);
}
endTime = Date.now();
console.log('%d ms, %d chars each', endTime - startTime, s.length);

console.log('\nCompress and read serialized message %d times.', count);
startTime = Date.now();
for (var i = 0; i < count; i++) {
	s = lzString.compressToUTF16(plain);
	s2 = lzString.decompressFromUTF16(s);
}
endTime = Date.now();
console.log('%d ms, %d chars each', endTime - startTime, s.length);