/**
 * Created by User on 1/20/2015.
 */
function initGame() {
    initTime = new Date().getTime();

    //Set up PIXI
    stage = new PIXI.Stage(0x66FF99, true); //interactive = true
    renderer = PIXI.autoDetectRenderer(800, 600);
    document.body.appendChild(renderer.view);
    stage.mousedown = function(e) {
        console.log(e);
        console.log(e.global);
    };

    textures = {
        dude: PIXI.Texture.fromImage('img/dude.png')
    };

    //Set up game vars (put this in own file later)
    game = {
        width:800,
        height:600,
        tickLen:50,
        lastTick:initTime,
        nextTick:initTime + 50, //tickLen
        state:{
            step:-1,
            units:{}
        },
        previousStates:{}
    };

    connection = {
        state:'not connected',
        socket: new WebSocket("ws://localhost:8999"),
        connectTime:null,
        connectResponseDelay:0, //round trip
        initialStepDelay:0, //time since the server had run the last step when it responded
        connectStep:-1,

        lastPingTime:initTime,
        pingOut:false,
        pings:[150,150,150],
        pingAvg:150,
        pingHistLen:15,
        lastMessageStep:-1,

        aggressiveness:0.1, //target probability of a message arriving late, high values inadvisable
        targetDelayTime:150,
        currentDelayTime:150, //will generally want to transition smoothly, use some square of difference
        currentSimSpeed:1,
        delaySmoothingFactor:0.1,
        minStepTimeFactor:0.1, //will sim at a max of 10x normal speed
        serverStep: -1,

        messages:{} //for each step, a list of messages
    };

    connection.socket.addEventListener("disconnect", onDisconnect);
    connection.socket.addEventListener("message", onMessage);
    checkSocketState(); //onConnect events don't appear to work correctly. ALTERNATIVE: wait for first message from server
    gameTick();

    //show current and target steps
    stepText = new PIXI.Text('Step: ' + game.state.step + '\nTarget: ' + connection.targetStep, {font:"16px Arial", fill:"black", align:"left"});
    stepText.position.x = 10;
    stepText.position.y = 10;
    stage.addChild(stepText);

    requestAnimFrame( animate );
}

var socketStateNames = [
    'CONNECTING',
    'OPEN',
    'CLOSING',
    'CLOSED'
];

function checkSocketState() {
    if (socketStateNames[connection.socket.readyState] == 'OPEN') {
        onConnect();
    } else {
        setTimeout(checkSocketState, 50);
    }
}

function animate() {
    requestAnimFrame( animate );

    updateDraw();

    // render the stage
    renderer.render(stage);
}

//actual game logic
function gameTick() {
    var currentTime = new Date().getTime();

    if (!connection.pingOut && currentTime - connection.lastPingTime >= 500) {
        sendPing();
    }

    if (game.state.step >= 0) {
        var timeSinceConnect = currentTime - (connection.connectTime - connection.connectResponseDelay/2);
        var serverStep = Math.ceil(connection.connectStep + ((timeSinceConnect + connection.initialStepDelay) / game.tickLen));

        var firstServerStepTime = connection.connectTime - connection.connectResponseDelay/2 - connection.initialStepDelay;
        var nextServerStepTime = firstServerStepTime + game.tickLen*(game.state.step+1 - connection.connectStep);

        var currentDelay = (currentTime+game.tickLen) - nextServerStepTime;  //(serverStep - game.state.step) * game.tickLen;

        var delayDelta = connection.targetDelayTime - currentDelay;
        var adjustedTickLen = game.tickLen + (delayDelta * (connection.delaySmoothingFactor));
        adjustedTickLen = Math.round(Math.max(adjustedTickLen, game.tickLen*connection.minStepTimeFactor));

        setTimeout(gameTick, adjustedTickLen);

        doStep();

        //book keeping
        connection.currentDelayTime = currentDelay;
        connection.serverStep = serverStep;
        connection.currentSimSpeed = game.tickLen / adjustedTickLen;

    } else {
        setTimeout(gameTick, game.tickLen);
    }
}

function doStep() {
    /*var actions = connection.messages[game.state];
    if (typeof actions === 'undefined') {
        //console.log('No message list for step ' + game.state.step);
        return;
    }

    for (var i = 0; i < actions.length; i++) {
        doAction(actions[i]);
    }

    for (var unitName in game.state.units) {
        updateUnit(unitName);
    }
    for (var unitName in game.state.units) {
        var unit = game.state.units[unitName];
        unit.position = unit.nextPosition;
    }*/

    game.state.step++;
}

//TODO:
//TODO:  rewind when message step < current step
//TODO:

function doAction(action) {
    if (action.type == 'see') {
        var unit = {
            name:action.name,
            position:action.position,
            nextPosition:action.position,
            stats:action.stats
        };
        game.state[action.name] = unit;
        unit.sprite = new PIXI.Sprite(textures.dude);
        unit.sprite.anchor.x = 0.5;
        unit.sprite.anchor.y = 0.5;
        unit.sprite.position.x = unit.position.x;
        unit.sprite.position.y = unit.position.y;
        stage.addChild(unit.sprite);

        console.log(unit.sprite);
    }
}

function updateUnit (unitName) {

}

//To be called when a message arrives behind the current sim
//Rewinds to and sims from that point
//Want to avoid calling this
function rewindToStep(step) {
    var currentStep = game.state.step;
    game.state = game.previousStates[step];

    while (game.state.step < currentStep) {
        doStep();
    }
}

//interpolated positions and animation
function updateDraw() {
    for (var unitName in game.state.units) {
        var unit = game.state.units[unitName];
        var sprite = unit.sprite;
        sprite.position.x = unit.position.x;
        sprite.position.y = unit.position.y;
    }

    stepText.setText('Ping: ' + connection.currentDelayTime
        + '\nClient: ' + game.state.step
        + '\nServer: ' + connection.serverStep
        + '\nSimSpeed: ' + connection.currentSimSpeed);
}

//Socket related functions
function onConnect() {
    console.log("Connected to server.");
    connection.state = 'connected';
    connection.connectTime = new Date().getTime();

    connection.socket.send('state');
}

function onDisconnect() {
    console.log("Disconnected from server");
}

function onMessage(message) {
    var data = message.data;
    var msg = JSON.parse(data);

    if (msg.type == 'ping') {
        onPing();
        if (game.state.step >= 0) {
            connection.lastMessageStep = msg.step;
        }
    } else {
        console.log(data);
        console.log(game.state.step);
        if (typeof msg.step !== 'undefined') {
            if (game.state.step == -1) {
                game.state.step = msg.step;
                connection.initialStepDelay = msg.sinceStep;
                connection.connectStep = msg.step;
                connection.connectResponseDelay = new Date().getTime() - connection.connectTime;
            }
            if (typeof connection.messages[msg.step] === 'undefined') {
                connection.messages[msg.step] = [];
            }
            connection.messages[msg.step].push(msg);

            if (msg.step < game.state.step) {
                rewindToStep(msg.step);
            }
        }
    }
}

function sendPing() {
    if (connection.state != 'connected') {
        return;
    }

    try {
        connection.socket.send('ping');
        connection.lastPingTime = new Date().getTime();
    } catch (e) {
        console.log('Unable to send ping.');
        console.log(e);
    }
}

//Using the most recent pings, find an acceptable target delay at which to simulate behind the server
//Assume that ping times will be normally distributed
function onPing() {
    var currentTime = new Date().getTime();

    connection.pings.push((currentTime - connection.lastPingTime) / 2);
    if (connection.pings.length > connection.pingHistLen) {
        connection.pings.splice(0,connection.pings.length-connection.pingHistLen); //redundant but yolo
    }

    var pings = JSON.parse(JSON.stringify(connection.pings)).sort();
    //remove highest and lowest
    pings.pop();
    pings.shift();

    var avg = 0;
    var variance = 0;
    var stdDev = 0;
    for (var i = 0; i < pings.length; i++) {
        avg += pings[i];
    }
    avg /= pings.length;
    for (var i = 0; i < pings.length; i++) {
        variance += Math.pow(pings[i]-avg, 2);
    }
    variance /= pings.length;
    stdDev = Math.sqrt(variance);

    connection.pingAvg = avg;
    connection.pingOut = false;
    connection.lastPingTime = currentTime;

    //aggressiveness = 1: avg + stdDev*-3, almost all messages will be late (JERKY, MORE RESPONSIVE)
    //aggressiveness = 0: avg + stdDev*3, almost all messages will be timely (SMOOTH, LESS RESPONSIVE)
    connection.targetDelayTime = Math.round(avg + stdDev*(3 - connection.aggressiveness*6));

    var delayDelta = connection.targetDelayTime - connection.currentDelayTime;
    if (delayDelta >= connection.delayDeltaMax) {
        connection.currentDelayTime = connection.targetDelayTime
    } else {
        connection.currentDelayTime += delayDelta;
    }
    //console.log(JSON.stringify(connection.pings));
    //console.log(stdDev);
    //console.log(connection.targetDelayTime);
}

//like a unit circle, but one dimension! exciting stuff here
function normalize(a) {
    return a / Math.abs(a);
}