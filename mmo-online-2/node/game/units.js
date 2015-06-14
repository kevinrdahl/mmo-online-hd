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

Units.Unit = function(properties) {
    this.id = (Units.unitNum++).toString();
    this.orders = [];
    this.orderBroadcast = false;
    this.messages = [];

    this.followThrough = 0;
    this.attackCoolDown = 0;

    for (var prop in properties) {
        this[prop] = properties[prop];
    }
    this.nextPosition = this.position.copy();
    this.dead = false;

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
                if (order instanceof Orders.MoveOrder) {
                    var needPath = false;
                    if (order.step == 0 || order.path.length == 0) {
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
                        this.orderBroadcast = false;
                    }

                    //announce and carry out the order
                    if (!this.orderBroadcast) {
                        //console.log(this.name + ' ' + this.id + ': ' + order.toString());

                        var o = {
                            type:'order',
                            unit:this.id,
                            position:this.position,
                            order:JSON.parse(JSON.stringify(order)) //otherwise the path points can be consumed before this is stringified
                                                                    //TODO: find a better way
                        };
                        this.messages.push(o);

                        this.orderBroadcast = true;
                    }

                    var done = this.stepTowards(order.path[0]);
                    if (order.nextOrder != null) {
                        if (this.nextPosition.distanceTo(order.path[order.path.length-1]) <= order.offset) {
                            done = true;
                        }
                    }

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
                    } else {
                        order.step++;
                    }
                } else if (order instanceof Orders.AttackOrder) {
                    var target = units[order.unit];

                    if (typeof target === 'undefined' || target.dead) {
                        this.discardOrder();
                        continue;
                    }
                    //use nextposition here as we might be coming from a moveto
                    if (order.windUp == -1 && this.nextPosition.distanceTo(target.position) > this.attackRange + this.radius + target.radius) {
                        this.moveForOrder(order, {type:'unit', unit:order.unit}, this.attackRange + this.radius + target.radius - 5);
                        continue;
                    }

                    if (this.attackCoolDown == 0 && this.followThrough == 0) {
                        if (order.windUp == -1) {
                            order.windUp = 5;
                            this.orderBroadcast = false;
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

                    if (!this.orderBroadcast) {
                        //console.log(this.name + ' ' + this.id + ': ' + order.toString());
                        var o = {
                            type:'order',
                            unit:this.id,
                            position:this.nextPosition,
                            order:{type:'attack', unit:'unit.id'}
                        };
                        this.messages.push(o);
                        this.orderBroadcast = true;
                    }
                } else {
                    console.log('unit ' + this.id + ': ' + JSON.stringify(order) + '???');
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
        this.attackCoolDown = (1000/GLOBAL.settings.tickLen) / this.attackSpeed; //attackSpeed is number of attacks per second
        this.followThrough = 10;
 
        //announce a hit
        //TODO: unless it's a projectile then announce a projectile appearing
        unit.takeDamage(this.id, this.attackDamage, 'poo');
    };

    this.takeDamage = function(source, amount, type) {
        console.log(this.id + ' takes ' + amount + ' ' + type + ' damage from ' + source + '.');
        var alive = (this.hp > 0);

        this.hp -= amount;
        this.messages.push({
            type:'damage',
            unit:this.id,
            source:source,
            amount:amount,
            damageType:type
        });

        if (alive && this.hp <= 0) {
           this.die();
        }
    };

    this.die = function(killer) {
        console.log(this.id + ' dies.');
        this.killer = killer;
        this.decayTime = Math.ceil(GLOBAL.settings.unitDecayTime / GLOBAL.settings.tickLen);

        this.stop();

        this.messages.push({
            type:'death',
            unit:this.id,
            killer:killer,
            position:this.nextPosition
        });

        this.dead = true;
    };

    //adds an order to the end of the queue
    this.issueOrder = function(order, clear) {
        if (this.dead) {
            return;
        }
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

    this.stop = function() {
        this.orders.splice(0,this.orders.length);
        this.messages.push({
            type:'order',
            position:this.nextPosition,
            unit:this.id,
            order:{
                type:'stop'
            }
        });
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

        var props = {
            id:this.id,
            name:this.name,
            level:this.level,
            position:this.position,
            sprite:this.sprite,
            speed:this.speed,
            maxhp:this.maxhp,
            hp:this.hp,
            hpRegen:this.hpRegen,
            order:order,
            owner:this.owner,
            graphic:this.graphic
        };

        if (this.dead) {
            props.dead = true;
        }

        return props;
    };
};


Units.createMobProps = function(mobType, level, owner, position) {
    var props = {};

    props.owner = owner;
    props.position = position;
    props.level = level;
    level -= 1;

    props.name = mobType.name;
    props.maxhp = mobType.hp_base + (mobType.hp_level * level);
    props.hp = props.maxhp;
    props.maxmp = mobType.mp_base + (mobType.mp_level * level);
    props.mp = props.maxmp;
    props.attackDamage = mobType.atk_base + (mobType.atk_level * level);
    props.attackSpeed = mobType.atkspeed_base + (mobType.atkspeed_level * level);
    props.defense = mobType.def_base + (mobType.def_level * level);
    props.speed = (mobType.speed_base + (mobType.speed_level * level)) * (GLOBAL.settings.tickLen / 1000);
    props.hpRegen = mobType.hpregen_base + (mobType.hpregen_level * level);
    props.mpRegen = mobType.mpregen_base + (mobType.mpregen_level * level);
    props.attackRange = mobType.atkrange_base + (mobType.atkrange_level * level);
    props.xpValue = mobType.xp_level * level;
    props.radius = mobType.radius;
    props.graphic = mobType.graphic_id;

    return props;
};