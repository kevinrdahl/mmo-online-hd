/**
 * Created by Kevin on 31/01/2015.
 */
var ws = require('ws');
var game = require('./game/game');


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
        console.log(id + ' DISCONNECTED');
    };

    this.onMessage = function(id, data) {
        console.log(id + ': ' + data);
    };

    this.sendMessage = function(id, message) {
        if (typeof this.clients[id] !== 'undefined') {
            try {
                this.clients[id].send(message);
            } catch (e) {
                //nop
            }
        }
    };
};

var server = new Server(8999);
