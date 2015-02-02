/**
 * Created by Kevin on 31/01/2015.
 */
var UnitTypes = require('unit-types');
var Messages = require('messages');

var Game = function(sendMessage) {
    this.sendMessage = sendMessage;

    this.startTime = null;
    this.currentStep = null;
    this.nextStepTime = null;
    this.lastStepTime = null;
    this.tickLen = 50;

    this.players = {};

    this.update = function() {
        this.currentStep += 1;

        var currentTime = new Date().getTime();
        this.lastStepTime = currentTime;
        this.nextStepTime += this.tickLen;
        setTimeout(this.update, this.nextStepTime - currentTime);
    };

    this.start = function() {
        this.startTime = new Date().getTime();
        this.lastStepTime = this.startTime - this.tickLen;
        this.nextStepTime = this.startTime;
        this.update();
    };

    this.onConnect = function(id) {
        this.players[id] = new Player(id);
        this.sendMessage(id, "Welcome to MMO Online HD!");
    };

    this.onDisconnect = function(id) {
        delete this.players[id];
    };

    this.onMessage = function(id, message) {
        var msg;
        try {
            msg = Messages.expand(message);
        } catch (e) {
            console.log('ERROR: malformed message from ' + id + ', "' + message + '"');
            return;
        }

        if (msg.type == 'ping') {
            this.sendMessage(id, Messages.ping(this.currentStep));
        } else if (msg.type == 'sync') {
            var currentTime = new Date().getTime();
            this.sendMessage(id, Messages.sync(this.currentStep, currentTime - this.lastStepTime));
        } else if (msg.type == 'chat') {
            var s = Messages.chat(id, msg.text);
            for (var playerId in players) {
                this.sendMessage(playerId, s);
            }
        } else if (msg.type == 'order') {
            this.onOrder(id, msg.order);
        }
    };

    this.onOrder = function(id, order) {

    };
}; module.exports.Game = Game;

var Player = function(id) {
    this.id = id;
};