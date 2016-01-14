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

    this.update = function(game) {
        if (this.attackCoolDown > 0) {
            this.attackCoolDown -= 1;
        }
        if (this.followThrough > 0) {
            this.followThrough -= 1;
        }

        var units = game.units;
        var order = this.orders[0];


    };

    this.move = function(game) {
        var order = this.orders[0];

        if (typeof order === 'undefined') {
            //fugg
        }
    };

    this.act = function(game) {

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