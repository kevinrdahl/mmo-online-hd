/**
 * Created by User on 1/20/2015.
 */
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/../www'));

app.listen(9000);
console.log('HTTP server running on port 9000.');
console.log('Serving ' + __dirname + '/../www');