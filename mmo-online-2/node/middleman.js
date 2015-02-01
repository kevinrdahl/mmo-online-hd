/**
 * Created by Kevin on 24/01/2015.
 */
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 8999});

var clients = {};
var clientNum = 0;

wss.on('connection', function (socket) {
    var id = clientNum++;
    socket.id = id.toString();
    console.log(socket.id + ' CONNECTED');

    socket.on('message', onMessage);
    socket.on('close', onClose);
    socket.sentState = false;

    socket.orders = [];
    clients[id] = (socket);
});

function onMessage(data) {
    data = data.replace('\n', '');
    try {
        var msg = JSON.parse(data);
    } catch (e) {
        return;
    }

    console.log(this.id + ': ' + data);

    sendTCPMessage(data);
}

function onClose() {
    delete clients[this.id];

    console.log(this.id + ' DISCONNECTED');
}

console.log('WebSocket server listening on port 8999');


/*=======
=  TCP  =
=======*/
var net = require('net');
var connection = null;
var TCPServer = net.createServer(function (c) {
    connection = c;

    connection.setEncoding('utf8');
    connection.on('end', onTCPDisconnect);
    connection.on('data', onTCPMessage);
    connection.on('error', onTCPError);

    console.log('TCP Connection Established!');
    sendTCPMessage("Node reporting in.");
});

function onTCPDisconnect () {
    console.log('TCP Connection Ended');
    connection = null;
}

function onTCPMessage (data) {
    var messages = data.split('\n');
    for (var i = 0; i < messages.length-1; i++) {
        console.log('TCP: ' + messages[i]);
        for (var name in clients) {
            clients[name].send(messages[i]);
        }
    }
}

function onTCPError (e) {
    console.log('TCP Connection Lost');
    connection = null;
}

TCPServer.listen(9001, function() {
    console.log ('TCP server listening on port 9001');
});

function sendTCPMessage(msg) {
    connection.write(msg + '\n');
}