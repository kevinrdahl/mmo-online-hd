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
            connection.connectionType = CONN_WS; 
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
        this.game = new game.Game(this, "Nova", 1);
        this.game.start();
    },

    onConnection: function(connection) {
        var _this = this;

        var client = new Servers.Client(connection);
        this.clients[client.id] = client;

        if (connection.connectionType == CONN_WS) {
            connection.on('close', function() {_this.onDisconnect(client)});
            connection.on('message', function(data) {_this.onMessage(client, data)});
            console.log(client.id + ' CONNECTED (WS)');
        } else if (connection.connectionType == CONN_TCP) {
            connection.onMessage = function(data) {_this.onMessage(client, data)};
            connection.onDisconnect = function(){_this.onDisconnect(client)};
            console.log(client.id + ' CONNECTED (TCP)');
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
                this.onReceiveUserMessage(client, msg);

            default:
                if (client.game !== null)
                    client.game.onMessage(client, msg);
        }
    },

    onReceiveUserMessage: function(client, msg) {
        client.userMessages.push(msg);
        if (client.userMessages.length === 1) {
            this.processNextUserMessage(client);
        } else {
            console.log('Client ' + client.id + ' has ' + client.userMessages.length-1 + ' pending DAO messages, pushing to queue.');
        }
    },

    onCompleteUserMessage: function(client) {
        client.userMessages.shift();
        if (client.userMessages.length > 0) {
            this.processNextUserMessage(client);
        }
    },

    processNextUserMessage: function(client) {
        var msg = client.userMessages[0];
        var discard = true;
        var responded = false;
        var sendOK = false;
        var failReason = 'bad thing';

        if (Messages.assertParams(msg, client.id, ['action'])) {
            var _this = this;
            var action = msg.params.action;

            switch(action) {
                case 'loginUser':
                    if (!Messages.assertParams(msg, client.id, ['action', 'name', 'password'])) {
                        failReason = 'missing param';
                    } else if (client.userId !== null) {
                        failReason = 'already logged in';
                    } else {
                        discard = false;
                        this.dao.login(client, msg.name, msg.password, this.onUserLogin.bind(this));
                    }
                    break;

                case 'createUser':
                    if (!Messages.assertParams(msg, client.id, ['action', 'name', 'password'])) {
                        failReason = 'missing param';
                    } else if (client.userId !== null) {
                        failReason = 'already logged in';
                    } else if (!MMOO.isValidUserName(msg.params.name)) { 
                        failReason = 'invalid user name';
                    } else {
                        discard = false;
                        this.dao.createUser(client, msg.name, msg.password, this.onUserCreated.bind(this));
                    }
                    break;

                case 'getWorlds':
                    if (user.userId === null) {
                        failReason = 'not logged in';
                    } else {
                        discard = false;
                        client.send(new Messages.WorldList([this.game]).serialize());
                        responded = true;
                    }
                    break;

                case 'loginWorld':
                    if (!Messages.assertParams(msg, client.id, ['worldId'])) {
                        failReason = 'missing param';
                    } else if (user.userId === null) {
                        failReason = 'not logged in';
                    } else if (msg.params.worldId != 1) {
                        failReason = 'world doesn\'t exist';
                    } else {
                        discard = false;
                        sendOK = true;
                        responded = true;

                        client.worldId = msg.params.worldId;
                    }
                    break;

                case 'getCharacters':
                    if (!Messages.assertParams(msg, client.id, ['worldId'])) {
                        failReason = 'missing param';
                    } else if (client.userId === null) {
                        failReason = 'not logged in';
                    } else if (client.worldId === null) {
                        failReason = 'no world joined';
                    } else {
                        discard = false;
                        this.dao.getUserCharacters(client, this.onGetUserCharacters.bind(this));
                    }
                    break;

                case 'loginCharacter':
                    if (!Messages.assertParams(msg, client.id, ['characterId'])) {
                        failReason = 'missing param';
                    } else if (client.userId === null) {
                        failReason = 'not logged in';
                    } else if (client.worldId === null) {
                        failReason = 'no world joined';
                    } else if (client.characterId !== null) {
                        failReason = 'already playing a character';
                    } else {
                        discard = false;
                        this.dao.getCharacter(client, msg.params.characterId, this.onGetCharacter.bind(this));
                    }
                    break;

                case 'createCharacter':
                    if (!Messages.assertParams(msg, client.id, ['name', 'json'])) {
                        failReason = 'missing param';
                    } else if (client.userId === null) {
                        failReason = 'not logged in';
                    } else if (client.worldId === null) {
                        failReason = 'no world joined';
                    } else if (client.characterId !== null) {
                        failReason = 'already playing a character';
                    } else {
                        var character = Characters.fromJSON(msg.params.name, msg.params.json);
                        if (character === null) {
                            failReason = 'invalid character json';
                        } else {
                            discard = false;
                            this.dao.createCharacter(client, character.name, msg.params.json, this.onCreateCharacter.bind(this));
                        }
                    }
                    break;

                default:
                    failReason = 'invalid action';
                    discard = true;
            }
        } else {
            msg.params.action = 'none';
            failReason = 'no action';
            discard = true;
        }

        if (discard) {
            client.send(new Messages.UserResponse(msg.params.action, false, failReason).serialize());
            responded = true;
        } else if (sendOK) {
            client.send(new Messages.UserResponse(msg.params.action, true).serialize());
            responded = true;
        }

        if (responded) {
            this.onCompleteUserMessage(client);
        }
    },

    onUserLogin: function(client, results) {
        var response = new Messages.Message(Messages.TYPES.USER, {
            action:'login', 
            success:false
        });

        if (results !== null) {
            //success!
            client.userId = results.user_id;
            client.userName = results.name
            client.settings = JSON.parse(results.settings);

            response.params.success = true;
            response.params.settings = results.settings;
            response.params.name = results.name;

            console.log('Client ' + client.id + ' logged in as "' + results.name + '"');
        } else {
            console.log('Client ' + client.id + ' failed to log in.');
        }

        client.send(response.serialize());
        this.onCompleteUserMessage(client);
    },

    onUserCreated: function(client, success, name) {
        var response = new Messages.Message(Messages.TYPES.USER, {
            action:'create', 
            success:success
        });

        if (success) {
            console.log('Client ' + client.id + ' created user "' + name + '"');
        } else {
            console.log('Client ' + client.id + ' failed to create user.');
        }

        client.send(response.serialize());
        this.onCompleteUserMessage(client);
    },

    onGetUserCharacters: function(client, results) {
        var response = new Messages.Message(Messages.TYPES.CHARACTER, {
            action:'get', 
            characters:results
        });
        client.send(response.serialize());
        this.onCompleteUserMessage(client);
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
        this.userId = null;
        this.worldId = null;
        this.characterId = null;
        this.game = null;
        this.connected = true;

        //to avoid ordering shenanigans, and to prevent one user using multiple db connections
        //a queue of actions which require SQL queries
        this.userMessages = [];
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