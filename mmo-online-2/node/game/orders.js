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
moeToUnitRefresh frames.
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

//TODO: this should basically be a type checking function
Orders.fromObj = function(o) {
    var order = {step:-1};
    var ok = true;

    if (o.type === 'move') {
        var point = LinAlg.vector2FromObj(o.point);
        var unit = (typeof o.unit === 'string') ? o.unit : null;
        var unit = (typeof o.unit === 'string') ? o.unit : null;
        return new Orders.move(
            point,
            unit,
            offset,
            true
        );
    } else if (o.type === 'stop') {
        order.type = 'stop';
    } else {
        ok = false;
    }

    if (!ok) {
        console.log('ERROR: Bad order ' + JSON.stringify(o));
        return null;
    } else {
        return order;
    }
};

Orders.MoveOrder = function(target, offset, nextOrder) {
    this.step = 0;
    this.path = [];
    this.offset = offset|0;
    this.nextOrder = (typeof nextOrder !== 'undefined') ? nextOrder : null;
    if (typeof target === 'object') {
        this.target = new LinAlg.Vector2(target.x|0, target.y|0);
    } else {
        this.target = target;
    }

    this.toObj = function() {
        return {type:'move', point:this.path[this.path.length-1]};
    };

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
};