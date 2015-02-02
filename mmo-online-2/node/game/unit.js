/**
 * Created by Kevin on 01/02/2015.
 */
var LinAlg = require('../util/linalg');
var Orders = require('./orders');

var Unit = function(id, owner, type, position) {
    this.id = id;
    this.owner = owner;
    this.position = position;
    this.nextPosition = position;
    this.orders = [];
    this.orderBroadcast = false;
    this.messages = [];

    var unitTemplate = UnitTypes[type];
    if (unitTemplates === 'undefined') {
        unitTemplate = UnitTypes['default'];
    }
    for (var prop in unitTemplate) {
        this[prop] = unitTemplate[prop];
    }
    this.hp = this.maxhp;

    this.update = function(units) {
        while (true) {
            var order = this.orders[0];
            if (typeof order !== 'undefined') {
                //follow the order (it has been validated already)

                if (order.type = 'move') {
                    //if moving to a unit...
                    if (order.unit != null) {
                        //if unit does not exist, discard
                        if (!(order.unit in units)) {
                            this.discardOrder();
                            continue;
                        }
                        var unit = units[order.unit];
                        if (order.step == -1 || (order.point.distanceTo(units[order.unit].position) > 5 && order.step > Orders.moveToUnitRefresh)) {
                            //find path (for now just straight line)
                            order.point = new LinAlg.Vector2(unit.position.x, unit.position.y);
                            order.path = [order.point.copy()];
                            order.step = 0;
                            this.orderBroadcast = false;
                        }
                    } else if (order.step == -1) {
                        //find path
                        order.path = [new LinAlg.Vector2(order.point.x, order.point.y)];
                        order.step = 0;
                        this.orderBroadcast = false;
                    }

                    if (!this.orderBroadcast) {
                        this.messages.push(order.toMessage());
                    }
                    var complete = this.stepTowards(order.path[0]);
                    if (complete) {
                        order.path.shift();
                        if (order.path.length == 0) {
                            this.discardOrder();
                        } else {
                            this.orderBroadcast = false;
                        }
                    }
                }
            }
        }
    };

    this.stepTowards = function(point) {
        if (this.position.distanceTo(point) <= this.speed) {
            this.nextPosition = point.copy();
            return true;
        } else {
            var angle = this.position.angleTo(point);
            var move = this.position.offset(angle, this.speed);
            this.nextPosition = this.position.add(move);
            return false;
        }
    };

    //adds an order to the end of the queue
    this.issueOrder = function(order, clear) {
        if (clear) {
            this.orders.splice(0,this.orders.length);
        }
        this.orders.push(order);
        this.orderBroadcast = false;
    };

    //places an order at the front of the queue
    this.interruptOrder = function(order) {
        this.orders.unshift(order);
    };

    this.discardOrder = function() {
        this.orders.shift();
        if (this.orders.length == 0) {
            this.messages.push({
                type:'order',
                position:this.position.toJSON(),
                order:{
                    type:'stop'
                }
            });
        }
        this.orderBroadcast = false;
    };
}; module.exports.Unit = Unit;