/**
 * Created by Kevin on 31/01/2015.
 */
var ws = require('ws');
var game = require('./game/game');
var Messages = require('./game/messages');


var Server = function(port) {
    var _this = this;
    this.port = port;
    this.clients = {};
    this.clientNum = 0;

    this.wsServer = new ws.Server({port:port});
    this.wsServer.on("connection", function(client){_this.onConnection(client);} );

    this.game = new game.Game(function(id, message){
        _this.sendMessage(id, message);
    });
    this.game.start();

    console.log('Server running on port ' + port);

    this.onConnection = function(client) {
        var _this = this;

        var id = (this.clientNum++).toString();
        this.clients[id] = client;
        client.id = id;
        client.on('close', function() {_this.onDisconnect(this.id)});
        client.on('message', function(data) {_this.onMessage(this.id, data)});

        console.log(id + ' CONNECTED');
    };

    this.onDisconnect = function(id) {
        delete this.clients[id];
        this.game.onDisconnect(id);
        console.log(id + ' DISCONNECTED');
    };

    this.onMessage = function(id, data) {

        var msg = Messages.expand(data);
        /*try {
            msg = Messages.expand(data);
        } catch (e) {
            console.log('ERROR: malformed message from ' + id + ', "' + data + '"');
            return;
        }*/

        if (msg.type === 'dict') {
            this.sendMessage(id, Messages.dict());
        } else if (msg.type === 'sync') {
            this.game.onConnect(id);
        } else if (msg.type === 'ping') {
            this.sendMessage(id, Messages.ping());
        } else {
            this.game.onMessage(id, msg);
        }
    };

    this.sendMessage = function(id, message) {
        //console.log('to ' + id + ': ' + message);
        if (typeof this.clients[id] !== 'undefined') {
            try {
                this.clients[id].send(message);
            } catch (e) {
                console.log(e);
                //nop
            }
        }
    };
};

var server = new Server(8999);
