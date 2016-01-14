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

Orders.TYPES = {
    STOP:0,
    MOVE:1,
    MOVETO:2,
    ATTACK:3,
    PATROL:4,
    SKILL:5,
    ATTACKMOVE:6
};

Orders.Order = Class({
    constructor: function(target, type) {
        this.target = target;
        this.type = type;
    }
});

Orders.validUnit = function(o, units) {
    var ret = ('unit' in o && o.unit in units);
    return ret;
};

Orders.interpret = function(o, uId, units) {
    if (!('type' in o))
        return null;

    if (o.type === 'move') {
        var target = {};
        var offset = 0;
        if ('point' in o && o.point instanceof LinAlg.Vector2) {
            target.type = 'point';
            target.point = o.point;
        } else if (Orders.validUnit(o, units) && o.unit != uId) {
            target.type = 'unit';
            target.unit = o.unit;
            if ('offset' in o && typeof o.offset === 'number' && o%1 === 0) {
                offset = o.offset;
            }
        } else {
            return null;
        }

        var order = new Orders.MoveOrder(target, offset, null);
        return order;
    } else if (o.type === 'attack') {
        if (Orders.validUnit(o, units) && o.unit != uId) {
            var order = new Orders.AttackOrder(o.unit);
            return order;
        }
    } else {
        return null;
    }
};