/**
 * Created by Kevin on 31/01/2015.
 */
var Game = {};
module.exports = Game;

var UnitTypes = require('./unit-types');
var Messages = require('./messages');
var Orders = require('./orders');
var Units = require('./units');
var LinAlg = require('../../www/js/linalg');
var Vision = require('./vision');
var jsface = require("jsface"),
    Class  = jsface.Class,
    extend = jsface.extend;

Game.Game = Class({
    constructor: function(server, name) {
        this.server = server;
        this.name = name;
        this.startTime = null;
        this.currentStep = null;
        this.nextStepTime = null;
        this.lastStepTime = null;
        this.tickLen = GLOBAL.settings.tickLen;

        this.vision = null;
        this.players = {};
        this.units = {};
    },

    start: function() {
        this.vision = new Vision.Vision();
        this.startTime = new Date().getTime();
        this.lastStepTime = this.startTime - this.tickLen;
        this.nextStepTime = this.startTime;

        this.update();
    },

    update: function() {
        var _this = this;
        this.currentStep += 1;

        this.updateVision();
        this.unitAI();
        this.unitMovement();
        this.updateUnitPostions();
        this.unitActions();
        this.checkUnitStatus();
        this.sendStep();

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
                    this.sendString(observers[j], s);
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
                this.sendString(pId, Messages.step(this.currentStep));
            }
        }

        var currentTime = new Date().getTime();
        this.lastStepTime = currentTime;
        this.nextStepTime += this.tickLen;

        setTimeout(function(){_this.update();}, this.nextStepTime - currentTime);
    },

    updateVision: function() {
        var visionChanges = this.vision.getChanges();
        for (var pId in visionChanges) {
            for (var uId in visionChanges[pId]) {
                if (visionChanges[pId][uId] == false) {
                    //this.sendString(pId, JSON.stringify({step:this.currentStep, type:'unsee', unit:uId}));
                } else {
                    //this.sendString(pId, JSON.stringify({step:this.currentStep, type:'see', unit:this.units[uId]}));
                }
            }
        }
    },

    unitAI: function() {
        var unit
        for (var unitId in this.units) {
            this.units[unitId].think(this);
        }
    },

    unitMovement: function() {
        var unit
        for (var unitId in this.units) {
            this.units[unitId].move(this);
        }
    },

    updateUnitPostions: function() {

    },

    unitActions: function() {
        var unit
        for (var unitId in this.units) {
            this.units[unitId].act(this);
        }
    },

    onConnect: function(clientId) {
        if (clientId in this.players) {
            return;
        }

        this.players[clientId] = new Player(clientId);
        var currentTime = new Date().getTime();
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
        } else if (msg.type in Messages.TYPES) {
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
    },

    addUnit: function(unit) {
        this.units[unit.id] = unit;
        this.vision.addUnit(unit.id);
    },

    removeUnit: function(unitId) {
        this.vision.removeUnit(unitId);
        delete this.units[unitId];
    }
});

var Player = Class({
    constructor: function(id) {
        this.id = id;
        this.lastMessageStep = 0;
    }
});