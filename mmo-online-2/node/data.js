var Data = {};
module.exports = Data;

var mysql = require('mysql');

Data.DEFAULT_USER_SETTINGS = {};

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
				console.error('SQL error: ' + err.stack);
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

	this.getWorlds = function(callback) {
		this.pool.query(
			'SELECT * FROM Worlds;',
			function(err, results) {
				if (err) {
					console.log('SQL ERROR getting world data: ' + err.code);
					callback([]);
				} else {
					callback(results);
				}
			}
		);
	};

	this.getUserCharacters = function(client, callback) {
		var queryString = 'SELECT character_id, `name`, summary' 
			+ ' FROM `Character`'
			+ ' WHERE user_id=? AND world_id=?;';

		this.pool.query(queryString, [client.userId, client.worldId], function(err, results) {
			if (err) {
				console.log('SQL ERROR getting characters: ' + err.code);
				callback(client, null);
			} else {
				callback(client, results);
			}
		});
	};

	this.getCharacter = function(client, characterId, callback) {
		var queryString = 'SELECT character_id, `name`, json' 
			+ ' FROM `Character`'
			+ ' WHERE character_id=? AND user_id=? AND world_id=?;';

		this.pool.query(queryString, [characterId, client.userId, client.worldId], function(err, results) {
			if (err) {
				console.log('SQL ERROR getting character ' + characterId + ': ' + err.code);
				callback(client, null);
			} else {
				callback(client, results[0]);
			}
		});
	};

	this.createCharacter = function(client, characterName, json, callback) {
		var queryString = 'INSERT INTO `Character` SET ?';
		var queryParams = {
			user_id: client.userId,
			world_id: client.worldId,
			name: characterName,
			json: json
		};

		this.pool.query(queryString, queryParams, function(err, results) {
			if (err) {
				console.log('SQL ERROR creating character: ' + err.code);
				callback(client, false, err.code);
			} else {
				callback(client, true);
			}
		});
	};	

	this.login = function(client, name, password, callback) {
		var queryString = 'SELECT user_id, `name`, settings FROM User WHERE `name`=? and password=?;';

		this.pool.query(queryString, [name, password], function(err, results) {
			if (err) {
				console.log('SQL ERROR logging in: ' + err.code);
				callback(client, null, true);
				return;
			}
			
			if (results.length === 1) {
				callback(client, results[0]);
			} else {
				console.log(results);
				callback(client, null);
			}
		});
	};

	this.createUser = function(client, name, password, email, callback) {
		var queryString = 'INSERT INTO User SET ?';
		var queryParams = {name:name, password:password, settings:JSON.stringify(Data.DEFAULT_USER_SETTINGS)};
		if (typeof email !== 'undefined')
			queryParams.email = email;

		this.pool.query(queryString, queryParams, function(err, result) {
			if (err) {
				var reason = err.code;
				if (reason == 'ER_DUP_ENTRY') {
					reason = 'duplicate username';
				}
				console.log('SQL ERROR creating user: ' + err.code);
				callback(client, false, name, reason);
				return;
			}
			callback(client, true, name);
		});	
	};
};

Data.noop = function(){};