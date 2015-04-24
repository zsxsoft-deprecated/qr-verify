(function() {
	var crypto = require('crypto');

	// 全局日志
	global.log = {
		log: function() {
			var text = arguments.length == 1 ? arguments[0] : arguments[1];
			var hash = arguments.length == 2 ? arguments[0] : "";
			console.log(utils.getTime() + "," + (hash != "" ? hash + "," : "") + text);
		}
	};


	// 假装是缓存的Key-Value
	var svgCache = {};

	// 全局工具
	global.utils = {
		md5: function(text) {
			return crypto.createHash('md5').update(text).digest('hex');
		},
		base64: function(text) {
			return new Buffer(text).toString('base64');
		},
		getTime: function() {
			var d;
			if (arguments.length == 0) {
				d = new Date();
			} else {
				d = new Date(arguments[0]);
			}
			return d.toLocaleString();
		},
		getHash: function(string) {
			//var str = string.split("\n");
			return utils.md5(string).substr(0, 16);
		},
		getQrSVG: function(data) {
			var key = utils.md5(data);
			if (typeof svgCache[key] != "undefined") return svgCache[key];
			var svgData = utils.base64(qrcode.imageSync(data, {
				type: 'png'
			}));
			svgCache[key] = svgData;
			return svgData;
		},
		getVerify: function(data) {
			return crypto.createHmac('sha1', config.http.sessionKey).update(data.school + "__" + data.name + "__" + data.description + "__" + Math.random()).digest('hex').replace(/\D/g, "");
		}
	};
})();