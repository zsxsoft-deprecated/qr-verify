module.exports = {
	manage: {
		password: "123456" // 管理员密码
	},
	http: {
		port: 3000, // 端口
		sessionKey: "heyThisiszsx" // SessionKey
	},
	database: {
		type: "mysql", // 数据库类型
		server: "127.0.0.1", // 数据库地址
		username: "root", // 数据库用户名
		password: "123456", // 数据库密码
		port: "3306", // 数据库端口
		db: "qrcode", // 数据库
		table: "qrcode" // 数据表
	},
}