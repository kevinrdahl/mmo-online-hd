/**
 * Created by Kevin on 08/02/2015.
 */
var Game = function (connection, stage) {
    var css = 'font-size:200%; font-weight:bold; background:#222; color:#f60';
    console.log('%c MMO Online ', css);

    this.connection = connection;
    this.stage = stage;
    this.graphics = new PIXI.Graphics();
    this.spriteContainer = new PIXI.DisplayObjectContainer();
    this.stage.addChild(this.spriteContainer);
    this.stage.addChild(this.graphics);

    this.textureManager = new Textures.TextureManager();

    var pane = new UI.Pane(300, 100);
    var actionBar = new UI.ActionBar(0,0,1,5);
    var action = {
        name:'makeunit',
        cursor:'crosshair'
    };
    var action2 = {
        name:'other',
        cursor:'help'
    };
    actionBar.addElement(new UI.ActionButton('img/icon/teleport.png', 50, 50, action),0,0);
    actionBar.slots[0][0].button.onClick = function() {UI.mouseAction = 'makeunit'; UI.setCursor('crosshair');};
    actionBar.addElement(new UI.ActionButton('img/icon/backstab.png', 50, 50, action2),0,1);
    pane.addElement(actionBar);
    pane.div.style.top = 'auto';
    pane.div.style.left = '0';
    pane.div.style.bottom = '0';

    UI.addElement(pane);

    this.currentStep = connection.syncStep;
    this.tickLen = 100;
    this.lastStepTime = new Date().getTime();
    this.nextStepTime = this.lastStepTime + this.tickLen;
    this.delayAdjustRate = 0.2;
    this.messages = {};
    this.lastMessageStep = connection.syncStep;

    this.statusText = new PIXI.Text('', {font:"16px monospace", fill:"white", align:"left"});
    this.stage.addChild(this.statusText);

    this.state = {
        units:{}
    };
    this.states = {};
    this.states[this.currentStep] = JSON.stringify(this.state);
    this.sprites = {};

    UI.leftMouseClick = function(v) {
        if (UI.mouseAction != null) {
            console.log(UI.mouseAction + ' at ' + JSON.stringify(v.scaled(0.1)));
            UI.mouseAction = null;
            UI.setCursor('auto');
        }
    };

    this.onTick = function() {
        var _this = this;
        var currentTime = new Date().getTime();

        this.update();

        this.lastStepTime = currentTime;
        this.setNextStepTime();
        setTimeout(function(){_this.onTick();}, this.nextStepTime - currentTime);
    };

    this.update = function() {
        this.currentStep++;

        //read messages
        if (typeof this.messages[this.currentStep] !== 'undefined') {
            var messages = this.messages[this.currentStep];
            for (var i = 0; i < messages.length; i++) {
                var msg = messages[i];
                var unit;
                if (msg.unit) {
                    unit = this.state.units[msg.unit];
                }
                if (msg.type == 'see') {
                    this.addUnit(msg.unit);
                } else if (msg.type == 'order') {
                    unit.order = msg.order;
                    unit.position = msg.position;
                    unit.nextPosition = unit.position.copy();
                }
                //console.log(msg);
            }
        }

        //update units
        var units = this.state.units;
        for (var id in units) {
            var unit = units[id];
            unit.position.x = unit.nextPosition.x;
            unit.position.y = unit.nextPosition.y;
        }
        for (var id in units) {
            var unit = units[id];
            unit.update();
        }

        //status
        this.setStatusText({
            step: this.currentStep,
            ping: Math.round(this.connection.meanPing),
            targetDelay: Math.round(this.connection.targetDelay),
            simSpeed: Math.round(this.tickLen/(this.nextStepTime-this.lastStepTime)*100),
            numMsgs: Object.keys(this.messages).length
        });


        this.states[this.currentStep] = JSON.stringify(this.state);
    };

    this.draw = function() {
        var currentTime = new Date().getTime();
        var stepProgress = (currentTime-this.lastStepTime)/this.tickLen;

        this.graphics.clear();
        if (UI.mouseAction == null && UI.leftMouseDragging) {
            var v1 = UI.leftMouseDown;
            var v2 = UI.mousePosition;
            this.graphics.lineStyle(1, 0x00aa00, 1);
            this.graphics.drawRect(v1.x, v1.y, v2.x-v1.x, v2.y-v1.y);
        }

        for (var id in this.state.units) {
            if (id in this.sprites) {
                var unit = this.state.units[id];
                var sprite = this.sprites[id];

                var drawPosition = unit.position.add(unit.nextPosition.sub(unit.position).scaled(stepProgress));
                sprite.position.x = drawPosition.x;
                sprite.position.y = drawPosition.y;
            }
        }
    };

    this.onMessage = function(msg) {
        if (typeof msg.step !== 'undefined') {
            if (typeof this.messages[msg.step] === 'undefined') {
                this.messages[msg.step] = [];
            }

            if (msg.type !== 'step') {
                this.messages[msg.step].push(msg);
            }

            //delete old messages and saved states (websocket order guarantees they won't be needed)
            for (; this.lastMessageStep < msg.step-1; this.lastMessageStep++) {
                delete this.messages[this.lastMessageStep];
                delete this.states[this.lastMessageStep];
            }

            if (msg.step <= this.currentStep && msg.type !== 'step') {
                //console.log('%c' + this.currentStep + ': ' + msg.step, 'font-weight:bold;');
                this.rewind(msg.step);
            }
        }
    };

    //re-simulates, starting with "step"
    this.rewind = function(step) {
        console.log('%cRewind ' + (this.currentStep - step + 1), 'color:#fff; background:#f06;');

        var targetStep = this.currentStep;
        this.state = JSON.parse(this.states[step-1], this.stateJSONReviver);
        this.currentStep = step-1;

        while (this.currentStep < targetStep) {
            this.update();
        }
    };

    //takes the object from a 'see' message
    this.addUnit = function(o) {
        var unit = new Units.Unit(o);
        if (!(unit.id in this.sprites)) {
            var sprite = new PIXI.Sprite(this.textureManager.getTexture(unit.sprite));
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            sprite.position.x = unit.position.x;
            sprite.position.y = unit.position.y;
            this.spriteContainer.addChild(sprite);
            this.sprites[unit.id] = sprite;
        }
        this.state.units[unit.id] = unit;
    };

    this.removeUnit = function(id) {
        if (id in this.state.units) {
            delete this.state.units[id];
            if (id in this.sprites) {
                delete this.sprites[id];
            }
        }
    };

    this.setStatusText = function(o) {
        var s = '';
        for (var prop in o) {
            s += prop + ': ' + JSON.stringify(o[prop]) + '\n';
        }
        this.statusText.setText(s);
    };

    this.setNextStepTime = function() {
        this.connection.updateDelay();
        var currentTime = new Date().getTime();
        var step = this.currentStep + 1;
        var serverTime = this.connection.syncStepServerTime + ((step - this.connection.syncStep) * this.tickLen);
        var targetTime = serverTime + this.connection.targetDelay;
        var delayDelta = targetTime - (currentTime + this.tickLen);
        this.nextStepTime = this.lastStepTime + this.tickLen + delayDelta * this.delayAdjustRate;
    };

    this.stateJSONReviver = function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if ('x' in value && 'y' in value) {
                return new LinAlg.Vector2(value.x / 10, value.y / 10);
            } else if (value.class === 'unit') {
                return new Units.Unit(value);
            } else {
                return value;
            }
        } else {
            return value;
        }
    };
};