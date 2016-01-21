/**
 * Created by Kevin on 31/01/2015.
 */
var ws = require('ws');
var fs = require('fs');
var net = require('net');
var jsface = require("jsface"),
    Class  = jsface.Class,
    extend = jsface.extend;

var Data = require('./data');
var game = require('./game/game');
var Messages = require('./game/messages');
var TCP = require('./tcp');

var Servers = {};
module.exports = Servers;

var CONN_WS = 0;
var CONN_TCP = 1;

Servers.Server = Class({
    constructor: function() {
        this.clients = {};
        this.clientNum = 0;
    },

    start: function() {
        var _this = this;

        console.log('Reading config files...');
        this.dbConfig = JSON.parse(fs.readFileSync('./config/db.json', 'utf8'));
        this.bannerText = fs.readFileSync('./config/banner.txt', 'utf8');
        console.log('Done!');

        /*console.log('Connecting to database...');
        this.dao = new Data.DAO(this.dbConfig);
        this.dao.connect(function() {
            _this.onDbConnect();
        });*/
        this.onDbConnect();
    },

    onDbConnect: function() {
        var _this = this;

        console.log('Connected!');
        //this.getGameData(function() {
            _this.startComms();
            _this.startGame();
        //});
    },

    startComms: function() {
        var _this = this;

        this.wsServer = new ws.Server({port:GLOBAL.settings.wsPort});
        this.wsServer.on("connection", function(client){
            client.clientType = CONN_WS; 
            _this.onConnection(client);
        });

        console.log('WebSocket server running on port ' + GLOBAL.settings.wsPort);

        this.tcpServer = net.createServer(function(socket) {
            var client = new TCP.tcpClient(socket);
            client.clientType = CONN_TCP;
            _this.onConnection(client);
        }).listen(GLOBAL.settings.tcpPort);
    },

    startGame: function() {
        console.log('\n' + this.bannerText + '\n');
        this.game = new game.Game(this, "Game 1");
        this.game.start();
    },

    onConnection: function(client) {
        var _this = this;

        var id = (this.clientNum++).toString();
        this.clients[id] = client;
        client.id = id;

        if (client.clientType == CONN_WS) {
            client.on('close', function() {_this.onDisconnect(this.id)});
            client.on('message', function(data) {_this.onMessage(this.id, data)});
            console.log(id + ' CONNECTED (WS)');
        } else if (client.clientType == CONN_TCP) {
            client.onMessage = function(data) {_this.onMessage(this.id, data)};
            client.onDisconnect = function(){_this.onDisconnect(this.id)};
            console.log(id + ' CONNECTED (TCP)');
        } else {
            console.log('CONNECTION PROBLEM!');
        }

        //send handshake
        this.sendString(id, new Messages.Handshake().serialize());
    },

    onDisconnect: function(id) {
        delete this.clients[id];
        this.game.onDisconnect(id);
        console.log(id + ' DISCONNECTED');
    },

    onMessage: function(clientId, data) {
        var msg = Messages.parse(data);
        if (msg == null) {
            console.log('ERROR parsing message "' + data + '" from client ' + clientId);
            return;
        }

        if (msg.type === Messages.TYPES.PING) {
            //just reply, server doesn't care about timing
            this.sendString(clientId, Messages.PING);
        } else if (msg.type == Messages.TYPES.GAMES) {
            //return a list of active games/worlds
            this.sendString(clientId, new Messages.GameList([this.game]).serialize());
        } else if (msg.type === Messages.TYPES.JOIN) {
            //client is ready to connect to a game
            //TODO: check whether that game exists (for now there's only 1 game)
            this.game.onConnect(clientId);
        } else {
            this.game.onMessage(clientId, msg);
        }
    },

    sendString: function(id, s) {
        //console.log('to ' + id + ': ' + s);
        if (typeof this.clients[id] !== 'undefined') {
            try {
                this.clients[id].send(s);
            } catch (e) {
                console.log(e);
            }
        }
    },

    getGameData: function(callback) {
        console.log('Retrieving game data...')
        var c = callback;
        this.dao.getGameData(function(data) {
            GLOBAL.gameData = data;
            c();
        });
    }
});

