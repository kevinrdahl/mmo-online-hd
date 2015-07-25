/**
 * Created by Kevin on 08/02/2015.
 */
var Game = function (playerId, connection, stage) {
    var _this = this;
    var css = 'font-size:200%; font-weight:bold; background:#000; color:#fff';
    console.log('%c MMO Online ', css);
    console.log('Signed in as player ' + playerId);

    this.playerId = playerId;
    this.connection = connection;
    this.stage = stage;
    this.graphicsOverlay = new PIXI.Graphics();
    this.texGraphics = new PIXI.Graphics(); //used by rendertextures
    this.spriteContainer = new PIXI.DisplayObjectContainer();

    this.HUD = new Interface.HUDLayer();

    this.stage.addChild(this.spriteContainer);
    this.stage.addChild(this.graphicsOverlay);
    this.stage.addChild(this.HUD.container);

    this.textureManager = new Textures.TextureManager();


    var pane = new Interface.Pane(300, 10, 300, 78);
    this.HUD.addElement('pane', pane);
    var sprite = new PIXI.Sprite(this.textureManager.getTexture('icon_backstab2'));
    var button = new Interface.ActionButton(5,5,sprite);
    button.setHotkey('m1');
    pane.addElement(button);

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

    this.currentStep = connection.syncStep; //always increments by 1
    this.confirmedStep = connection.syncStep-1; //step before the last in which messages were received
    this.simStep = connection.syncStep; //the last step that has actually been simulated

    this.tickLen = 50; //TODO: get this from server
    this.lastStepTime = new Date().getTime();
    this.nextStepTime = this.lastStepTime + this.tickLen;
    this.delayAdjustRate = 0.2;
    this.messages = {};
    this.lastMessageStep = connection.syncStep;

    this.statusText = new PIXI.Text('', {font:"16px Courier", fill:"white", align:"left"});
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

        this.currentStep++;
        while (this.simStep < this.currentStep) {
            this.update();
        }

        this.lastStepTime = currentTime;
        this.setNextStepTime();
        setTimeout(function(){_this.onTick();}, this.nextStepTime - currentTime);
    };

    this.update = function() {
        this.simStep++;

        //update units
        var units = this.state.units;
        for (var id in units) {
            var unit = units[id];
            unit.position.x = unit.nextPosition.x;
            unit.position.y = unit.nextPosition.y;
        }

        //read messages
        if (typeof this.messages[this.simStep] !== 'undefined') {
            var messages = this.messages[this.simStep];
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
                } else if (msg.type == 'damage') {
                    this.onUnitDamage(msg);
                } else if (msg.type == 'death') {
                    unit.dead = true;
                    this.sprites[msg.unit].sprite.tint = 0xaa0000;
                }

                msg.seen = true;
            }
        }

        for (var id in units) {
            var unit = units[id];
            unit.update();
        }

        //status
        this.setStatusText({
            avgPing: Math.round(this.connection.meanPing),
            targetDelay: Math.round(this.connection.targetDelay),
            'upload': this.connection.formatByteSize(this.connection.bandwidthStats.up.rate) + '/s',
            'download': this.connection.formatByteSize(this.connection.bandwidthStats.down.rate) + '/s',
            'total': this.connection.formatByteSize(this.connection.bandwidthStats.up.total) + ' | ' +
                    this.connection.formatByteSize(this.connection.bandwidthStats.down.total)
        });


        this.states[this.simStep] = JSON.stringify(this.state);
    };

    this.draw = function() {
        var currentTime = new Date().getTime();
        var stepProgress = (currentTime-this.lastStepTime)/this.tickLen;

        this.HUD.draw(this.texGraphics);

        this.graphicsOverlay.clear();
        if (UI.mouseAction == null && UI.leftMouseDragging) {
            var v1 = UI.leftMouseDown;
            var v2 = UI.mousePosition;
            this.graphicsOverlay.lineStyle(1, 0x00aa00, 1);
            this.graphicsOverlay.drawRect(v1.x, v1.y, v2.x-v1.x, v2.y-v1.y);
        }

        /*while (this.simStep < this.currentStep) {
            this.update();
        }*/

        var state = JSON.parse(this.states[this.currentStep], this.stateJSONReviver);

        for (var id in state.units) {
            if (id in this.sprites) {
                var unit = state.units[id];
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
                var css = 'color:#093;';
                console.log('%cRECV: ' + JSON.stringify(msg), css);
            }

            //delete old messages and saved states (websocket order guarantees they won't be needed)
            for (; this.lastMessageStep < msg.step-1; this.lastMessageStep++) {
                delete this.messages[this.lastMessageStep];
                delete this.states[this.lastMessageStep];
            }

            this.controlTime(msg.step, (msg.type !== 'step'));
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

    this.controlTime = function(msgStep, needSim) {
        this.confirmedStep = msgStep-1;

        if (msgStep <= this.simStep && needSim) {
            console.log('%cRewind ' + (this.simStep - this.confirmedStep), 'color:#fff; background:#f06;');
            this.state = JSON.parse(this.states[this.confirmedStep], this.stateJSONReviver);
            this.simStep = this.confirmedStep;
        }

        while (this.simStep < this.confirmedStep) {
            this.update();
        }
    };

    //takes the object from a 'see' message
    this.addUnit = function(o) {
        var unit = new Units.Unit(o);
        if (unit.owner == this.playerId) {
            unit.control = 'self';
        } else {
            unit.control = 'friend';
        }
        if (!(unit.id in this.sprites)) {
            var sprite = new Units.UnitSprite(unit, this.textureManager);
            this.spriteContainer.addChild(sprite.container);
            this.sprites[unit.id] = sprite;
            if (unit.dead) {
                sprite.sprite.tint = 0xaa0000;
            }
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

    //TODO: differentiate between selecting own and other units
    this.selectUnit = function(id) {
        this.selected[id] = true;
        this.sprites[id].select();
    };

    this.deselectUnit = function(id) {
        delete this.selected[id];
        if (id in this.sprites) {
            this.sprites[id].deselect();
        }
    };

    this.deselectAll = function() {
        for (var id in this.selected) {
            this.deselectUnit(id);
        }
    };

    this.onUnitDamage = function(msg) {
        var unit = this.state.units[msg.unit];
        var source = this.state.units[msg.source];
        unit.hp -= msg.amount;

        if (!msg.seen) {
            var addText = null;
            var sprite = this.sprites[msg.unit];
            sprite.hpBar.changeVal(unit.hp, false);

            if (source.owner == this.playerId || source.control == 'friend') {
                addText = new PIXI.Text(msg.amount, {
                    font:"18px Tahoma", 
                    fill:"white", 
                    align:"center",
                    stroke:"#000000",
                    strokeThickness:3
                });
            } else if (unit.owner == this.playerId || unit.control == 'friend') {
                addText = new PIXI.Text(msg.amount, {
                    font:"18px Tahoma", 
                    fill:"red", 
                    align:"center",
                    stroke:"#000000",
                    strokeThickness:3
                });
            }

            if (addText != null) {
                sprite.addFloatingText(
                    new HUD.FloatingText(
                        addText,
                        0,
                        750,
                        {x:0, y:-20}
                    )
                );
            }
        }
    };

    //TODO: return a list of all that might have been clicked, sorted by z value
    this.getClickedUnit = function(v) {
        for (var uId in this.sprites) {
            if (!(uId in this.state.units)) {
                continue;
            }
            var rect = this.sprites[uId].sprite.getBounds();
            if (rect.contains(v.x, v.y)) {
                return uId;
            }
        }
        return null;
    };

    this.onAction = function(v, a) {
        var v2 = UI.viewToWorld(v);
        if (a.name == 'makeunit') {
            var msg = {
                type:'order',
                unit:'global', //global order
                order:{
                    type:'makeunit',
                    point:v2
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

        this.HUD.children['pane'].children[0].setCooldown(Date.now() + 5000);
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

            //if (this.state.units[uId].owner == this.playerId)
            if (rect.contains(position.x, position.y)) {
                this.selectUnit(uId);
            }
        }
    };

    this.onRightMouseClick = function(v) {
        var worldCoords = UI.viewToWorld(v);
        var order = {type:'move'};

        //check if clicking a unit
        var unit = this.getClickedUnit(v);
        if (unit == null) {
            order.point = worldCoords;
        } else {
            order.unit = unit;

            if (true /*unit is unfriendly*/) {
                order.type = 'attack';
            }
        }

        for (var selectedUnit in this.selected) {
            if (selectedUnit == unit) {
                continue;
            }
            var msg = {
                type:'order',
                unit:selectedUnit,
                order:order
            };
            this.connection.send(msg);
            var css = 'color:#03c';
            console.log('%cSEND: ' + JSON.stringify(msg), css);
        }
    };

    this.setStatusText = function(o) {
        var s = '';
        for (var prop in o) {
            s += prop + ': ' + o[prop].toString() + '\n';
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