/**
 * Created by Kevin on 01/02/2015.
 */
var Messages = {};
module.exports = Messages;


Messages.ping = function(step) {
    var msg = {type:'ping', step:step};
    return this.abbreviate(msg);
};

Messages.sync = function(step, timeSince) {
    var msg = {type:'sync', step:step, timeSince:timeSince};
    return this.abbreviate(msg);
};

Messages.chat = function(id, text) {
    var msg = {type:'chat', id:id, text:text};
    return this.abbreviate(msg);
};

Messages.dict = function() {
    return JSON.stringify(this.abbreviations);
};

var terms = [
    'type',
    'step',
    'timeSince',
    'text',
    'ping',
    'sync',
    'chat',
    'move',
    'stop',
    'position'
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

Messages.abbreviate = function(o) {
    var s = JSON.stringify(o);
    for (var prop in this.abbreviations) {
        s = String.replace(s, '"'+prop+'"', '"'+this.abbreviations[prop]+'"');
    }
    return s;
};

Messages.expand = function(s) {
    for (var prop in this.expansions) {
        s = String.replace(s, '"'+prop+'"', '"'+this.expansions[prop]+'"');
    }
    return JSON.parse(s);
};