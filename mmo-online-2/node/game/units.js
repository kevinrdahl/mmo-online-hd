/**
 * Created by Kevin on 01/02/2015.
 */
var LinAlg = require('../../www/js/linalg');
var Orders = require('./orders');
var UnitTypes = require('./unit-types');
var Messages = require('./messages');
var jsface = require("jsface"),
    Class  = jsface.Class,
    extend = jsface.extend,
    MMOOUtil = require('./mmoo-util');

var Units = {};
module.exports = Units;

Units.Unit = Class({
    $static: {
        idPool: new MMOOUtil.IdPool(),
        NUM_DIRECTIONS: 16,
        DIRECTIONS: [],
        DIRECTION_VECTORS: [],

        getDirection: function(angle) {
            angle = angle % 360;
            if (angle < 0)
                angle += 360;

            return Math.floor(angle / (360.0/Units.Unit.NUM_DIRECTIONS));
        }
    }, 
    constructor: function(unitType, id, owner, position) {
        this.unitType = unitType;
        this.id = id;
        this.owner = owner;
        this.game = game;

        this.position = position;
        this.nextPosition = position.copy();
        this.direction = -1;
        this.lastDirection = -1;

        this.cooldowns = {attack:0};
        this.followThrough = 0;

        this.orders = [];
        this.messages = [];

        this.moveSpeed = 2000;
        this.radius = 250;
        this.graphic = null;
        this.projectileGraphic = null;
        this.projectileSpeed = -1;

        this.alive = true;

        //STATS
        this.hp = 100;
        this.hpMax = 100;
        this.mp = 100;
        this.mpMax = 100;
        this.attackDamage = 20;
        this.attackSpeed = 1;
        this.attackRange = 150;
        this.level = 1;
        this.xp = 0;
        this.xpNeeded = 100;
    },

    think: function(game) {
        //If attack moving, insert attack order on nearby enemy.
        //Similar for patrol
        //Actual AI might go in in the future

        //discard orders which can't be fulfilled
        var order;
        while (this.orders.length > 0) {
            order = this.orders[0];
            if (order.isUnitTargeted) {
                if (!game.unitExists(order.params.target) 
                    || (order.type === Messages.TYPES.ATTACK && !game.units[order.params.target].alive)) {

                    order.shift();
                    continue;
                }
            }

            break;
        }
    },

    move: function(game) {
        //If current order is move/attack-move, do it
        //Or if current order is something else and out of range, move closer
        this.lastDirection = this.direction;
        this.direction = -1;

        if (this.orders.length > 0) {
            var order = this.orders[0];
            var dest = null;

            if order.isMove() {
                dest = order.params.point;
            } else if (order.type === Messages.TYPES.ATTACK) {
                var target = game.units[order.params.target];
                var range = this.distanceToAttack(target);
                if (this.position.distanceTo(target.position) >= range) {
                    dest = target.position.offsetTo(this.position, range);
                }
            }

            if (dest != null) {
                this.direction = Units.Unit.getDirection(this.position.angleTo(dest));
                var movement = Units.Unit.DIRECTION_VECTORS[this.direction].scaled(this.moveSpeed);
                this.nextPosition = this.position.add(movement);
            }
        }

        if (this.direction !== this.lastDirection) {
            this.messages.push(new Messages.UnitMove(game.currentStep, this.id, this.direction, this.position));
        }
    },

    updatePosition: function() {
        this.position = this.nextPosition;
    },

    act: function(game) {
        //If order is an action and unit is able, DO IT
        //for now, this is just attacking

        if (this.orders.length > 0) {
            var order = this.orders[0];
            if (order.type === Messages.TYPES.ATTACK && this.inAttackRange()) {
                this.attack(game, game.units[order.params.target]);
            }
        }
    },

    attack: function(game, unit) {
        //attackSpeed is number of attacks per second
        this.cooldowns.attack = Math.round((1000.0/GLOBAL.settings.tickLen) / this.attackSpeed);

        //just let followthrough be half the attack cooldown
        this.followThrough = Math.round(this.cooldowns.attack/2.0);

        this.messages.push(new Messages.UnitAttack(game.currentStep, this.id, unit.id));
 
        if (this.projectileSpeed > 0) {
            //spawn projectile
            game.spawnProjectile(this, unit);
        } else {
            unit.takeDamage(this, this.attackDamage, 'physical');
        }
    },

    takeDamage: function(source, amount, type) {
        console.log(this.id + ' takes ' + amount + ' ' + type + ' damage from ' + source.id + '.');
        var alive = (this.hp > 0);

        this.hp -= amount;
        this.messages.push(new Messages.UnitHealth(this.id, source.id, -amount));

        if (alive && this.hp <= 0) {
           this.die(source);
        }
    },

    die: function(killer) {
        console.log(this.id + ' dies.');
        this.killer = killer;
        this.decayTime = Math.ceil(GLOBAL.settings.unitDecayTime / GLOBAL.settings.tickLen);

        this.stop();

        this.messages.push(new Messages.UnitDeath(this.id));
        this.dead = true;
    },

    //adds an order to the end of the queue
    issueOrder: function(order, clear) {
        if (this.dead) {
            return;
        }
        if (clear) {
            this.orders.splice(0,this.orders.length);
        }
        this.orders.push(order);
        this.orderBroadcast = false;
    },

    //places an order at the front of the queue
    interruptOrder: function(order) {
        this.orders.unshift(order);
    },

    stop: function() {
        this.direction = -1;
        this.orders.splice(0,this.orders.length);
    },

    getMessages: function () {
        var m = this.messages;
        this.messages = [];
        return m;
    },

    distanceToAttack: function(target) {
        return this.radius + target.radius + this.attackRange;
    },

    inAttackRange: function(target) {
        return (this.position.distanceTo(target.position) <= this.distanceToAttack(target));
    },

    toJSON: function() {
        var props = {
            id: this.id,
            name: this.name,
            owner: this.owner,
            graphic: this.graphic,
            radius: this.radius,
            position: this.position,
            direction: this.direction,
            moveSpeed: this.moveSpeed,
            hp: this.hp,
            hpMax: this.hpMax,
            alive: this.alive,
            attackDamage: this.attackDamage,
            attackRange: this.attackRange,
            attackSpeed: this.attackSpeed
        };
        return props;
    }
});

//create directions and vectors
(function() {
    var angleDelta = 360.0 / Units.Unit.NUM_DIRECTIONS;
    var angle = 0;

    for (var i = 0; i < Units.Unit.NUM_DIRECTIONS; i++) {
        Units.Unit.DIRECTIONS.push(angle);
        Units.Unit.DIRECTION_VECTORS.push(new LinAlg.Vector2(0.0, 0.0).offset(angle, 1.0));

        angle += angleDelta;
    }
})();

//dunno how this is used anymore, it's ugly wah
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