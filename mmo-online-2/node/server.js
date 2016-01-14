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



GLOBAL.settings = JSON.parse(fs.readFileSync('./config/settings.json', 'utf8'));
var CONN_WS = 0;
var CONN_TCP = 1;

var Server = Class({
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

        console.log('Connecting to database...');
        this.dao = new Data.DAO(this.dbConfig);
        this.dao.connect(function() {
            _this.onDbConnect();
        });
    },

    tonDbConnect: function() {
        var _this = this;

        console.log('Connected!');
        this.getGameData(function() {
            _this.startComms();
            _this.startGame();
        });
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
        this.game = new game.Game(this);
        this.game.start();

        console.log('\n' + this.bannerText + '\n');
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
            console.log('PROBLEM!');
        }

    },

    onDisconnect: function(id) {
        delete this.clients[id];
        this.game.onDisconnect(id);
        console.log(id + ' DISCONNECTED');
    },

    onMessage: function(id, data) {
        if (data === 'DEFS') {
            //send a big message with all basic communication info
            this.sendMessage(id, Messages.dict());
        } else {
            var msg = Messages.parse(data);
            if (msg == null) {
                console.log('ERROR parsing message "' + s + '" from client ' + id);
                return;
            }

            if (msg.type === Messages.TYPES.PING) {
                //just reply, server doesn't care about timing
                this.sendMessage(id, Messages.ping());
            } else if (msg.type === Messages.TYPES.SYNC) {
                //client is ready to connect to the game
                //pass it along
                this.game.onConnect(id);
            } else {
                this.game.onMessage(id, msg);
            }
        }
    },

    sendMessage: function(id, message) {
        //console.log('to ' + id + ': ' + message);
        if (typeof this.clients[id] !== 'undefined') {
            try {
                this.clients[id].send(message);
            } catch (e) {
                console.log(e);
                //nop
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

var server = new Server(GLOBAL.settings.port);
server.start();
