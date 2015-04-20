"use strict";
var version = "0.0.1-20140420";
var async = require("async");
var config = global.config = require('./config');
var events = global.events = new(require('events').EventEmitter)();
var qrcode = global.qrcode = require("qr-image");
var passport = global.passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// 公用函数
require("./lib/utils");

// 处理身份验证中间件
passport.serializeUser(function(something, done) {
	done(null, true);
});
passport.deserializeUser(function(something, done) {
	done(null, true);
});
passport.use(new LocalStrategy(function(username, password, done) {
	if (password != config.manage.password) {
		return done(null, false, {
			message: "Invalid password"
		})
	}
	return done(null, true);
}));

// 加载模块
async.each(["http", "database"], function(module, callback) {
	require("./lib/" + module).init(callback);
}, function(err) {
	events.emit("configUpdated");
	log.log("服务器初始化完成");
});