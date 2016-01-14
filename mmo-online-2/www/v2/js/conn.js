function initConnection () {
	game.conn = {};
	game.conn.serverURL = (typeof QueryString.server !== 'undefined') ? QueryString.server : document.domain;
    game.conn.serverPort = QueryString.port | 8999;
    game.conn.connString = "ws://"+game.conn.serverURL+":"+game.conn.serverPort;

    //game.logger.log("conn", game.conn.connString);
    game.conn.connected = false;
    game.conn.rsa = new RSAKey();

    //config
    game.conn.aggressiveness = 0.05; //ratio of messages expected to arrive late (approx)
    game.conn.maxPings = 10; //number of pings that can be sent before receiving a reply
    game.conn.pingInterval = 500;
    game.conn.pingSendTimes = [];
    game.conn.pingDelays = [];
    game.conn.pingSampleTime = 5000; //5 seconds

    //delay stats
    game.conn.targetDelay = 200;

    game.conn.ws = new WebSocket(game.conn.connString);
    game.conn.ws.addEventListener('open', function() { onConnect(); });
    game.conn.ws.addEventListener('close', function() { onDisconnect(); });
    game.conn.ws.addEventListener('message', function(message) { onMessage(message); });
    game.conn.ws.addEventListener('error', function(err) { onError(err); });
}

function onConnect() {
    game.logger.log("conn", " CONNECTED ");
    game.conn.connected = true;
}

function onDisconnect() {
    game.logger.log("conn", " DISCONNECTED ");
    game.conn.connected = false;
}

function onMessage(message) {
    var data = msg.data;
    game.logger.log("connRecv", msg);

    try {
        var msg = Messages.read(data);

        if (msg.type === Messages.types.ping) {
            onPing();
        } else if (msg.type === Messages.types.sync) {
            //sync up with fletcher
        } else if (msg.type === Messages.types.get) {
            if (msg.what === "rsa") {
                //set public rsa key
            }
        } else {
            game.logger.log("error", "Unknown message type " + msg.type);
        }
    } catch (err) {
        game.logger.log("error", "Can't read \""+data+"\"");
        console.log(err);
    }
}

function sendPing() {
    sendMessage(Messages.Ping());
    game.conn.pingSendTimes.push(Date.now());
}

function onPing() {
    var now = Date.now();
    var sentTime = game.conn.pingSendTimes.unshift();
    var delay = now-sentTime;

    game.conn.pingDelays.push([now, delay]);

    while (game.conn.pingDelays[0][0] < now - game.conn.pingSampleTime) {
        game.conn.pingDelays.unshift();
    }

    getDelayStats();
}

function getDelayStats() {
    var i;
    var pings = [];
    for (i = 0; i < game.conn.pingDelays.length; i++) {
        pings.push(game.conn.pingDelays[i][1]);
    }
    
    var mean = 0;
    var variance = 0;
    var stdDev;

    for (var i = 0; i < pings.length; i++) {
        mean += pings[i];
    }
    mean /= pings.length;

    for (var i = 0; i < pings.length; i++) {
        variance += Math.pow(pings[i]-mean, 2);
    }
    variance /= pings.length;
    stdDev = Math.sqrt(variance);

    game.conn.targetDelay = mean + stdDev * (3 - 6*game.conn.aggressiveness);
    game.conn.meanPing = mean;

    if (game.conn.targetDelay < 5) {
        game.conn.targetDelay = 5;
    }
}

function onError(err) {
    game.logger.log("error", err.message);
}

function sendMessage(data) {
    if (game.conn.connected) {
        game.logger.log("connSend", data);
        game.conn.ws.send(data);    
    } else {
        game.logger.log("error", "Message not sent: " + data);
    }
}