/**
 * Created by Kevin on 31/01/2015.
 */
var Game = {};
module.exports = Game;

var UnitTypes = require('./unit-types');
var Messages = require('./messages');
var Orders = require('./orders');
var Units = require('./units'),
    Unit = Units.Unit;
var Players = require('./players'),
    Player = Players.Player;
var Projectiles = require('./projectiles'),
    Projectile = Projectiles.Projectile;
var LinAlg = require('../../www/js/linalg');
var Vision = require('./vision');
var GameLogic = require('./game-logic');

var jsface = require("jsface"),
    Class  = jsface.Class,
    extend = jsface.extend;

Game.Game = Class({
    constructor: function(server, name, id) {
        this.server = server;
        this.id = id;
        this.name = name;
        this.startTime = null;
        this.currentStep = null;
        this.nextStepTime = null;
        this.lastStepTime = null;
        this.tickLen = GLOBAL.settings.tickLen;

        this.vision = null;
        this.players = {};
        this.units = {};
        this.projectiles = [];
        this.updateLengths = [];
    },

    start: function() {
        this.vision = new Vision.Vision();
        this.startTime = Date.now();
        this.lastStepTime = this.startTime - this.tickLen;
        this.nextStepTime = this.startTime;

        GameLogic.setup(this);
        console.log('The game begins.\n\n');

        this.update();
    },

    update: function() {
        var _this = this;
        var updateBeginTime = Date.now();
        this.currentStep += 1;

        this.updateVision();
        this.unitMovement();
        this.unitActions();
        this.updateProjectiles();
        this.sendUnitMessages();
        this.sendStep();

        //send out step messages to players who haven't received anything in a while
        for (var pId in this.players) {
            if (this.players[pId].lastMessageStep < this.currentStep - 5) {
                this.sendString(pId, Messages.step(this.currentStep));
            }
        }

        GameLogic.update(this);

        var currentTime = Date.now();
        this.logUpdateLength(currentTime - updateBeginTime);
        this.lastStepTime = currentTime;
        this.nextStepTime += this.tickLen;

        setTimeout(function(){_this.update();}, this.nextStepTime - currentTime);
    },

    logUpdateLength: function(len) {
        var interval = 5000; //5 seconds
        var max = interval / this.tickLen;
        var lengths = this.updateLengths;

        lengths.push(len);
        if (lengths.length === max) {
            var avg = 0;
            for (var i = 0; i < lengths.length; i++) {
                avg += lengths[i];
            }
            avg /= lengths.length;
            lengths.splice(0, lengths.length);
            //console.log('AVG SIM TIME: ' + avg + 'ms (' + 1000/avg + ' fps)');
        }
    },

    updateVision: function() {
        var visionChanges = this.vision.getChanges();
        for (var pId in visionChanges) {
            for (var uId in visionChanges[pId]) {
                if (visionChanges[pId][uId] == false) {
                    //this.sendString(pId, JSON.stringify({step:this.currentStep, type:'unsee', unit:uId}));
                } else {
                    //IMPORTANT: for unit position delta encoding to work, make sure to broascast the unit's lastBroadcastPosition,
                    //           not just its position

                    //also, vision is probably pretty brute force right now, it will need to be part of the grid overhaul

                    //this.sendString(pId, JSON.stringify({step:this.currentStep, type:'see', unit:this.units[uId]}));
                }
            }
        }
    },

    unitMovement: function() {
        var keys = Object.keys(this.units);
        var unit;

        for (var i = 0; i < keys.length; i++) {
            unit = this.units[keys[i]];
            unit.updateTimers();
            unit.move(this);
        }

        for (var i = 0; i < keys.length; i++) {
            unit = this.units[keys[i]];
            unit.updatePosition();
        }
    },

    unitActions: function() {
        var keys = Object.keys(this.units);
        for (var i = 0; i < keys.length; i++) {
            this.units[keys[i]].act(this);
        }
    },

    updateProjectiles: function() {
        var p;
        var remove;
        for (var i = 0; i < this.projectiles.length; i++) {
            remove = false;
            p = this.projectiles[i];
            p.update();

            if (p.disjointed) {
                remove = true;
            } else if (p.hit) {
                remove = true;
                if (p instanceof Projectiles.AttackProjectile) {
                    var target = p.target;
                    if (target.alive) {
                        target.takeDamage(p.source, p.damage, p.damageType);
                    }
                }
            }

            if (remove) {
                this.projectiles.splice(i, 1);
                i--;
            }
        }
    },

    sendUnitMessages: function() {
        var unit, 
            messages, 
            observers,
            m,
            s,
            hasStep;

        for (var unitId in this.units) {
            unit = this.units[unitId];
            messages = unit.getMessages();
            observers = this.vision.getUnitObservers(unitId);

            for (var i = 0; i < messages.length; i++) {
                m = messages[i];
                s = m.serialize();

                console.log('Unit %s: %s (%d chars)', unit.id, m.debugString(), s.length);
                //console.log('         "' + s + '"');

                hasStep = false;
                if (m.hasStep())
                    hasStep = true;

                for (var j = 0; j < observers.length; j++) {
                    this.sendString(observers[j], s);
                    if (hasStep)
                        observers[j].lastMessageStep = this.currentStep;
                }
            }

            if (unit.dead) {
                unit.decayTime -= 1;
                if (unit.decayTime <= 0) {
                    this.removeUnit(unitId);
                }
            }
        }
    },

    sendStep: function() {
        var keys = Object.keys(this.players);
        var player;
        var msgString = new Messages.Step(this.currentStep).serialize();
        for (var i = 0; i < keys.length; i++) {
            player = this.players[keys[i]];
            if (this.currentStep - player.lastMessageStep >= Player.STEP_UPDATE_INTERVAL) {
                this.sendString(player.id, msgString);
                player.lastMessageStep = this.currentStep;
            }
        }
    },

    onConnect: function(clientId) {
        if (clientId in this.players) {
            return;
        }

        this.players[clientId] = new Player(clientId);
        var currentTime = Date.now();
        //this.sendString(clientId, Messages.sync(clientId, this.currentStep, currentTime - this.lastStepTime));
        this.vision.addObserver(clientId);
    },

    onDisconnect: function(clientId) {
        if (clientId in this.players) {
            delete this.players[clientId];
        }
        this.vision.removeObserver(clientId);
    },

    onMessage: function(clientId, msg) {
        if (msg.type === Messages.TYPES.CHAT) {
            //var s = Messages.chat(clientId, msg.text);
            //this.broadcast(s);
            //TODO: channels and PM
        } else if (0 <= msg.type && msg.type < Messages.NUM_TYPES) {
            this.onOrder(clientId, msg);
        } else {
            console.log('Unknown message type ' + msg.type + ' from player ' + clientId);
        }
    },

    broadcast: function(s) {
        for (var playerId in this.players) {
            server.sendString(playerId, s);
        }
    },

    onOrder: function(playerId, msg) {
        if (msg.type === Messages.TYPES.COMMAND) {
            if (msg.params.command === 'makeUnit') {
                if (!(msg.params.point instanceof LinAlg.Vector2))
                    return;
                var props = Units.createMobProps(GLOBAL.gameData.mobTypes[0], 1, id, order.params.point);
                var unit = new Units.Unit(props);
                this.addUnit(unit);
                console.log('Unit ' + unit.id + ' spawned by player ' + playerId);
            } else if (msg.command === 'removeUnit') {
                var target = this.getUnit(msg.params.target);
                if (target !== null) {
                    this.removeUnit(target);
                    console.log('Unit ' + target.id + ' removed by player ' + playerId);
                }
            }
        } else if (typeof msg.params.unit === 'string') {
            var unit = this.getUnit(msg.params.unit);
            if (unit !== null && unit.owner === playerId) {
                var queue = false;
                if (msg.params.queue)
                    queue = true;

                var order = Orders.interpret(msg, this);
                if (order !== null) {
                    this.units[msg.unit].issueOrder(order, !queue);
                } else {
                    console.log('Weird order from ' + playerId + ': ' + JSON.stringify(order));
                }
            }
        }
    },

    addUnit: function(unit) {
        this.units[unit.id] = unit;
        this.vision.addUnit(unit.id);
        unit.exists = true;
    },

    removeUnit: function(unit) {
        this.vision.removeUnit(unit.id);
        delete this.units[unit.id];
        unit.exists = false;
    },

    getUnit: function(unitId) {
        var unit = this.units[unitId];
        if (typeof unit === 'undefined')
            return null;
        else
            return unit;
    },

    spawnProjectile: function(projectile) {
        console.log("new projectile " + JSON.stringify(projectile));
        this.projectiles.push(p);
        //tell everyone! this needs to not be everyone
        this.broadcast(new Messages.Projectile(
            this.currentStep,
            projectile
        ).serialize());
    },

    unitExists: function(unitId) {
        return (typeof this.units[unitId] !== 'undefined');
    }
});