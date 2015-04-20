(function() {
	var mysql = require("mysql");
	var connection = null;
	var createTableSql = [
		"CREATE TABLE IF NOT EXISTS `%table%` (",
		"user_id int(11) NOT NULL AUTO_INCREMENT,",
		"user_type int(11) NOT NULL,",
		"user_verify varchar(255) NOT NULL,",
		"user_school varchar(255) NOT NULL,",
		"user_name varchar(255) NOT NULL,",
		"user_addtime int(11) NOT NULL DEFAULT '0',",
		"user_remain int(11) NOT NULL DEFAULT '0',",
		"user_all int(11) NOT NULL DEFAULT '0',",
		"PRIMARY KEY (user_id),",
		"KEY danmu_TPISC (user_addtime)",
		") ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;"
	].join("\n");

	var createDatabase = function(callback) {
		connection.query('SELECT 1 FROM `' + config.database.table + '`', function(err, rows) {
			if (err !== null) {
				log.log("Creating Table...");
				connection.query(createTableSql.replace(/%table%/g, config.database.table), function(err, rows) {
					callback(err);
				});
			} else {
				callback(null);
			}
		});
	};

	module.exports = {
		init: function(callback) {
			connection = mysql.createConnection({
				host: config.database.server,
				user: config.database.username,
				password: config.database.password,
				port: config.database.port,
				database: config.database.db,
				//debug: true
			});
			connection.connect(function(err) {
				if (err !== null) {
					log.log("数据库连接出错");
					console.log(err);
				} else {
					log.log("数据库连接正常");
					createDatabase(function(err) {
						callback(err);
					});
				}
			});
			connection.on('error', function(err) {
				if (err.errno != 'ECONNRESET') {
					throw err;
				} else {}
			});

			events.on("createUser", function(data) {
				connection.query("INSERT INTO `%table%` (user_type, user_verify, user_school, user_name, user_addtime, user_remain, user_all) VALUES (?, ?, ?, ?, ?)".replace("%table%", config.rooms[room].table), [
					data.type, data.verify, data.school, data.name, Math.round(new Date().getTime() / 1000), data.all, data.all
				], function(err, rows) {
					if (err !== null) {
						log.log("数据库写入出错");
						console.log(err);
					}
				});
			});
			events.on("getUserInfo", function(data) {
				var userId = data.userId;
				connection.query('SELECT * FROM `%table%` WHERE `user_verify` = ? LIMIT 1'.replace("%table%", config.database.table), [
					data.userId
				], function(err, rows) {
					if (err === null) {
						events.emit("gotUserInfo_" + userId, {
							err: null,
							data: JSON.parse(JSON.stringify(rows).replace(/"user_/g, '"'))
						});
						log.log("用户ID为" + data.userId + "的信息检索成功");
					} else {
						events.emit("gotUserInfo_" + userId, {
							err: null
						});
						log.log("用户ID为" + data.userId + "的信息检索出错");
					}
				});
			});

			events.on("signUser", function(data) {
				var userId = data.userId;
				events.once("gotUserInfo_" + userId, function(ret) {
					if (ret.err !== null) return;
					if (ret.data.remain === 0) { // 剩余人数已尽
						events.emit("signedUser_" + userId, {
							err: "剩余人数为0"
						})
					} else {
						connection.query('UPDATE `%table%` SET `user_remain` = `user_remain` - 1 WHERE `user_verify` = ?', [
							data.userId
						], function(err) {
							events.emit("signedUser_" + userId, {
								err: err
							});
						});
					}
				});
				events.emit("getUserInfo", {
					userId: userId
				});
			});
		}
	};

})();