/**
 * Created by Kevin on 01/02/2015.
 */
var Messages = {};
module.exports = Messages;

var jsface = require("jsface"),
    Class  = jsface.Class,
    extend = jsface.extend,
    LinAlg = require('../../www/js/linalg'),
    MMOOUtil = require('./mmoo-util'),
    Units = require('./units');

Messages.TYPES = {
    PING:0,
    MOVE:1,
    MOVETO:2,
    ATTACK:3,
    PROJECTILE:4,
    SKILL:5,
    ATTACKMOVE:6,
    STOP:7,
    HEALTH:8,
    CHAT:9,
    COMMAND:10,
    ERROR:11,
    USER:12,
    CHARACTER:13,
    WORLD:14,
    JOIN:15,
    DEATH:16,
    PATROL:17,
    STEP:18
};
Messages.TYPE_NAMES = [];
(function() {
    for (var name in Messages.TYPES) {
        Messages.TYPE_NAMES[Messages.TYPES[name]] = name;
    }
})();


Messages.NUM_TYPES = Object.keys(Messages.TYPES).length;

Messages.expansions = {};
Messages.abbreviations = {};

//create abbreviations
//NOTE: To distinguish them from properties which are simply very short, they all begin with a '?'
(function() {
    var terms = [
        'step',
        'unit',
        'direction',
        'target',
        'amount',
        'source',
        'position',
        'point',
        'destination',
        'queue',
        'killer',
        'success',
        'moveSpeed',
        'attackDamage',
        'attackRange',
        'attackSpeed',
        'radius',
        'name',
        'password',
        'success',
        'alive',
        'name',
        'action'
    ];

    var pool = new MMOOUtil.IdPool();
    var term, abbreviation;

    for (var i = 0; i < terms.length; i++) {
        term = terms[i];
        abbreviation = '?' + pool.get();
        Messages.abbreviations[term] = abbreviation;
        Messages.expansions[abbreviation] = term;
    }
})();

//never changes, why rewrite it?
Messages.PING = Messages.TYPES.PING.toString() + '|';

/***********
 * CLASSES *
 ***********/
Messages.Message = Class({
    constructor: function(type, params) {
        this.type = type;
        this.params = params;
    },

    serialize: function() {
        return this.type.toString() + '|' + Messages.abbreviate(this.params);
    },

    hasStep: function() {
        return (this.type === Messages.TYPES.MOVE
            || this.type === Messages.TYPES.ATTACK
            || this.type === Messages.TYPES.PROJECTILE
            || this.type === Messages.TYPES.STEP
        );
    },

    debugString: function() {
        return Messages.TYPE_NAMES[this.type] + ' (' + this.type + ') ' + JSON.stringify(this.params);
    }
});

//NOTE: unique in that it doesn't serialize to standard message format, since the client wouldn't know how to read it
Messages.Handshake = Class(Messages.Message, {
    $static: {
        str: null
    },

    constructor: function() {},

    serialize: function() {
        if (Messages.Handshake.str === null) {
            Messages.Handshake.str = JSON.stringify({
                types: Messages.TYPES,
                abbreviations: Messages.abbreviations
            });
        }
        return Messages.Handshake.str;
    }
})

Messages.LogInResponse = Class(Messages.Message, {
    constructor: function(success) {
        Messages.LogInResponse.$super.call(this, Messages.TYPES.LOGIN, {
            success: success
        });
    }
});

Messages.WorldList = Class(Messages.Message, {
    constructor: function(games) {
        var descriptions = [];
        for (var i = 0; i < games.length; i++) {
            descriptions.push({
                id: games[i].id,
                name: games[i].name,
                players: Object.keys(games[i].players).length
            });
        }
        Messages.WorldList.$super.call(this, Messages.TYPES.USER, {
            action: 'getWorlds',
            worlds: descriptions
        });
    }
});

Messages.UnitMove = Class(Messages.Message, {
    constructor: function(step, unitId, direction, position) {
        Messages.UnitMove.$super.call(this, Messages.TYPES.MOVE, {
            step: step,
            unit: unitId,
            direction: direction,
            position: position.copy().round()
        });
    },

    debugString: function() {
        if (this.params.direction === -1)
            return 'STOP';
        return Messages.UnitMove.$superp.debugString.call(this);
    }
});

Messages.UnitAttack = Class(Messages.Message, {
    constructor: function(step, unitId, targetId) {
        Messages.UnitAttack.$super.call(this, Messages.TYPES.ATTACK, {
            step: step,
            unit: unitId,
            target: targetId
        });
    }
});

Messages.UnitHealth = Class(Messages.Message, {
    constructor: function(unitId, sourceId, amount) {
        Messages.UnitHealth.$super.call(this, Messages.TYPES.HEALTH, {
            unit: unitId,
            source: sourceId,
            amount: amount
        });
    }
});

Messages.UnitDeath = Class(Messages.Message, {
    constructor: function(unitId, killerId) {
        Messages.UnitDeath.$super.call(this, Messages.TYPES.DEATH, {
            unit: unitId,
            killer: killerId
        });
    }
});

Messages.Projectile = Class(Messages.Message, {
    constructor: function(step, projectile) {
        Messages.Projectile.$super.call(this, Messages.TYPES.PROJECTILE, projectile.messageParams);
    }
});

Messages.Step = Class(Messages.Message, {
    constructor: function(step) {
        Messages.Step.$super.call(this, Messages.TYPES.STEP, {step: step});
    }
});

Messages.UserResponse = Class(Messages.Message, {
    constructor: function(action, success, failReason) {
        var params = {action:action, success:success};
        if (!success)
            params.reason = failReason;
        Messages.UserResponse.$super.call(this, Messages.TYPES.USER, params);
    }
})

/*************
 * FUNCTIONS *
 *************/
//abbreviates keys
Messages.abbreviateRecursive = function(obj) {
    var clone = {};
    var keys = Object.keys(obj);
    var key, val;
    var s;
    
    for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        val = obj[key];

        if (val instanceof LinAlg.Vector2) {
            val = [val.x, val.y];
        } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            val = Messages.abbreviateRecursive(val);
        }
        clone[Messages.getAbbreviation(key)] = val;
    }

    return clone
};

Messages.abbreviate = function(obj) {
    var s = JSON.stringify(Messages.abbreviateRecursive(obj));
    return s.substring(1, s.length-1);
};

Messages.getAbbreviation = function(term) {
    if (term.length < 3)
        return term;
    var abbreviation = Messages.abbreviations[term];
    if (typeof abbreviation === 'undefined')
        return term;
    return abbreviation;
};

//expands param names (and now vectors)
Messages.expand = function(obj) {
    var keys = Object.keys(obj);
    var key, val, fullKey;

    for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        val = obj[key];
        fullKey = Messages.getExpansion(key);

        if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
            Messages.expand(val);
        } else if (Array.isArray(val) 
            && val.length === 2
            && typeof val[0] === 'number' && typeof val[1] === 'number') {
            val = new LinAlg.Vector2(val.x, val.y);
        }

        if (key !== fullKey) {
            obj[fullKey] = val;
            delete obj[key];    
        }
    }
};

Messages.getExpansion = function(term) {
    if (term.length === 1)
        return term;
    var expansion = Messages.expansions[term];
    if (typeof expansion === 'undefined')
        return term;
    return expansion;
};

/*
 * MESSAGE FORMAT:
 * type|"param":"string", "param2":num
 */
Messages.parse = function(s) {
    //split at the first bar
    var splitIndex = s.indexOf('|');
    if (splitIndex === -1) {
        //messages with no payload should include the splitter anyway
        return null;
    }

    var msgType = parseInt(s.substring(0, splitIndex), 10);
    if (isNaN(msgType)) {
        return null;
    }

    var params;
    try {
        params = JSON.parse('{' + s.substring(splitIndex+1) + '}');
    } catch (e) {
        return null;
    }
    Messages.expand(params);

    return new Messages.Message(msgType, params);
};

Messages.logError = function(msg, clientId, reason) {
    console.log('ERROR in %s message from client %s, reason: %s',
        Messages.TYPE_NAMES[msg.type],
        clientId.toString(),
        reason
    );
};

Messages.assertParams = function(msg, clientId, params, noLog) {
    var param;
    for (var i = 0; i < params.length; i++) {
        param = params[i];
        if (!(param in msg.params)) {
            if (!noLog)
                Messages.logError(msg, clientId, 'missing param ' + param);
            return false;
        }
    }

    return true;
};