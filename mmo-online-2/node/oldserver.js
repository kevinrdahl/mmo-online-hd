/**
 * Created by User on 1/20/2015.
 */
var port = 8999;

var util = require('util');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: port});

var clients = {};
var clientNum = 0;

var startTime = new Date().getTime();

var game = {
    width:800,
    height:600,
    tickLen:50,
    lastTickTime:startTime,
    nextTickTime:startTime + 50, //tickLen
    state: {
        step:0, //tick and step are the same thing here, but not to the client
        units:{
            'dude':{
                type:'man',
                stats:{
                    speed:10
                },
                position:{x:100, y:50},
                nextPosition:{x:100, y:50},
                actions:[]
            }
        }
    }
};

wss.on('connection', function (socket) {
    var id = clientNum++;
    socket.id = id.toString();
    console.log(socket.id + ' CONNECTED');

    socket.on('message', onMessage);
    socket.on('close', onClose);
    socket.sentState = false;

    socket.orders = [];
    clients[id] = (socket);
});


function onMessage(data) {
    if (data == 'ping') {
        this.send(JSON.stringify({type:'ping', step:game.state.step}));
        return;
    } else if (data == 'state') {
        if (!this.sentState) {
            //send this client the game state
            var sinceStep = new Date().getTime() - game.lastTickTime;
            this.send(JSON.stringify({type:'step', step:game.state.step, sinceStep:sinceStep}));
            for (var unitName in game.state.units) {
                var unit = game.state.units[unitName];
                this.send(seeUnitString(unitName));
            }
        }
        this.sentState = true;
        return;
    }

    console.log(this.id.toString() + ': ' + data);

    try {
        var msg = JSON.parse(data);
    } catch (e) {
        console.log('Malformed message!');
        return;
    }

    client.orders.push(msg);
}

function onClose() {
    console.log(this.id + ' DISCONNECTED');
    delete clients[this.id];
}

util.log('Server running on port '+ port + '.');

//=== GAME ===
//TODO: put in its own file?

//name could be nicer, but being consistent with client
function updateLogic() {
    //set next tick
    game.lastTickTime = new Date().getTime();
    var sleepTime = game.nextTickTime - game.lastTickTime;
    setTimeout(updateLogic, sleepTime);
    game.nextTickTime += game.tickLen;

    for (var clientName in clients) {
        readOrders(clientName);
    }

    for (var unitName in game.state.units) {
        updateUnit(unitName);
    }
    for (var unitName in game.state.units) {
        var unit = game.state.units[unitName];
        unit.position = unit.nextPosition;
    }

    game.state.step++;
}

function updateUnit(unitName) {
    var unit = game.state.units[unitName];
    var action = unit.actions[0];

    if (typeof action === 'undefined') {
        return;
    }

    if (action.type == 'move') {
        var destination = action.position;
        var nextPosition = {x:0,y:0};
        var distance = {
            x: destination.x - unit.position.x,
            y: destination.y - unit.position.y
        };

        var speed = unit.stats.speed;
        if (distance.x != 0 && distance.y != 0) {
            speed *= Math.SQRT2;
        }

        //"Elegant" in that this bit looks nice. Kind of silly though.
        if (Math.abs(distance.x) <= speed) {
            nextPosition.x = destination.x;
        } else {
            nextPosition.x = unit.position.x + (speed * normalize(distance.x));
        }
        if (Math.abs(distance.y) <= speed) {
            nextPosition.y = destination.y;
        } else {
            nextPosition.y = unit.position.y + (speed * normalize(distance.y));
        }

        nextPosition.x = Math.round(nextPosition.x);
        nextPosition.y = Math.round(nextPosition.y);

        if (nextPosition.x == destination.x && nextPosition.y == destination.y) {
            //move action is complete
            completeUnitAction(unitName);
            return;
        }
    }
}

//Called when an action has completed. Moves onto the next action or issues a 'stop' to observers
function completeUnitAction(unitName) {
    var unit = game.state.units[unitName];
    var completedOrder = unit.orders.shift();

    if (unit.orders.length == 0) {
        broadcastMessage(actionString(unitName, {type:'stop'}));
    }
}

//returns JSON that the client will understand
//can't just stringify existing orders because server might know more than clients (eg: walking toward unseen units)
//TODO: dictionary of abbreviated attribute names, to be shared with client
function actionString(unitName, action) {
    var unit = game.state.units[unitName];
    var obj = {step:game.step, unit:unitName, type:action.type};

    switch (action.type) {
        case 'stop':
            obj.position = unit.nextPosition;
            break;
        case 'move':
            obj.position = unit.nextPosition;
            obj.destination = order.destination;
    }

    return JSON.stringify(obj);
}

function seeUnitString(unitName) {
    var unit = game.state.units[unitName];
    var obj = {step:game.state.step, unit:unitName, type:'see', position:{x:200,y:200}, stats:unit.stats};
    return JSON.stringify(obj);
}

function broadcastMessage(msg) {
    for (var name in clients) {
        clients[name].send(msg);
    }
}

function readOrders(clientName) {
    var client = clients[clientName];

    //reading orders starting with most recent would allow us to discard old orders if they're not queueing
    //but we might miss something that's supposed to be a non-action (eg toggles)
    for (var i = 0; i < client.orders.length; i++) {
        var order = client.orders[i];
        if (typeof order.type !== 'string') {
            continue;
        }

        if (order.type == 'chat') {
            if (typeof order.text === 'string') {
                broadcastMessage(JSON.stringify({type:'chat', text:clientName + ': ' + order.text}));
            }
            continue;
        }

        //TODO: any of the possible types
        if (order.type == 'move') {
            if (typeof order.unitName !== 'string') {
                continue;
            }
            var unit = game.state.units[unitName];
            if (typeof unit === 'undefined') {
                continue;
            }
            //if (unit.owner == clientname)

            if (order.queue == 1) {
                //queue action
                unit.actions.push(order);
            } else {
                //override other actions, TODO: unless this is a non-action
                unit.actions.splice(0,unit.actions.length, order);
            }
        }
    }
    client.orders.splice(0, client.orders.length);
}

//like a unit circle, but one dimension! exciting stuff here
function normalize(a) {
    return a / Math.abs(a);
}


updateLogic();