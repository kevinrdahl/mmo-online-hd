/**
 * Created by Kevin on 31/01/2015.
 */
var ws = require('ws');
var fs = require('fs');

var Data = require('./data');
var game = require('./game/game');
var Messages = require('./game/messages');


GLOBAL.settings = JSON.parse(fs.readFileSync('./config/settings.json', 'utf8'));


var Server = function(port) {
    var _this = this;
    this.port = port;
    this.clients = {};
    this.clientNum = 0;

    this.start = function() {
        console.log('Reading config files...');
        this.dbConfig = JSON.parse(fs.readFileSync('./config/db.json', 'utf8'));
        this.bannerText = fs.readFileSync('./config/banner.txt', 'utf8');
        console.log('Done!');

        console.log('Connecting to database...');
        this.dao = new Data.DAO(this.dbConfig);
        this.dao.connect(function() {
            _this.onDbConnect();
        });
    };

    this.onDbConnect = function() {
        console.log('Connected!');
        this.getGameData(function() {
            _this.startWs();
            _this.startGame();
        });
    };

    this.startWs = function() {
        this.wsServer = new ws.Server({port:this.port});
        this.wsServer.on("connection", function(client){_this.onConnection(client);} );
        console.log('WebSocket server running on port ' + this.port);
    };

    this.startGame = function() {
        this.game = new game.Game(function(id, message){
            _this.sendMessage(id, message);
        });
        this.game.start();

        console.log('\n' + this.bannerText + '\n');
    };

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

    this.getGameData = function(callback) {
        console.log('Retrieving game data...')
        var c = callback;
        this.dao.getGameData(function(data) {
            GLOBAL.gameData = data;
            c();
        });
    };
};

var server = new Server(GLOBAL.settings.port);
server.start();
