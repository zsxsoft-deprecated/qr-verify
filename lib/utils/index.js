(function() {
	var crypto = require('crypto');

	// 全局日志
	global.log = {
		log: function(text) {
			console.log("[" + utils.getTime() + "] " + text);
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
			var d = new Date();
			return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds();
		},
		getHash: function(ip, userAgent, hashCode) {
			var str = [
				"IP=" + ip,
				"UA=" + userAgent,
				"HC=" + hashCode
			].join("\n");
			return utils.md5(str);
		},
		getQrSVG: function(data) {
			var key = utils.md5(data);
			if (typeof svgCache[key] != "undefined") return svgCache[key];
			var svgData = utils.base64(qrcode.imageSync(data, {type: 'png' }));
			svgCache[key] = svgData;
			return svgData;
		}
	};
})();