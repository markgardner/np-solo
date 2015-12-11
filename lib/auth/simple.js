var crypto = require('crypto'),
	fs = require('fs');
var hashAlgorithm,
	users = {},
	usersByTokens = {};

module.exports = {
	init: function(options) {
		var user;
		
		users = options.users;
		hashAlgorithm = options.hashAlgorithm;
		
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
		
		var existingUser = users[username],
			passwordHash = createHash(password);
		
		if(existingUser && existingUser.password === passwordHash) {
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

function createHash(plain) {
	var shasum = crypto.createHash(hashAlgorithm);
	
	shasum.update(plain);
	
	return shasum.digest('hex');
}