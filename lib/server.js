var express = require('express');

module.exports = {
	auth: function(config) {
		this._authProvider = initProvider('./auth/', config);
	},
	storage: function(config) {
		this._storageProvider = initProvider('./storage/', config);
	},
	start: function(config, cb) {
		var app = express();
		app._authProvider = this._authProvider;
		app._storageProvider = this._storageProvider;
		
		// Validate configuration
		if(!app._authProvider && !config.allowAnonymous) {
			throw new Error('User authentication provider was not configured');
		}
		
		if(!app._storageProvider) {
			throw new Error('Storage provider was not configured');
		}
		
		app.use(function(req, res, next) {
			var bearer = req.headers.authorization || '',
				token = bearer.split(' ')[1] || '';
				
			req.user = app._authProvider.getByToken(token);
			
			console.log(req.method, req.user && req.user.name || 'GUEST', req.url);

			next();
		});
		
		require('./server-api')(app, config);
		
		app.use(function(req, res) {
			console.log('###POST-', req.method, req.url);
		});
		
		app.listen(config.port, config.hostname, cb);
	}
};

function initProvider(builtInProviderPath, config) {
	if(config && config.type) {
		var provider = require(builtInProviderPath + config.type);
		
		provider.init(config.options);
	
		return provider;
	} else {
		return config;
	}
}