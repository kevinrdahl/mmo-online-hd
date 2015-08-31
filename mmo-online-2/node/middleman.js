/**
 * Created by Kevin on 24/01/2015.
 */

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 8999});

var clients = {};
var clientNum = 1;

wss.on('connection', function (socket) {
    var id = clientNum++;
    socket.id = id.toString();
    console.log(socket.id + ' CONNECTED');

    socket.on('message', onMessage);
    socket.on('close', onClose);

    clients[id] = socket;

    sendTCPMessage("+", id);
});

function onMessage(data) {
    console.log("From " + this.id + ': ' + data);

    sendTCPMessage(data, this.id);
}

function onClose() {
    delete clients[this.id];
    sendTCPMessage("-", this.id);

    console.log(this.id + ' DISCONNECTED');
}

function wsBroadcast(msg) {
    for (var id in clients) {
        try {
            clients[id].send(msg);    
        } catch (e) {
            console.log("Broadcast error on client " + id + ": " + e);
        }
        
    }
}

console.log('WebSocket server listening on port 8999');

/*var ws_cfg = {
  ssl: true,
  port: 8080,
  ssl_key: './config/ssl/id_rsa',
  ssl_cert: './path/to/ssl.crt'
};

var processRequest = function(req, res) {
    console.log("Request received.")
};

var httpServ = require('https');
var app = null;

app = httpServ.createServer({
  key: fs.readFileSync(ws_cfg.ssl_key),
  cert: fs.readFileSync(ws_cfg.ssl_cert)
}, processRequest).listen(ws_cfg.port);

//var WebSocketServer = require('ws').Server, ws_server = new WebSocketServer(ws_cfg);

var WebSocketServer = require('ws').Server, ws_server = new WebSocketServer( {server: app});*/


/*=======
=  TCP  =
=======*/
var net = require('net');
var connection = null;

var bytesExpected = 0;
var bytesInBuffer = 0;
var buffer = new Buffer(4);

var TCPServer = net.createServer(function (c) {
    connection = c;
    connection.setNoDelay(true);

    //connection.setEncoding('utf8');
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
    readFromBuffer(data, 0);
}

function onTCPMessageRead(buf) {
    var userId = buf.readUInt32LE(0);
    var msg = buffer.toString('utf8', 4);

    if (userId in clients) {
        console.log("To " + userId + ": " + msg);
        try {
            clients[userId].send(msg);
        } catch (e) {
            console.log("Failed! " + e);
        }
    } else if (userId == 0) {
        console.log("To ALL: " + msg);
        wsBroadcast(msg);
    }

    
}

function readFromBuffer (buf, offset) {
    var toRead;

    if (bytesExpected == 0) {
        toRead = Math.min(4-bytesInBuffer, buf.length-offset);
        buf.copy(buffer, bytesInBuffer, offset, offset+toRead);
        offset += toRead;
        bytesInBuffer += toRead;

        if (bytesInBuffer == 4) {
            bytesExpected = buffer.readUInt32LE(0);
            bytesInBuffer = 0;
            buffer = new Buffer(bytesExpected);
        }
    } else {
        toRead = Math.min(bytesExpected-bytesInBuffer, buf.length-offset);
        buf.copy(buffer, bytesInBuffer, offset, offset+toRead);
        offset += toRead;
        bytesInBuffer += toRead;

        if (bytesInBuffer == bytesExpected) {
            /*var s = buffer.toString('utf8');
            console.log('TCP: ' + s);
            wsBroadcast(s);*/
            onTCPMessageRead(buffer);
            buffer = new Buffer(4);

            bytesExpected = 0;
            bytesInBuffer = 0;
        }
    }

    if (offset < buf.length) {
        readFromBuffer(buf, offset);
    }
}

function onTCPError (e) {
    console.log('TCP Connection Lost');
    connection = null;
}

TCPServer.listen(9001, "localhost", function() {
    console.log ('TCP server listening on port 9001');
});

function sendTCPMessage(msg, userId) {
    if (connection == null)
        return;


    userId = userId | 0;
    var msgBuf = new Buffer(msg, 'utf8');
    var buf = new Buffer(8 + msgBuf.length);
    buf.writeUInt32LE(msgBuf.length+4, 0);
    buf.writeUInt32LE(userId, 4);
    msgBuf.copy(buf, 8);

    connection.write(buf);
}