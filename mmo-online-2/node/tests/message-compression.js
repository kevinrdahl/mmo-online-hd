var Messages = require('../game/messages');

var handshake = new Messages.Handshake();
var s = handshake.serialize();

console.log("Serialized handshake:");
console.log(s);

console.log("\nTry to read it back:")
var msg = Messages.parse(s);
console.log(JSON.stringify(msg));