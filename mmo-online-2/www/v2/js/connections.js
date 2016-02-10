var Connections = {};

Connections.Connection = Class({
    constructor: function(options) {
        this.connString = null;
        this.onConnect = MmooUtil.noop;
        this.onDisconnect = MmooUtil.noop;
        this.onMessage = MmooUtil.noop;
        this.onError = MmooUtil.noop;

        MmooUtil.applyProps(this, options);

        this.ws = null;

        this.abbreviations = {};
        this.expansions = {};
        this.messageTypes = {};
        this.commInfoReceived = false;
    },

    connect: function() {
        var _this = this;

        if (this.ws !== null)
            this.disconnect('reconnecting');

        if (this.connString === null) {
            logger.log('error', 'CONNECTION no connection string provided');
            return;
        }

        this.ws = new WebSocket(this.connString);

        this.ws.addEventListener('open',    function()  { _this.onWsConnect();    });
        this.ws.addEventListener('close',   function()  { _this.onWsDisconnect(); });
        this.ws.addEventListener('message', function(m) { _this.onWsMessage(m);   });
        this.ws.addEventListener('error',   function(e) { _this.onWsError(e);     });
    },

    disconnect: function(reason) {
        reason = (typeof reason !== 'undefined') ? reason : '???';
        this.ws.close(1000, reason);
        this.ws = null;
    },

    send: function(s) {
        try {
            this.ws.send(s);
            window.logger.log('connSend', s);
        } catch(err) {
            window.logger.log('error', 'CONNECTION ' + err.toString());
        }
    },

    onWsConnect: function() {
        window.logger.log('conn', 'Connected to ' + this.connString);
        this.onConnect();
    },
    onWsDisconnect: function() {
        window.logger.log('Disconnected!');
        this.onDisconnect();
    },
    onWsError: function(err) {
        window.logger.log('error', 'CONNECTION ' + err.toString());
        this.onError(err);
    },
    onWsMessage: function(message) {
        window.logger.log('connRecv', message.data);

        if (!this.commInfoReceived) {
            this.onReceiveCommInfo(message.data);
        } else {
            this.onMessage(message.data);
        }
    },

    onReceiveCommInfo: function(data) {
        this.commInfoReceived = true;

        try {
            var obj = JSON.parse(data);

            Messages.TYPES = obj.types;
            Messages.abbreviations = obj.abbreviations;
            for (var propName in Messages.abbreviations) {
                Messages.expansions[Messages.abbreviations[propName]] = propName;
            }
        } catch(e) {
            logger.log('error', 'parsing connection info, ' + err.toString());
        }
    }
});

Connections.ConnectionManager = Class({
    constructor: function(connection, options) {
        this.connection = connection;

        //SETTINGS
        this.aggressiveness = 0.05;
        this.maxOutPings = 10;
        this.pingInterval = 500;
        this.pingSampleWindow = 10000;
        this.pingWeightWindow = 2000;

        //STATS
        this.pingOutTimes = [];
        this.pingResponseDelays = [];
        this.targetDelay = 200;
        this.meanPing;
    },

    sendPing: function() {
        if (this.pingOutTimes.length >= this.maxOutPings) {
            window.logger.log('conn', 'WARNING: No ping responses received for ' + this.maxOutPings*this.pingInterval/1000 + ' seconds');
            return;
        }

        this.connection.send(Messages.ping);
        this.pingOutTimes.push(Date.now());
    },

    onPing: function() {
        if (this.pingOutTimes.length === 0) {
            window.logger.log('conn', 'Received unexpected ping.');
            return;
        }

        var currentTime = Date.now();
        var outTime = this.pingOutTimes.shift();
        var ping = new Connections.Ping(currentTime, currentTime-outTime);
        this.pings.push(ping);

        this.removeOldPings();
        this.findTargetDelay();
    },

    removeOldPings: function() {
        var currentTime = Date.now();
        var timeCutoff = currentTime - this.pingSampleTime;

        for (var i = 0; i < this.pings.length; i++) {
            if (this.pings[i].time >= timeCutoff)
                break;
        }

        //remove i elements
        this.pings.splice(0, i);
    },

    /*
     * Figure out how far behind the server this client should be running.
     * According to google, I've done something like this:
     *      https://en.wikipedia.org/wiki/Mean_square_weighted_deviation
     *
     * Essentially, for samples which are very recent, pretend there are more of them.
     * Then, set target delay based on the mean and stdDev of the altered sample set.
     */
    findTargetDelay: function() {
        var currentTime = Date.now();
        var mean  = 0;
        var variance = 0;
        var samples = 0;
        var stdDev;
        var weights = [];
        var ping;

        //find the mean
        for (var i = 0; i < this.pings.length; i++) {
            ping = this.pings[i];
            weights.push(this.getWeight(currentTime, ping));
            samples += weights[i];
            mean += weights[i]*ping.delay;
        }
        mean /= samples;

        //find the variance
        for (var i = 0; i < this.pings.length; i++) {
            variance += weights[i] * Math.pow(this.pings[i].delay - mean, 2);
        }
        variance /= samples;
        stdDev = Math.sqrt(variance);

        //at 0 aggressiveness, aim to be 3 standard deviations behind
        //at 0.5, aim for the mean
        //at 1, you're doing something seriously wrong
        this.targetDelay = mean + stdDev * (3 - 6*game.conn.aggressiveness);
        
        //display/debug purposes only
        this.meanPing = mean;

        //let's be realistic
        if (this.targetDelay < 10)
            this.targetDelay = 10;
    },

    //larger factor for more recent samples
    getWeight: function(currentTime, ping) {
        //figure out which window it's in
        //ex: 4000 ms ago with window of 1500 would be index 2
        var windowIndex = Math.floor((currentTime - ping.time) / this.pingWeightWindow);

        //weight is (number of windows) - window Index
        return Math.ceil(this.pingSampleTime / this.pingWeightWindow) - windowIndex;
    }
});

Connections.Ping = Class({
    constructor: function(time, delay) {
        this.time = time;
        this.delay = delay;
    }
});