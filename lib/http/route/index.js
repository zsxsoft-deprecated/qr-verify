module.exports = function(app) {

	var checkAuth = function(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect("/login");
		}
	}

	app.all(function(req, res, next) {
		res.append('Server', 'zsx\'s QR-Code Server');
		next();
	});
	app.post(function(req, res, next) {
		next();
	});
	/* 
	 * 页面渲染部分
	 */
	app.get("/login", function(req, res) {
		res.render('login', {
			config: config
		});
	});
	app.get("/invitation/:userId", function(req, res) {
		events.emit("getUserInfo", {
			userId: req.params.userId
		});
		events.once("gotUserInfo_" + req.params.userId, function(data) {
			res.render('invitation', {
				config: config,
				data: data,
				url: req.protocol + "://" + req.hostname + (config.http.port == 80 ? "" : ":" + config.http.port) + req.path,
				utils: utils
			})
		});
	});

	/* 
	 * 管理员登录控制器
	 */
	app.route("/login").post(function(req, res, next) {
		res.header("Content-Type", "text/json; charset=utf-8");
		next();
	}).post(function(req, res, next) {
		passport.authenticate('local', function(err, user, info) {
			// See: https://github.com/expressjs/session/pull/69
			// See also: https://github.com/jaredhanson/passport/issues/306
			// Damn, it's useless -_-
			req.logIn(user, function(){
				if (user) {
					return res.end('{"err": null, "redirect": "/manage"}');
				} else {
					return res.end('{"err": "' + info.message + '"}');
				}
			});
		})(req, res, next);
	});

	/* 
	 * 邀请函控制器
	 */
	app.route("/invitation/:userId").post(checkAuth).post(function(req, res) {
		
	});

	/* 
	 * 管理页面控制器
	 */
	app.route("/manage").all(checkAuth).get(function(req, res) {
		console.log(req.isAuthenticated());
		res.render('manage', {
			config: config
		});
	});



};