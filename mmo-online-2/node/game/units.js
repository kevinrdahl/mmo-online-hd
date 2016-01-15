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
    this.id = Units.unitNum++;
    this.orders = [];
    this.orderBroadcast = false;
    this.messages = [];

    this.movement = 0; //0 stopped, then the 8 directions starting from UP
    this.lastMovement = 0;

    this.followThrough = 0;
    this.attackCoolDown = 0;

    for (var prop in properties) {
        this[prop] = properties[prop];
    }
    this.dead = false;
    this.diagonalSpeed = this.speed / Math.SQRT2;

    //figure out what to do!
    this.think = function(game) {
        //TODO: if attack moving, check for nearby enemies
        //similar for patrol, but return to point

        //check that targets are valid
        while (this.orders.length > 0) {
            var order = this.orders[0];
            if (typeof order.target !== 'undefined' && !(order.target in game.units))
                this.orders.shift();
            else
                break;
        }
    };

    this.move = function(game) {
        this.lastMovement = this.movement;

        if (this.orders.length == 0) {
            this.movement = 0;
        } else {
            var order = this.orders[0];
            var dest = null;

            if (order.type === Messages.TYPES.MOVE || order.type === Messages.TYPES.ATTACKMOVE) {
                dest = order.point;
            } else if (order.type === Messages.TYPES.MOVETO || order.type === Messages.TYPES.ATTACK) {
                //TODO: include targeted abilities
                var target = game.units[order.target];
                var angle = target.position.angleTo(this.position);
                dest = target.position.offset(angle, this.attackRange);
            }

            if (dest != null) {
                if (this.position.distanceTo(dest) <= this.speed) {
                    this.position = dest.copy();
                    this.movement = -1;

                    if (order.type === Messages.TYPES.MOVE || order.type === Messages.TYPES.ATTACKMOVE)
                        this.orders.shift();
                } else {
                    //there's surely a more elegant way, but this works
                    if (this.position.x < dest.x) {
                        if (this.position.y < dest.y)
                            this.movement = 2; //UP-RIGHT
                        else if (this.position.y > dest.y)
                            this.movement = 4; //DOWN-RIGHT
                        else
                            this.movement = 3; //RIGHT
                    
                    } else if (this.position.x > dest.x) {
                        if (this.position.y < dest.y)
                            this.movement = 8; //UP-LEFT
                        else if (this.position.y > dest.y)
                            this.movement = 6; //DOWN-LEFT
                        else
                            this.movement = 7; //LEFT
                    
                    } else {
                        if (this.position.y < dest.y)
                            this.movement = 5; //DOWN
                        else
                            this.movement = 1; //UP
                    }
                }
            }
        }

        if (this.movement !== this.lastMovement) {
            if (this.movement === -1)
                this.movement = 0;
            this.messages.push({type:Messages.TYPES.MOVE, direction:this.movement, position:this.position.rounded()});
        }

        //TODO: make nice when not tired
        if (this.movement != 0) {
            switch(this.movement) {
                case 1: 
                    this.position.y += this.speed;
                    break;
                case 2: 
                    this.position.x += this.diagonalSpeed; 
                    this.position.y += this.diagonalSpeed;
                    break;
                case 3: 
                    this.position.x += this.speed;
                    break;
                case 4: 
                    this.position.x += this.diagonalSpeed; 
                    this.position.y -= this.diagonalSpeed;
                    break;
                case 5: 
                    this.position.y -= this.speed;
                    break;
                case 6: 
                    this.position.x -= this.diagonalSpeed; 
                    this.position.y -= this.diagonalSpeed;
                    break;
                case 7: 
                    this.position.x -= this.speed;
                    break;
                case 8: 
                    this.position.x -= this.diagonalSpeed; 
                    this.position.y += this.diagonalSpeed;
                    break;
        }
    };

    this.act = function(game) {
        //fugg
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