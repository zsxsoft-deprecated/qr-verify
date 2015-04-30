module.exports = function(app) {

	var checkAuth = function(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect("/login");
		}
	}

	app.route("/*").all(function(req, res, next) {
		res.append('Server', 'zsx\'s QR-Code Server');
		req.logHash = utils.getHash(Math.random() + new Date().toISOString());
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
		var renderData = {
			config: config,
			url: req.protocol + "://" + req.hostname + req.path,
			utils: utils,
			isAuthenticated: req.isAuthenticated()
		};

		if (req.isAuthenticated()) {

			// 扫描时自动签到
			events.once("signedUser_" + req.params.userVerify, function(data) {
				if (data.err === null) {
					log.log(req.logHash, "为【" + req.params.userVerify + "】签到成功");
					renderData.data = data.data;
					renderData.err = null;
				} else {
					log.log(req.logHash, "为【" + req.params.userVerify + "】签到出错：" + data.err.toString());
					renderData.err = "签到出错：" + data.err.toString();
				}
				res.render('sign', renderData);
			});

			events.emit("signUser", {
				userVerify: req.params.userVerify,
				logHash: req.logHash,
				login: config.isLogin
			});

		} else {
			events.emit("getUserInfo", {
				userVerify: req.params.userVerify,
				logHash: req.logHash
			});
			events.once("gotUserInfo_" + req.params.userVerify, function(data) {
				renderData.data = data;
				res.render('invitation', renderData);
			});
		}
	});

	/* 
 	 * 管理员登录控制器
	 */
	app.route("/login").post(function(req, res, next) {
		res.header("Content-Type", "text/json; charset=utf-8");
		next();
	}).post(function(req, res, next) {
		passport.authenticate('local', function(err, user, info) {
			req.logIn(user, function(){
				if (user) {
					log.log(req.logHash, req.headers['x-real-ip'] + "登录成功");
					return res.end('{"err": null, "redirect": "/manage"}');
				} else {
					log.log(req.logHash, req.headers['x-real-ip'] + "登录失败");
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
		data.logHash = req.logHash;
		log.log(req.logHash, "新建邀请" + JSON.stringify(data));
		events.emit("createUser", data);
		res.end('{"err": null, "key": "' + data.verify + '"}');
	});



	/* 	
	 * 管理页面控制器
 	 */
	app.route("/manage").all(checkAuth).get(function(req, res) {
		res.render('manage', {
			config: config
		});
	});
	app.route("/config/login").all(checkAuth).post(function(req, res) {
		config.isLogin = !config.isLogin;
		log.log("设置签到状态为" + config.isLogin);
		if (config.isLogin) {
			res.end("当前状态：来校签到");
		} else {
			res.end("当前状态：离校签到");
		}
	});
	app.route("/print").all(checkAuth).get(function(req, res) {
		events.once("gotAll", function(data) {
			res.render('print', {
				config: config,
				data: data.data
			});
		});
		events.emit("getAll", {
			logHash: req.logHash
		});
	});
	app.route("/edit/:userVerify").all(checkAuth).post(function(req, res) {
		log.log(req.logHash, "调整ID为" + req.params.userVerify + "的剩余数量(" + req.body.islogin + ")，增加" + req.body.plus);
		events.once("plusUser_" + req.params.userVerify, function(data) {
			if (data.err === null) {
				log.log(req.logHash, "修改成功");
				res.end("修改成功！");
			} else {
				log.log(req.logHash, "修改出错：" + data.err.toString());
				res.end("修改出错：" + data.err.toString());
			}
		});
		events.emit("plusUser", {
			userVerify: req.params.userVerify,
			plus: req.body.plus,
			logHash: req.logHash,
			login: (req.body.islogin == "false" ? false : true)
		})
	});



};
