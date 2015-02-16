/**
 * Created by Kevin on 08/02/2015.
 */
var Game = function (playerId, connection, stage) {
    var _this = this;
    var css = 'font-size:200%; font-weight:bold; background:#222; color:#f60';
    console.log('%c MMO Online ', css);

    this.playerId = playerId;
    this.connection = connection;
    this.stage = stage;
    this.graphicsOverlay = new PIXI.Graphics();
    this.texGraphics = new PIXI.Graphics();
    this.spriteContainer = new PIXI.DisplayObjectContainer();
    this.stage.addChild(this.spriteContainer);
    this.stage.addChild(this.graphicsOverlay);

    this.textureManager = new Textures.TextureManager();

    var pane = new UI.Pane(300, 100);
    var actionBar = new UI.ActionBar(0,0,1,2);
    var action = {
        name:'makeunit',
        cursor:'crosshair'
    };
    var action2 = {
        name:'kill',
        cursor:'url(img/cursor/kill.png), auto'
    };
    actionBar.addElement(new UI.ActionButton('img/icon/teleport.png', 50, 50, action),0,0);
    actionBar.slots[0][0].button.onClick = function() {UI.mouseAction = 'makeunit'; UI.setCursor('crosshair');};
    actionBar.addElement(new UI.ActionButton('img/icon/backstab.png', 50, 50, action2),0,1);
    pane.addElement(actionBar);
    pane.div.style.top = 'auto';
    pane.div.style.left = '0';
    pane.div.style.bottom = '0';
    UI.addElement(pane);
    UI.onAction = function(v,a) {_this.onAction(v,a)};
    UI.onLeftMouseClick = function(v) {_this.onLeftMouseClick(v)};
    UI.onLeftMouseDrag = function(v1, v2) {_this.onLeftMouseDrag(v1, v2)};
    UI.onRightMouseClick = function(v) {_this.onRightMouseClick(v)};

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
    this.selected = {};

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
                } else if (msg.type == 'unsee') {
                    this.removeUnit(msg.unit);
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
            avgPing: Math.round(this.connection.meanPing),
            targetDelay: Math.round(this.connection.targetDelay),
            simSpeed: Math.round(this.tickLen/(this.nextStepTime-this.lastStepTime)*100)
        });


        this.states[this.currentStep] = JSON.stringify(this.state);
    };

    this.draw = function() {
        var currentTime = new Date().getTime();
        var stepProgress = (currentTime-this.lastStepTime)/this.tickLen;

        this.graphicsOverlay.clear();
        if (UI.mouseAction == null && UI.leftMouseDragging) {
            var v1 = UI.leftMouseDown;
            var v2 = UI.mousePosition;
            this.graphicsOverlay.lineStyle(1, 0x00aa00, 1);
            this.graphicsOverlay.drawRect(v1.x, v1.y, v2.x-v1.x, v2.y-v1.y);
        }

        for (var id in this.state.units) {
            if (id in this.sprites) {
                var unit = this.state.units[id];
                var sprite = this.sprites[id];

                sprite.draw(stepProgress, unit, this.texGraphics);
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
            var sprite = new Units.UnitSprite(unit, this.textureManager);
            this.spriteContainer.addChild(sprite.container);
            this.sprites[unit.id] = sprite;
        }
        this.state.units[unit.id] = unit;
    };

    this.removeUnit = function(id) {
        if (id in this.state.units) {
            delete this.state.units[id];
        }
        if (id in this.sprites) {
            this.spriteContainer.removeChild(this.sprites[id].container);
            delete this.sprites[id];
        }
    };

    this.selectUnit = function(id) {
        this.selected[id] = true;
        this.sprites[id].sprite.tint = 0x66ff66;
    };

    this.deselectUnit = function(id) {
        delete this.selected[id];
        this.sprites[id].sprite.tint = 0xffffff;
    };

    this.deselectAll = function() {
        for (var id in this.selected) {
            this.deselectUnit(id);
        }
    };

    this.getClickedUnit = function(v) {
        for (var uId in this.sprites) {
            if (!(uId in this.state.units)) {
                continue;
            }
            var rect = this.sprites[uId].container.getBounds();
            if (rect.contains(v.x, v.y)) {
                return uId;
            }
        }
        return null;
    };

    this.onAction = function(v, a) {
        console.log('doing ' + a.name + ' at ' + JSON.stringify(v.scaled(0.1)));
        if (a.name == 'makeunit') {
            var msg = {
                type:'order',
                unit:'global', //global order
                order:{
                    type:'makeunit',
                    point:v
                }
            };
            this.connection.send(msg);
        } else if (a.name == 'kill') {
            var unit = this.getClickedUnit(v);
            if (unit != null) {
                var msg = {
                    type:'order',
                    unit:'global', //global order
                    order:{
                        type:'kill',
                        unit:unit
                    }
                };
                this.connection.send(msg);
            }
        }
    };

    this.onLeftMouseClick = function(v) {
        this.deselectAll();
        var unit = this.getClickedUnit(v);
        if (unit != null) {
            this.selectUnit(unit);
        }
    };

    this.onLeftMouseDrag = function(v1, v2) {
        this.deselectAll();
        var topLeft = [Math.min(v1.x, v2.x), Math.min(v1.y, v2.y)];
        var wh = [Math.max(v1.x, v2.x)-topLeft[0], Math.max(v1.y, v2.y)-topLeft[1]];
        var rect = new PIXI.Rectangle(topLeft[0], topLeft[1], wh[0], wh[1]);
        for (var uId in this.sprites) {
            if (!(uId in this.state.units)) {
                continue;
            }
            var position = this.sprites[uId].getPosition();
            console.log(position);
            //if (this.state.units[uId].owner == this.playerId)
            if (rect.contains(position.x, position.y)) {
                this.selectUnit(uId);
            }
        }
    };

    this.onRightMouseClick = function(v) {
        console.log('nice right click');
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