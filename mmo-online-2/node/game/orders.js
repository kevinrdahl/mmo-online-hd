/**
 * Created by Kevin on 01/02/2015.
 */

/*
    ORDER SYNTAX (from client):
    ["TYPE", {"param":value}]
 */

/* OOP */
var jsface = require("jsface"),
    Class  = jsface.Class,
    extend = jsface.extend;

var LinAlg = require('../../www/js/linalg');

var Orders = {
    moveToUnitRefresh:10
};
module.exports = Orders;

Orders.Order = Class({
    constructor: function(target, type) {
        this.target = target;
        this.type = type;
    },

    isMove: function() {
        return (
            this.type === Messages.TYPES.MOVE 
            || this.type === Messages.TYPES.ATTACKMOVE
            || this.type === Messages.TYPES.PATROL
        );
    },

    isUnitTargeted: function() {
        return {
            this.type === Messages.TYPES.ATTACK
            || this.type === Messages.TYPES.MOVETO
            || this.type === Messages.TYPES.SKILL
        };
    }
});

//returns a valid order to be queued, or null if the message's order is invalid
//the order might be meaningless but that's handled in Unit code
Orders.interpret = function(msg, game) {
    var order = {type:msg.type};

    //dun wanna deal with these yet
    if (msg.type === Messages.TYPES.PATROL)
        msg.type = Messages.TYPES.MOVE;


    if (msg.type === Messages.TYPES.MOVE || msg.type === Messages.TYPES.ATTACKMOVE) {
        if (!LinAlg.propIsVector2(msg, 'point'))
            return null;
        order.point = msg.point;
    } else if (msg.type === Messages.TYPES.ATTACK || msg.type === Messages.TYPES.MOVETO) {
        if (!(msg.target in game.units))
            return null;
    } else if (msg.type !== Messages.TYPES.STOP) {
        return null;
    }

    return order;
};