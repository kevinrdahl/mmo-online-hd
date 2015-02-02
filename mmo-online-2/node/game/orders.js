/**
 * Created by Kevin on 01/02/2015.
 */
var Orders = {
    moveToUnitRefresh:10
};
module.exports = Orders;

var LinAlg = require('../util/linalg');

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

Orders.moveToPoint = function(point) {
    return {type:'move', point:point.copy(), step:-1};
};

Orders.stop = function () {
    return {type:'stop', step:-1};
};

Orders.move = function(point, unit, offset, byClient) {
    if (point == null && unit == null) {

    }

    this.dest = point.copy();
    this.unit = unit;
    this.offset = offset;
    this.byClient = byClient;
    this.step = -1;
    this.path = [];
};