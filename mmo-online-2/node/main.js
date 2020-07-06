var fs = require('fs');
var Data = require('./data');
var Servers = require('./server');

var LinAlg = require('../www/js/linalg');
var Units = require('./game/units');

GLOBAL.settings = JSON.parse(fs.readFileSync('./config/settings.json', 'utf8'));

var server = new Servers.Server(GLOBAL.settings.port);
server.start();