/**
 * Created by Kevin on 07/02/2015.
 */
var Connection = function(serverURL, port, client) {
    var _this = this;

    this.serverURL = serverURL;
    this.port = port;
    this.client = client;
    this.socket = new WebSocket('ws://'+serverURL+':'+port);
    this.socket.addEventListener('open', function() {_this.onConnect();});
    this.socket.addEventListener('close', function() {_this.onDisconnect();});
    this.socket.addEventListener('message', function(message) {_this.onMessage(message);});
    this.socket.addEventListener('error', function() {_this.onError();});

    this.abbreviations = {};
    this.expansions = {};
    this.ready = false;
    this.alive = true;
    this.syncSendTime = 0;
    this.syncStep = 0;
    this.syncStepServerTime = 0;
    this.pings = [];
    this.meanPing = 0;
    this.maxPings = 10;
    this.aggressiveness = 0.1;
    this.pingSendTimes = [];
    this.pingSendInterval = 500;

    this.onConnect = function() {
        this.socket.send(JSON.stringify({type:'dict'}));
        this.client.onConnect();
    };

    this.onDisconnect = function() {
        this.log('Disconnected from ' + this.serverURL + ':' + this.port);
        this.alive = false;
    };

    this.onError = function() {
        this.log('CONNECTION ERROR');
        this.alive = false;
        alert('Connection error. Is the server up?');
    };

    this.send = function(msg) {
        if (!this.alive) {
            return;
        }

        try {
            this.socket.send(this.abbreviate(msg));
        } catch (e) {
            this.log('CONNECTION ERROR');
            this.alive = false;
            console.log(e);
            return;
        }
    };

    this.onMessage = function(message) {
        var data = message.data;
        var currentTime = new Date().getTime();
        var msg;

        try {
            msg = this.expand(data);
        } catch (e) {
            this.log('CONNECTION ERROR');
            console.log(e);
            return;
        }


        switch(msg.type) {
            case 'ping':
                var delay = currentTime - this.pingSendTimes.shift();
                this.pings.push(delay);
                if (this.pings.length > this.maxPings) {
                    this.pings.shift();
                }
                break;
            case 'dict':
                this.abbreviations = msg.dict;
                for (var term in this.abbreviations) {
                    this.expansions[this.abbreviations[term]] = term;
                }
                this.client.onHandShake();
                break;
            case 'sync':
                var step = msg.step;
                var delay = (currentTime - this.syncSendTime) / 2;
                var serverTime = currentTime - delay - msg.timeSince;

                for (var i = 0; i < 5; i++) {
                    this.pings.push(delay);
                }

                this.ready = true;
                this.syncStep = step;
                this.syncStepServerTime = serverTime;
                this.sendPing();
                this.client.onConnectionReady(msg.id);
                break;
            default:
                if (this.ready) {
                    this.client.onMessage(msg);
                }
                break;
        }
    };

    this.updateDelay = function() {
        var pings = JSON.parse(JSON.stringify(this.pings));
        pings.sort();
        //discard highest and lowest
        pings.pop();
        pings.shift();

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

        this.targetDelay = mean + stdDev * (3 - 6*this.aggressiveness);
        this.meanPing = mean;

        if (this.targetDelay < 5) {
            this.targetDelay = 5;
        }
    };

    this.sendPing = function() {
        if (!this.alive) {
            return;
        }

        var _this = this;
        this.send(JSON.stringify({type:'ping'}));
        this.pingSendTimes.push(new Date().getTime());
        setTimeout(function() {_this.sendPing();}, this.pingSendInterval);
    };

    this.sendSync = function() {
        this.socket.send(JSON.stringify({type:'sync'}));
        this.syncSendTime = new Date().getTime();
    };

    this.reviver = function(key, value) {
        if (typeof value === 'object' && value !== null && 'x' in value && 'y' in value) {
            return new LinAlg.Vector2(value.x/10, value.y/10);
        } else {
            return value;
        }
    };

    this.abbreviate = function(o) {
        var s = JSON.stringify(o);
        for (var prop in this.abbreviations) {
            s = s.split('"'+prop+'"').join('"'+this.abbreviations[prop]+'"');
        }
        return s;
    };

    this.expand = function(s) {
        for (var prop in this.expansions) {
            s = s.split('"'+prop+'"').join('"'+this.expansions[prop]+'"');
        }
        return JSON.parse(s, this.reviver);
    };

    this.log = function(msg) {
        var css = 'color:#fff; background:#f30;';
        console.log('%c' + msg, css);
    };
};