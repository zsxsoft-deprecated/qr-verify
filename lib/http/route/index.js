module.exports = function(app) {

	var checkAuth = function(req, res, next) {
		return next();
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
	app.get("/invitation/:userVerify", function(req, res) {
		events.emit("getUserInfo", {
			userVerify: req.params.userVerify
		});
		events.once("gotUserInfo_" + req.params.userVerify, function(data) {
			res.render('invitation', {
				config: config,
				data: data,
				url: req.protocol + "://" + req.hostname + (config.http.port == 80 ? "" : ":" + config.http.port) + req.path,
				utils: utils,
				isAuthenticated: req.isAuthenticated()
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
	app.route("/invitation/add").post(checkAuth).post(function(req, res) {
		res.header("Content-Type", "text/json; charset=utf-8");
		var data = req.body; // 引用就够了，管他呢
		data.verify = utils.getVerify(data);
		events.emit("createUser", data);
		res.end('{"err": null, "key": "' + data.verify + '"}');
	});
	app.route("/invitation/:userVerify").post(checkAuth).post(function(req, res) {
		events.once("signedUser_" + req.params.userVerify, function(data) {
			log.log("为【" + req.params.userVerify + "】签到");
			console.log(data);
			if (data.err === null) {
				res.end("签到成功！");
			} else {
				res.end("签到出错：" + data.err.toString());
			}
		});
		events.emit("signUser", {
			userVerify: req.params.userVerify
		});
	});



	/* 
	 * 管理页面控制器
	 */
	app.route("/manage").all(checkAuth).get(function(req, res) {
		res.render('manage', {
			config: config
		});
	});
	app.route("/print").all(checkAuth).get(function(req, res) {
		events.once("gotAll", function(data) {
			res.render('print', {
				config: config,
				data: data.data
			});
		});
		events.emit("getAll");
	});
	app.route("/edit/:userVerify").all(checkAuth).post(function(req, res) {
		log.log("调整ID为" + req.params.userVerify + "的剩余数量，增加" + req.body.plus);
		events.once("plusUser_" + req.params.userVerify, function(data) {
			if (data.err === null) {
				res.end("修改成功！");
			} else {
				res.end("修改出错：" + data.err.toString());
			}
		});
		events.emit("plusUser", {
			userVerify: req.params.userVerify,
			plus: req.body.plus
		})
	});



};