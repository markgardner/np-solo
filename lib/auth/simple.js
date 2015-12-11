var users = {},
	usersByTokens = {};

module.exports = {
	init: function(options) {
		var user;
		
		users = options.users;
		
		for(var p in users) {
			user = users[p];
			user.name = p;
			
			if(!user.email) {
				throw new Error('User "' + p + '" doesn\'t have an email');
			}
			
			if(!user.password) {
				throw new Error('User "' + p + '" doesn\'t have a password');
			}
			
			if(!user.token) {
				throw new Error('User "' + p + '" doesn\'t have a token');
			}
			
			usersByTokens[user.token] = user;
		}
	},
	
	authenticate: function(username, password, remoteIp, cb) {
		username = (username || '').toLowerCase();
		
		var existingUser = users[username]; 
		
		if(existingUser && existingUser.password === password) {
			existingUser.lastLogin = Date.now();
			existingUser.lastLoginIp = remoteIp;
			
			cb(null, existingUser.token);
		} else {
			cb(new Error('Unable to find user "' + username + '"'));
		}
	},
	
	getByToken: function(token) {
		return usersByTokens[token];
	}
};