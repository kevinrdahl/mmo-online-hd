/**
 * Created by Kevin on 31/01/2015.
 */
var UnitTypes = require('./unit-types');
var Messages = require('./messages');
var Orders = require('./orders');
var Units = require('./units');
var LinAlg = require('../../www/js/linalg');
var Vision = require('./vision');

var Game = function(sendMessage) {
    this.sendMessage = function(id, msg, noStep) {
        sendMessage(id, msg);
        if (noStep !== true) {
            this.players[id].lastMessageStep = this.currentStep;
        }
    }

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

        //carry out unit orders
        for (var unitName in this.units) {
            var unit = this.units[unitName];
            unit.position.x = unit.nextPosition.x;
            unit.position.y = unit.nextPosition.y;
            unit.update(this.units);
        }

        //check unit status
        for (var unitName in this.units) {
            var unit = this.units[unitName];
            var messages = unit.getMessages();
            var observers = this.vision.getUnitObservers(unitName);

            for (var i = 0; i < messages.length; i++) {
                var m = messages[i];
                var s;
                m.step = this.currentStep;
                s = Messages.abbreviate(m);
                for (var j = 0; j < observers.length; j++) {
                    this.sendMessage(observers[j], s);
                }
            }

            if (unit.dead) {
                unit.decayTime -= 1;
                if (unit.decayTime <= 0) {
                    this.removeUnit(unitName);
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
        if (msg.type == 'ping') {
            this.sendMessage(id, Messages.ping(this.currentStep), true);
        } else if (msg.type == 'chat') {
            var s = Messages.chat(id, msg.text);
            for (var playerId in players) {
                this.sendMessage(playerId, s, true);
            }
        } else if (msg.type == 'order') {
            this.onOrder(id, msg.unit, msg.order);
        }
    };

    this.onOrder = function(id, unit, order) {
        if (unit == 'global') {
            //global actions (these should be few)
            if (order.type === 'makeunit' && order.point instanceof LinAlg.Vector2) {
                var props = Units.createMobProps(GLOBAL.gameData.mobTypes[0], 1, id, order.point);
                this.addUnit(new Units.Unit(props));
            } else if (order.type === 'kill' && order.unit && order.unit in this.units && this.units[order.unit].owner == id) {
                this.removeUnit(order.unit);
            }

            //console.log('Player ' + id + ': ' + JSON.stringify(order));
        } else if (unit in this.units /*&& this.units[unit].owner == id*/) {
            //unit actions
            var o = Orders.interpret(order, unit, this.units);
            var queue = false;
            if (o != null) {
                console.log('Player ' + id + ' to ' + this.units[unit].name + ' ' + unit + ': ' + o.toString());
                if (order.queue === true) {
                    queue = true;
                }
                this.units[unit].issueOrder(o, !queue);
            } else {
                console.log('Weird order from ' + id + ': ' + JSON.stringify(order));
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