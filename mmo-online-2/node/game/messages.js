/**
 * Created by Kevin on 01/02/2015.
 */
var Messages = {};
module.exports = Messages;

var jsface = require("jsface"),
    Class  = jsface.Class,
    extend = jsface.extend,
    LinAlg = require('../../www/js/linalg'),
    MMOOUtil = require('./mmoo-util');

Messages.TYPES = {
    PING:0,
    MOVE:1,
    MOVETO:2,
    ATTACK:3,
    PATROL:4,
    SKILL:5,
    ATTACKMOVE:6,
    STOP:7,
    JOIN:8,
    CHAT:9,
    COMMAND:10,
    ERROR:11,
    LOGIN:12,
    HANDSHAKE:13,
    GAMES:14,
    HEALTH:15,
    DEATH:16
};

Messages.expansions = {};
Messages.abbreviations = {};

//create abbreviations
//NOTE: To distinguish them from properties which are simply very short, they all begin with a '?'
(function() {
    //terms that should be shortened in communication
    var terms = [
        'step',
        'unit',
        'direction',
        'target',
        'amount',
        'source',
        'position',
        'point',
        'position',
        'moveSpeed',
        'attackDamage',
        'attackRange',
        'attackSpeed',
        'radius',
        'name',
        'password',
        'success',
        'alive',
        'name'
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
    }
});

//NOTE: unique in that it doesn't serialize to standard message format, since the client wouldn't know how to read it
Messages.Handshake = Class(Messages.Message, {
    constructor: function() {},

    serialize: function() {
        return JSON.stringify({
            types: Messages.TYPES,
            abbreviations: Messages.abbreviations,
            expansions: Messages.expansions
        });
    }
})

Messages.LogInResponse = Class(Messages.Message, {
    constructor: function(success) {
        Messages.LogInResponse.$super.call(this, Messages.TYPES.LOGIN, {
            success: success
        });
    }
});

Messages.GameList = Class(Messages.Message, {
    constructor: function(games) {
        var descriptions = [];
        for (var i = 0; i < games.length; i++) {
            descriptions.push({
                name: games[i].name,
                players: Object.keys(games[i].players).length
            });
        }
        Messages.GameList.$super.call(this, Messages.TYPES.GAMES, {
            games: descriptions
        });
    }
});

Messages.UnitMove = Class(Messages.Message, {
    constructor: function(step, unitId, direction, position) {
        Messages.UnitMove.$super.call(this, Messages.TYPES.MOVE, {
            step: step,
            unit: unitId,
            direction: direction,
            position: position
        });
    }
});

Messages.UnitAttack = Class(Messages.Message, {
    constructor: function(step, unitId, targetId) {
        Messages.UnitAttack.$super.call(this, Messages.TYPES.MOVE, {
            step: step,
            unit: unitId,
            target: targetId
        });
    }
});

Messages.UnitHealth = Class(Messages.Message, {
    constructor: function(unitId, sourceId, amount) {
        Messages.UnitHealth.$super.call(this, Messages.TYPES.HEALTH, {
            step: step,
            unit: unitId,
            source: sourceId,
            amount: amount
        });
    }
});

Messages.UnitDeath = Class(Messages.Message, {
    constructor: function(unitId) {
        Messages.UnitDeath.$super.call(this, Messages.TYPES.DEATH, {
            unit: unitId
        });
    }
});

/*************
 * FUNCTIONS *
 *************/
//stringifies the object, without curlies, and abbreviating its keys (not those of any values)
//will need a rehaul if deeper abbreviation is required
Messages.abbreviate = function(obj) {
    var clone = {};
    var keys = Object.keys(obj);
    var key;
    var s;
    
    for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        clone[Messages.getAbbreviation(key)] = obj[key];
    }

    s = JSON.stringify(clone);
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

//returns a param list from the portion of the message following '|'
Messages.expand = function(s) {
    var obj = JSON.parse('{' + s + '}');
    var keys = Object.keys(obj);
    var key, fullKey;

    for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        fullKey = Messages.getExpansion(key);
        obj[fullKey] = obj[key];
        delete obj[key];
    }

    return obj;
};

Messages.getExpansion = function(term) {
    if (term.length == 1)
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
        params = Messages.expand(s.substring(splitIndex+1));
    } catch (e) {
        return null;
    }

    return new Messages.Message(msgType, params);
};