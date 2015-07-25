var TCP = {};
module.exports = TCP;

var tcpClient = function(socket) {
	var _this = this;

	this.socket = socket;
	this.bytesToRead = 0;
	this.dataBuffer = '';

	this.socket.on('data', function (data) {
		_this.onData(data);
	});

	this.socket.on('end', function () {
		_this.onDisconnect();
	});
}

TCP.tcpClient = tcpClient;

tcpClient.prototype.onData = function(data) {
	if (this.bytesToRead > 0) {
		if (this.bytesToRead > data.length) {
			this.dataBuffer += data;
			this.bytesToRead -= data.length;
		} else {
			this.dataBuffer += data.substring(0, this.bytesToRead);
			var tail = data.substring(this.bytesToRead);

			this.onMessage(this.dataBuffer);
			this.bytesToRead = 0;
			this.dataBuffer = '';

			this.onData(tail);
		}
	} else {
		var index = data.indexOf('{');
		
		if (index == -1) {
			this.dataBuffer += data;
		} else {
			this.dataBuffer += data.substring(0,index);
			try {
				this.bytesToRead = parseInt(this.dataBuffer);	
			} catch(e) {
				console.log('TCP error ' + e);
				return;
			}
			this.dataBuffer = '';
			this.onData(data.substring(index));
		}
	}
};

tcpClient.prototype.send = function(data) {
	try {
		this.socket.write(data.length.toString() + data);	
	} catch (e) {
		console.log('TCP error ' + e);
	}
	
};

//The following are meant to be replaced

tcpClient.prototype.onMessage = function(data) {
	console.log('TCP Message: ' + data);
};

tcpClient.prototype.onDisconnect = function() {
	console.log(this.id + ' DISCONNECTED (TCP)');
}