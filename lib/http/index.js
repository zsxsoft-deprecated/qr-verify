(function() {
	var http = require('http');
	var fs = require('fs');
	var express = require('express');
	var logger = require('morgan');
	var errorHandler = require('errorhandler');
	var path = require('path');
	var app = express();
	var bodyParser = require('body-parser');
	var session = require('express-session');

	module.exports = {
		init: function(callback) {
			app.engine('.html', require('ejs').__express)
				//.use(logger('dev'))
				.use(bodyParser.json())
				.use(bodyParser.urlencoded({
					extended: true
				}))
				.use(session({
					secret: config.http.sessionKey,
					resave: false,
					saveUninitialized: true,
					cookie: {
						maxAge: 24 * 60 * 60 * 1000 // 1 day
					}
				}))
				.use(errorHandler())
				.use(passport.initialize())
				.use(passport.session())
				.use(express.static(path.join(__dirname, "./res/")))
				.set('view engine', 'html')
				.set('views', path.join(__dirname, "./view/"));


			// 处理路由
			fs.readdir(path.join(__dirname, "./route"), function(err, files) {
				files.forEach(function(filename) {
					require(path.join(__dirname, "./route", filename))(app);
				});
			});

			var server = app.listen(config.http.port, function() {
				log.log("服务器于http://127.0.0.1:" + config.http.port + '/成功创建');
				events.emit("httpCreated", server);
				callback(null);
			});


		}
	};

})();