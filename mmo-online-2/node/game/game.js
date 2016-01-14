/**
 * Created by Kevin on 31/01/2015.
 */
var UnitTypes = require('./unit-types');
var Messages = require('./messages');
var Orders = require('./orders');
var Units = require('./units');
var LinAlg = require('../../www/js/linalg');
var Vision = require('./vision');

var Game = function(server) {
    this.server = server;
    this.startTime = null;
    this.currentStep = null;
    this.nextStepTime = null;
    this.lastStepTime = null;
    this.tickLen = GLOBAL.settings.tickLen;

    this.vision = new Vision.Vision();
    this.players = {};
    this.units = {};

    this.update = function() {
        var _this = this;
        this.currentStep += 1;

        //update vision
        var visionChanges = this.vision.getChanges();
        for (var pId in visionChanges) {
            for (var uId in visionChanges[pId]) {
                if (visionChanges[pId][uId] == false) {
                    this.sendMessage(pId, JSON.stringify({step:this.currentStep, type:'unsee', unit:uId}));
                } else {
                    this.sendMessage(pId, JSON.stringify({step:this.currentStep, type:'see', unit:this.units[uId]}));
                }
            }
        }

        //unit thinking
        for (var unitId in this.units) {
            var unit = this.units[unitId];
            unit.think(this);
        }

        //unit movement
        for (var unitId in this.units) {
            var unit = this.units[unitId];
            unit.move(this);
        }

        //unit actions
        for (var unitId in this.units) {
            var unit = this.units[unitId];
            unit.act(this);
        }

        //check unit status
        for (var unitId in this.units) {
            var unit = this.units[unitId];
            var messages = unit.getMessages();
            var observers = this.vision.getUnitObservers(unitId);

            for (var i = 0; i < messages.length; i++) {
                var m = messages[i];
                var s;

                m.step = this.currentStep;
                m.unit = unitId;
                s = Messages.writeTyped(m);

                for (var j = 0; j < observers.length; j++) {
                    this.sendMessage(observers[j], s);
                }
            }

            if (unit.dead) {
                unit.decayTime -= 1;
                if (unit.decayTime <= 0) {
                    this.removeUnit(unitId);
                }
            }
        }

        //send out step messages to players who haven't received anything in a while
        for (var pId in this.players) {
            if (this.players[pId].lastMessageStep < this.currentStep - 5) {
                this.sendMessage(pId, Messages.step(this.currentStep));
            }
        }

        var currentTime = new Date().getTime();
        this.lastStepTime = currentTime;
        this.nextStepTime += this.tickLen;

        setTimeout(function(){_this.update();}, this.nextStepTime - currentTime);
    };

    this.start = function() {
        this.initGameData();

        this.startTime = new Date().getTime();
        this.lastStepTime = this.startTime - this.tickLen;
        this.nextStepTime = this.startTime;
        this.update();

        //this.addUnit(new Units.Unit('me', 'default', new LinAlg.Vector2(300,100)));
        //this.addUnit(new Units.Unit('me', 'default', new LinAlg.Vector2(100,300)));
        //this.units['1'].issueOrder(Orders.interpret({type:'attack', unit:'0'}, '1', this.units));
    };

    this.initGameData = function() {
        //do stuff with the game data!
    };

    this.onConnect = function(id) {
        if (id in this.players) {
            return;
        }

        this.players[id] = new Player(id);
        var currentTime = new Date().getTime();
        this.sendMessage(id, Messages.sync(id, this.currentStep, currentTime - this.lastStepTime));
        this.vision.addObserver(id);
    };

    this.onDisconnect = function(id) {
        if (id in this.players) {
            delete this.players[id];
        }
        this.vision.removeObserver(id);
    };

    this.onMessage = function(id, msg) {
        if (msg.type === Messages.TYPES.PING) {
            server.sendMessage(id, Messages.write(Messages.TYPES.PING, null));
        } else if (msg.type === Messages.TYPES.CHAT) {
            var s = Messages.chat(id, msg.text);
            this.broadcast(s);
            //TODO: channels and PM
        } else if (msg.type in Messages.TYPES) {
            this.onOrder(id, msg);
        } else {
            console.log('Unknown message type ' + msg.type + ' from player ' + id);
        }
    };

    this.broadcast = function(s) {
        for (var playerId in this.players) {
            server.sendMessage(playerId, s);
        }
    };

    this.onOrder = function(playerId, msg) {
        if (typeof msg.type === Messages.TYPES.COMMAND) {
            if (msg.command === 'makeUnit') {
                if (!LinAlg.propIsVector2(msg, 'point'))
                    return;
                var props = Units.createMobProps(GLOBAL.gameData.mobTypes[0], 1, id, order.point);
                var unit = new Units.Unit(props);
                this.addUnit(unit);
                console.log('Unit ' + unit.id + ' spawned by player ' + playerId);
            } else if (msg.command === 'removeUnit') {
                if (msg.target in this.units) {
                    this.removeUnit(msg.target);
                    console.log('Unit ' + msg.target + ' removed by player ' + playerId);
                }
            }
        } else if (msg.unit in this.units && this.units[unit].owner === playerId) {
            var queue = false;
            if (msg.shift)
                queue = true;

            var order = Orders.interpret(msg, this);
            if (order != null) {
                this.units[msg.unit].issueOrder(order, !queue);
            } else {
                console.log('Weird order from ' + playerId + ': ' + JSON.stringify(order));
            }
        }
    };

    this.addUnit = function(unit) {
        this.units[unit.id] = unit;
        this.vision.addUnit(unit.id);
    };

    this.removeUnit = function(id) {
        this.vision.removeUnit(id);
        delete this.units[id];
    };
}; module.exports.Game = Game;

var Player = function(id) {
    this.id = id;
    this.lastMessageStep = 0;
};