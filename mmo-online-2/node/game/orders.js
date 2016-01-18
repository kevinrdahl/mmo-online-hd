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
    constructor: function(type) {
        this.type = type;
    },

    isMove: function() {
        return false;
    }
});

Orders.UnitOrder = Class(Orders.Order, {
    constructor: function(type, unitId) {
        Orders.UnitOrder.$super.call(this, type);
        this.unitId = targetId;
        this.unit = null;
    }
});

Orders.PointOrder = Class(Orders.Order, {
    constructor: function(type, point) {
        Orders.PointOrder.$super.call(this, type);
        this.point = point;
    },

    isMove: function() {
        return (
            this.type === Messages.TYPES.MOVE 
            || this.type === Messages.TYPES.ATTACKMOVE
            || this.type === Messages.TYPES.PATROL
        );
    }
});

//returns a valid order to be queued, or null if the message's order is invalid
//the order might be meaningless but that's handled in Unit code
Orders.interpret = function(msg, game) {
    var order;

    //dun wanna deal with these yet
    if (msg.type === Messages.TYPES.PATROL)
        msg.type = Messages.TYPES.MOVE;


    if (msg.type === Messages.TYPES.MOVE || msg.type === Messages.TYPES.ATTACKMOVE) {
        if (!(msg.params.point instanceof LinAlg.Vector2))
            return null;
        order = new Orders.PointOrder(msg.type, msg.params.point);
    } else if (msg.type === Messages.TYPES.ATTACK || msg.type === Messages.TYPES.MOVETO) {
        if (game.getUnit(msg.params.target) === null)
            return null;
        order = new Orders.UnitOrder(msg.type, msg.params.target);
    } else if (msg.type !== Messages.TYPES.STOP) {
        return null;
    } else {
        order = new Orders.Order(Messages.TYPES.STOP);
    }

    return order;
};