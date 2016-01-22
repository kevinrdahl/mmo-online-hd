var Data = {};
module.exports = Data;

var mysql = require('mysql');

Data.DAO = function(config) {
	this.config = config;

	this.pool  = null;

	this.connect = function(callback) {
		this.pool = mysql.createPool({
		  connectionLimit : 10,
		  host            : config.host,
		  user            : config.user,
		  password        : config.password,
		  database : config.database
		});
		callback();
	};

	this.query = function(query, callback) {
		this.pool.query(query, function(err, rows) {
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

	this.tryLogin = function(client, name, password, callback) {
		var queryString = 'SELECT COUNT(*) as num FROM User WHERE `name`=? and password=?;';

		this.pool.query(queryString, [name, password], function(err, results) {
			if (err) {
				console.log('LOGIN ERROR: ' + err.code);
				callback(client, false, name);
				return;
			}
			
			var num = results[0]['num'];
			callback(client, (num==1), name);
		});
	}

	this.tryCreateUser = function(client, name, password, callback) {
		var queryString = 'INSERT INTO User SET ?';

		this.pool.query(queryString, {name:name, password:password}, function(err, result) {
			if (err) {
				console.log('CREATE USER ERROR: ' + err.code);
				callback(client, false, name);
				return;
			}
			callback(client, true, name);
		});	
	}
};

Data.noop = function(){};