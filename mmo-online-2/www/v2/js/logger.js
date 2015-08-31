var Logger = function () {
	this.types = {};
};

Logger.prototype.enable = function(name) {
	var type = this.types[name];
	if (typeof type !== 'undefined')
		type.enabled = true;
};

Logger.prototype.disable = function(name) {
	var type = this.types[name];
	if (typeof type !== 'undefined')
		type.enabled = false;
};

Logger.prototype.log = function(name, msg) {
	var type = this.types[name];
	if (typeof type !== 'undefined')
		type.log(msg);
};



Logger.LogType = function(props) {
	this.enabled = true;
	this.prefix = (typeof props.prefix !== 'undefined') ? props.prefix + ": " : "";
	this.textColor = (typeof props.textColor !== 'undefined') ? props.textColor : "#000";
	this.bgColor = (typeof props.bgColor !== 'undefined') ? props.bgColor : "#fff";
};

Logger.LogType.prototype.log = function(msg) {
	if (!this.enabled)
		return;

	console.log("%c"+this.prefix+msg, "background:"+this.bgColor+"; color:"+this.textColor+";");
};