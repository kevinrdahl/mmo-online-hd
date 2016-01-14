/**
 * Created by Kevin on 01/02/2015.
 */
var LinAlg = require('../../www/js/linalg');

var Messages = {};
module.exports = Messages;

Messages.TYPES = {
    PING:0,
    MOVE:1,
    MOVETO:2,
    ATTACK:3,
    PATROL:4,
    SKILL:5,
    ATTACKMOVE:6,
    STOP:7
}

Messages.ping = function() {
    var msg = {type:'ping'};
    return this.abbreviate(msg);
};

Messages.step = function(step) {
    var msg = {type:'step', step:step};
    return this.abbreviate(msg);
};

Messages.sync = function(id, step, timeSince) {
    var msg = {id:id, type:'sync', step:step, timeSince:timeSince};
    return this.abbreviate(msg);
};

Messages.chat = function(id, text) {
    var msg = {type:'chat', id:id, text:text};
    return this.abbreviate(msg);
};

Messages.dict = function() {
    return JSON.stringify({
        type:'dict',
        dict:this.abbreviations
    });
};

var terms = [
    'attack',
    'chat',
    'damage',
    'death',
    'global',
    'kill',
    'killer',
    'makeunit',
    'move',
    'order',
    'ping',
    'point',
    'position',
    'see',
    'source',
    'step',
    'stop',
    'sync',
    'text',
    'timeSince',
    'type',
    'unit'
];
var badAbbrevs = [
    'x',
    'y'
];
Messages.abbreviations = {}; //long to short
Messages.expansions = {};    //short to long

for (var i = 0; i < terms.length; i++) {
    var abbrev = terms[i][0];
    if (badAbbrevs.indexOf(abbrev) != -1) {
        abbrev = 'p';
    }
    if (abbrev in Messages.expansions) {
        for (var j = 0; ; j++) {
            if (!(abbrev+j in Messages.expansions)) {
                abbrev = abbrev+j;
                break;
            }
        }
    }
    Messages.abbreviations[terms[i]] = abbrev;
    Messages.expansions[abbrev] = terms[i];
}


function reviver(key, value) {
    if (typeof value === 'object' && value != null && 'x' in value && 'y' in value) {
        return new LinAlg.Vector2(value.x/10, value.y/10);
    } else {
        return value;
    }
}

Messages.abbreviate = function(o) {
    var s = JSON.stringify(o);
    for (var prop in this.abbreviations) {
        s = s.split('"'+prop+'"').join('"'+this.abbreviations[prop]+'"');
    }
    return s;
};

Messages.expand = function(s) {
    for (var prop in this.expansions) {
        s = s.split('"'+prop+'"').join('"'+this.expansions[prop]+'"');
    }
    return JSON.parse(s, reviver);
};

/*
    MESSAGE FORMAT:
    3|"param":"string", "param2":num
 */
Messages.parse = function(s) {
    //split at the first bar
    var splitIndex = s.indexOf('|');
    if (splitIndex === -1) {
        return null;
    }

    var msgType = parseInt(s.substring(0, splitIndex), 10);
    if (isNaN(msgType) || !(msgType in Messages.TYPES)) {
        return null;
    }

    var msgParams;
    try {
        msgParams = JSON.parse(s.substring(splitIndex+1));
    } catch (e) {
        return null;
    }

    var msg = {
        type:msgType,
        params:msgParams
    };

    return msg;
};