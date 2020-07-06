var Data = {};
module.exports = Data;

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');

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
		var queryString = 'SELECT * FROM User WHERE `name`=?;';

		this.pool.query(queryString, [name], function(err, results) {
			if (err) {
				console.log('SQL ERROR logging in: ' + err.code);
				callback(client, null, 'Database error.');
				return;
			}
			
			if (results.length === 1) {
				bcrypt.compare(password, results[0].password, function(err2, res) {
					if (res) {
						callback(client, results[0]);	
					} else if (err2) {
						callback(client, null, 'Crypto error 1.');
						console.log(err2.toString());
						console.log(err2.code);
					} else {
						callback(client, null, 'Incorrect password.')
					}
					
				});
			} else {
				callback(client, null, 'No such user.');
			}
		});
	};

	this.createUser = function(client, name, password, email, callback) {
		var _this = this;

		bcrypt.genSalt(8, function(err, salt) {
			if (err) {
				callback(client, false, name, 'Crypto error 2.');
				return;
			}

			bcrypt.hash(password, salt, null, function(err, hash) {
				if (err) {
					callback(client, false, name, 'Crypto error 3.');
					return;
				}

				var queryString = 'INSERT INTO User SET ?';
				var queryParams = {name:name, password:hash, settings:JSON.stringify(Data.DEFAULT_USER_SETTINGS)};
				if (typeof email !== 'undefined')
					queryParams.email = email;

				_this.pool.query(queryString, queryParams, function(err, result) {
					if (err) {
						var reason = err.code;
						if (reason == 'ER_DUP_ENTRY') {
							reason = 'User already exists.';
						} else {
							reason = 'Database error.'
						}
						console.log('SQL ERROR creating user: ' + err.code);
						callback(client, false, name, reason);
						return;
					}
					callback(client, true, name);
				});
			});
		});	
	};
};

Data.noop = function(){};