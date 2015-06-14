/**
 * Created by Kevin on 01/02/2015.
 */

/*
TERMS:
Orders are issued by unit "unit", and will always have a "target", which may be a unit, a point, or in some cases null
They also have an attribute "queue" which is 0 or 1, denoting whether the order is to be queued or if it is to replace
all other orders.

MOVE ORDERS:
The only complicated order. Every move order's target can be either a unit or a point, and the order will store a path
of points to this target. Since units can move before being reached, if the target of an order is a unit, the path must
be recalculated if the unit has moved. However, to avoid finding a new path every frame, this can be done at most every
moveToUnitRefresh frames.
TODO: when pathfinding is implemented, it should list lines of pathing nodes as only their start and end, to avoid excessive move order broadcasting

MOVING TO DO THINGS:
If a unit is not close enough to carry out an order, the order is wrapped in a MoveOrder, which may have an "offset",
which could be attack range etc.
 */

var Orders = {
    moveToUnitRefresh:10
};
module.exports = Orders;

var LinAlg = require('../../www/js/linalg');

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

Orders.MoveOrder = function(target, offset, nextOrder) {
    this.step = 0;
    this.path = [];
    this.offset = offset|0;
    this.nextOrder = (typeof nextOrder !== 'undefined') ? nextOrder : null;
    if (target.type === 'point') {
        this.target = target.point;
    } else {
        this.target = target.unit;
    }

    this.toJSON = function() {
        if (this.path.length == 0) {
            return null;
        } else {
            return {
                type:'move',
                point:this.path[0]
            };
        }
    };

    this.toString = function() {
        var s = 'move to';
        if (this.path.length == 0) {
            s += ' nowhere';
        } else {
            s += ' [' + this.path[0].x + ',' + this.path[0].y + ']';
        }

        if (this.nextOrder != null) {
            s += ' then ' + this.nextOrder.toString();
        }

        return s;
    };
};

Orders.AttackOrder = function(target) {
    this.unit = target;
    this.windUp = -1;

    this.toJSON = function() {
        return {
            type:'attack',
            unit:this.unit
        };
    }

    this.toString = function() {
        return 'attack unit ' + this.unit + ' (windup ' + this.windUp + ')';
    };
};