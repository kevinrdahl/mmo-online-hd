var Data = {};
module.exports = Data;

var mysql = require('mysql');

Data.DAO = function(config) {
	this.config = config;

	this.connection = mysql.createConnection({
	    host     : config.host,
	    user     : config.user,
	    password : config.password,
	    database : config.database
	});

	this.connect = function(callback) {
		this.connection.connect(function(err) {
			if (err) {
				console.error('DAO connection error: ' + err.stack);
				return;
			}

			callback();
		});
	};

	this.query = function(query, callback) {
		this.connection.query(query, function(err, rows) {
			if (err) {
				console.error('DAO query error: ' + err.stack);
				return;
			}

			callback(rows);
		});
	};

	this.getGameData = function(callback) {
		var c = callback;
		var queries = this.config.dataQueries;
		var numQueries = Object.keys(queries).length;
		var queriesCompleted = [0];
		var gameData = {};

		//icky!
		var callbackFactory = function(queryType) {
			return function(rows) {
				gameData[queryType] = rows;
				queriesCompleted[0] += 1;
				console.log('  ' + queryType);
				if (queriesCompleted[0] == numQueries) {
					c(gameData);
				}
			};
		};

		for (var queryType in queries) {
			this.query(queries[queryType], callbackFactory(queryType));
		}
	};
};

Data.noop = function(){};