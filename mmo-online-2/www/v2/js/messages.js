var Messages = {};
Messages.TYPES = {};
Messages.TYPE_NAMES = {};
Messages.abbreviations = {};
Messages.expansions = {};

Messages.ping = '0|';

Messages.Message = Class({
    constructor: function(type, params) {
        this.type = type;
        this.params = params;
    },

    serialize: function() {
        return this.type.toString() + '|' + Messages.abbreviate(this.params);
    },

    debugString: function() {
        return Messages.TYPE_NAMES[this.type] + ' (' + this.type + ') ' + JSON.stringify(this.params);
    }
});

Messages.LoginUser = Class(Messages.Message, {
	constructor: function(username, password) {
		Messages.LoginUser.$super.call(this, Messages.TYPES.USER, {
			action:'loginUser',
			name:username,
			password:password
		})
	}
});

/*
	General purpose transformations are copy-pasted from server messages.js.
	In theory they could be the same file, but node is poopy when things 
	aren't in a big happy directory.
*/

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