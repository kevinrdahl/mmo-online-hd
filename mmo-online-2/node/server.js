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
var MMOOUtil = require('./game/mmoo-util');
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

        console.log('Connecting to database...');
        this.dao = new Data.DAO(this.dbConfig);
        this.dao.connect(function() {
            _this.onDbConnect();
        });
    },

    onDbConnect: function() {
        var _this = this;

        console.log('Connected to database!');

        this.getGameData(function() {
            _this.startComms();
            _this.startGame();
        });
    },

    startComms: function() {
        var _this = this;

        this.wsServer = new ws.Server({port:GLOBAL.settings.wsPort});
        this.wsServer.on("connection", function(connection){
            client.connectionType = CONN_WS; 
            _this.onConnection(connection);
        });

        console.log('WebSocket server running on port ' + GLOBAL.settings.wsPort);

        this.tcpServer = net.createServer(function(socket) {
            var connection = new TCP.tcpClient(socket);
            connection.connectionType = CONN_TCP;
            _this.onConnection(connection);
        }).listen(GLOBAL.settings.tcpPort);
    },

    startGame: function() {
        console.log('\n' + this.bannerText + '\n');
        this.game = new game.Game(this, "Game 1");
        this.game.start();
    },

    onConnection: function(connection) {
        var _this = this;

        var client = new Servers.Client(connection);
        this.clients[client.id] = client;

        if (connection.connectionType == CONN_WS) {
            connection.on('close', function() {_this.onDisconnect(client)});
            connection.on('message', function(data) {_this.onMessage(client, data)});
            console.log(id + ' CONNECTED (WS)');
        } else if (connection.connectionType == CONN_TCP) {
            connection.onMessage = function(data) {_this.onMessage(client, data)};
            connection.onDisconnect = function(){_this.onDisconnect(client)};
            console.log(id + ' CONNECTED (TCP)');
        } else {
            console.log('CONNECTION PROBLEM!');
        }

        //send handshake
        client.send(new Messages.Handshake().serialize());
    },

    onDisconnect: function(client) {
        client.connected = false;
        delete this.clients[client.id];
        this.game.onDisconnect(client);
        console.log(client.id + ' DISCONNECTED');
    },

    onMessage: function(client, data) {
        var msg = Messages.parse(data);
        if (msg == null) {
            console.log('ERROR parsing message "' + data + '" from client ' + client.id);
            return;
        }

        switch(msg.type) {
            case Messages.TYPES.PING:
                this.sendString(client, Messages.PING);
                break;

            case Messages.TYPES.USER:
                this.onUserMessage(client, msg);
                break;

            case Messages.TYPES.WORLD:
                this.onWorldMessage(client, msg);
                break;

            default:
                if (client.game !== null)
                    client.game.onMessage(client, msg);
        }
    },

    onUserMessage: function(client, msg) {
        if (!Messages.assertParams(msg, client.id, ['action', 'name', 'password']))
            return;

        var action = msg.params.action;

        if (action === 'login') {
            console.log('Client ' + client.id + ' attempting login as "' + msg.name + '"');
            this.dao.tryLogin(client, msg.name, msg.password, this.onLoginAttempt);
        } else if (action === 'create') {
            if (MMOOUtil.isValidPlayerName(msg.name)) {
                console.log('Client ' + client.id + ' attempting to create user "' + msg.name + '"');
                this.dao.tryCreateUser(client, msg.name, msg.password, this.onCreateUserAttempt);
            }
        }
    },

    onWorldMessage: function(client, msg) {
        if (client.username === null || !Messages.assertParams(msg, client.id, ['action']))
            return;

        var action = msg.params.action;

        if (action === 'get') {
            client.send(new Messages.WorldList([this.game]).serialize());
        } else if (action === 'join') {
            this.game.onConnect(client);
        }
    },

    onLoginAttempt: function(client, success, name) {
        var response = new Messages.Message(Messages.TYPES.USER, {action:'login', success:false, name:name});

        if (success) {
            console.log('Client ' + client.id + ' logged in as "' + name + '"');
            client.username = name;
            response.params.success = true;
        } else {
            console.log('Client ' + client.id + ' failed to log in as "' + name + '"');
        }

        client.send(reponse.serialize());
    },

    onCreateUserAttempt: function(client, success, name) {
        if (success) {
            console.log('Client ' + client.id + ' created user "' + name + '"');
            this.onLoginAttempt(client, true, name);
        } else {
            console.log('Client ' + client.id + ' failed to create user "' + name + '"');
        }
    },

    sendString: function(id, s) {
        //console.log('to ' + id + ': ' + s);
        if (typeof this.clients[id] !== 'undefined') {
            this.clients[id].send(s);
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

Servers.Client = Class({
    $static: {
        count:0
    },

    constructor: function(connection) {
        this.id = (Servers.Client.count++).toString();
        this.connection = connection;
        this.username = null;
        this.game = null;
        this.connected = true;
    },

    send: function(s) {
        try {
            this.connection.send(s);
        } catch (e) {
            console.log("SEND ERROR");
            console.log(e);
        }
    }
})