var Messages = {};
Messages.types = {
	ping:"p",
	sync:"s",
	get:"g",
	login:"l"
};
Messages.delimiter = "|";

Messages.read = function (data) {
	var msg = {};
    var vals = data.split("|");

    msg.type = vals[0];

    if (msg.type == Messages.types.ping) {
        //shrug
    } else if (msg.type == Messages.types.sync) {
    	msg.step = parseInt(vals[1]);
    	msg.timeSinceStep = parseInt(vals[2]);
    } else {
    	msg.type = "?";
    }

    return msg;
};

Messages.Ping = function() {
	return Messages.types.ping;
};

Messages.Sync = function() {
	return Messages.types.sync;
};

Messages.Get = function(what) {
	return Messages.types.get + Messages.delimiter + what;
};

Messages.Login = function(username, password) {
	return Messages.types.login
		+ Messages.delimiter + username
		+ Messages.delimiter + password;
};