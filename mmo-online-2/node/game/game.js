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
    this.tickLen = 100;

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

        //update units
        if (this.currentStep % 20 == 0) {
            var point = new LinAlg.Vector2(Math.round(Math.random()*700+50), Math.round(Math.random()*500+50));
            this.units['0'].issueOrder(new Orders.MoveOrder(point, 0, null));
        }
        for (var unitName in this.units) {
            var unit = this.units[unitName];
            unit.position.x = unit.nextPosition.x;
            unit.position.y = unit.nextPosition.y;
            unit.update();
            var messages = unit.getMessages();
            for (var i = 0; i < messages.length; i++) {
                var m = messages[i];
                var s;
                m.step = this.currentStep;
                s = Messages.abbreviate(m);
                for (var pId in this.players) {
                    this.sendMessage(pId, s);
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
        this.startTime = new Date().getTime();
        this.lastStepTime = this.startTime - this.tickLen;
        this.nextStepTime = this.startTime;
        this.update();

        this.addUnit(new Units.Unit('me', 'default', new LinAlg.Vector2(300,100)));
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
                this.addUnit(new Units.Unit(id, 'default', order.point));
            } else if (order.type === 'kill' && order.unit && order.unit in this.units && this.units[order.unit].owner == id) {
                this.removeUnit(order.unit);
            }
        } else if (unit in this.units && this.units[unit].owner == id) {
            //unit actions
            if (order.type === 'move') {
                var clear = false;
                if (order.clear === true) {
                    clear = true;
                }
                this.units[unit].issueOrder(new Orders.MoveOrder(order.target, 0, null), clear);
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