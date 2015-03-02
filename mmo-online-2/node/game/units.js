/**
 * Created by Kevin on 01/02/2015.
 */
var LinAlg = require('../../www/js/linalg');
var Orders = require('./orders');
var UnitTypes = require('./unit-types');

var Units = {
    unitNum:0
};
module.exports = Units;

Units.Unit = function(owner, type, position) {
    this.id = (Units.unitNum++).toString();
    this.owner = owner;
    this.position = position;
    this.nextPosition = position.copy();
    this.orders = [];
    this.orderBroadcast = false;
    this.messages = [];

    this.followThrough = 0;
    this.attackCoolDown = 0;

    var unitTemplate = UnitTypes[type];
    if (typeof unitTemplate === 'undefined') {
        unitTemplate = UnitTypes['default'];
    }
    for (var prop in unitTemplate) {
        this[prop] = unitTemplate[prop];
    }
    this.hp = this.maxhp;

    this.update = function(units) {
        if (this.attackCoolDown > 0) {
            this.attackCoolDown -= 1;
        }
        if (this.followThrough > 0) {
            this.followThrough -= 1;
        }

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
                            order:order
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
                } else if (order instanceof Orders.AttackOrder) {
                    var range = 100;
                    var target = units[order.unit];

                    if (typeof target === 'undefined') {
                        this.discardOrder();
                        continue;
                    }
                    if (this.position.distanceTo(target.position) > range) {
                        this.moveForOrder(order, {type:'unit', unit:order.unit}, range);
                        continue;
                    }

                    if (this.attackCoolDown == 0 && this.followThrough == 0) {
                        if (order.windUp == -1) {
                            order.windUp = 5;
                        } else if (order.windUp > 0) {
                            order.windUp -= 1;
                            if (order.windUp == 0) {
                                order.windUp = -1;
                                this.attack(target);
                            }
                        }
                    } else {
                        //do nothing
                    }
                }
            } else if (!this.orderBroadcast) {
                //empty order list, better tell my friends
                this.messages.push({
                    type:'order',
                    position:this.position,
                    unit:this.id,
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

    this.attack = function(unit) {
        this.attackCoolDown = 25;
        this.followThrough = 10;
        console.log(this.id + ' attacks ' + unit.id);
        var o = {
            type:'order',
            unit:this.id,
            position:this.position,
            order:{type:'attack', unit:'unit.id'}
        };
        this.messages.push(o);
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

    this.moveForOrder = function(order, target, range) {
        this.orders.shift();
        this.interruptOrder(new Orders.MoveOrder(target, range, order));
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
            order:order,
            owner:this.owner
        };
    };
};