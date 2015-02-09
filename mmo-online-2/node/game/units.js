/**
 * Created by Kevin on 01/02/2015.
 */
var LinAlg = require('../../www/js/linalg');
var Orders = require('./orders');
var UnitTypes = require('./unit-types');

var Units = {};
module.exports = Units;

Units.Unit = function(id, owner, type, position) {
    this.id = id;
    this.owner = owner;
    this.position = position;
    this.nextPosition = position.copy();
    this.orders = [];
    this.orderBroadcast = false;
    this.messages = [];

    var unitTemplate = UnitTypes[type];
    if (typeof unitTemplate === 'undefined') {
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

                if (order instanceof Orders.MoveOrder) {
                    var needPath = false;
                    if (order.step == 0) {
                        needPath = true;
                    } else if (!(order.target instanceof LinAlg.Vector2)) {
                        if (!(order.target in units)) {
                            this.discardOrder();
                            continue;
                        }
                        if (order.step > Orders.moveToUnitRefresh) {
                            var dest = order.path[order.path.length-1];
                            var unit = units[order.target];
                            if (dest.x != unit.position.x || dest.y != unit.position.y) {
                                needPath = true;
                            }
                        }
                    }

                    if (needPath) {
                        var targetPoint = (order.target instanceof LinAlg.Vector2) ? order.target : units[order.target].position;
                        //find a path!
                        order.path = [];
                        order.path.push(targetPoint.copy());

                        //TODO: announce it to the world!
                    }

                    //announce and carry out the order
                    if (!this.orderBroadcast) {
                        var o = {
                            type:'order',
                            unit:this.id,
                            position:this.position,
                            order:order.toObj()
                        };
                        this.messages.push(o);

                        this.orderBroadcast = true;
                    }

                    var done = this.stepTowards(order.path[0]);
                    if (done) {
                        this.orderBroadcast = false;
                        order.path.shift();
                        if (order.path.length == 0) {
                            if (order.nextOrder == null) {
                                this.discardOrder();
                            } else {
                                //remove this move order and place the next thing in front
                                this.orders.shift();
                                this.interruptOrder(order.nextOrder);
                            }
                        }
                    }

                    order.step++;
                }
            } else if (!this.orderBroadcast) {
                //empty order list, better tell my friends
                this.messages.push({
                    type:'order',
                    position:this.position,
                    order:{
                        type:'stop'
                    }
                });
                this.orderBroadcast = true;
            }
            break;
        }
    };

    this.stepTowards = function(point) {
        if (this.position.distanceTo(point) <= this.speed) {
            this.nextPosition = point.copy();
            return true;
        } else {
            var angle = this.position.angleTo(point);
            this.nextPosition = this.position.offset(angle, this.speed);
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
        this.orderBroadcast = false;
    };

    this.discardOrder = function() {
        this.orders.shift();
        this.orderBroadcast = false;
    };

    this.getMessages = function() {
        var m = this.messages;
        this.messages = [];
        return m;
    };

    this.toJSON = function() {
        var order = this.orders[0];
        if (typeof order === 'undefined') {
            order = null;
        }

        return {
            id:this.id,
            position:this.position,
            sprite:this.sprite,
            speed:this.speed,
            maxhp:this.maxhp,
            hp:this.hp,
            order:order
        };
    };
};