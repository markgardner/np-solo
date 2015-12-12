var express = require('express');

module.exports = {
	auth: function(config) {
		this._authProvider = initProvider('./auth/', config);
	},
	storage: function(config) {
		this._storageProvider = initProvider('./storage/', config);
	},
	newRouter: function() {
		var router = express.Router();
	
		router._authProvider = this._authProvider;
		router._storageProvider = this._storageProvider;
		
		return router;
	},
	validateConfiguration: function(config) {
		if(!this._authProvider && config.allowAnonymous !== true) {
			throw new Error('User authentication provider was not configured');
		}
		
		if(!this._storageProvider) {
			throw new Error('Storage provider was not configured');
		}
	},
	start: function(config, cb) {
		var app = express(),
			apiRouter = this.newRouter();
			
		this.validateConfiguration(config);
		
		require('./server-api')(apiRouter, config);
		
		app.use(function(req, res, next) {
			var bearer = req.headers.authorization || '',
				token = bearer.split(' ')[1] || '';
				
			req.user = apiRouter._authProvider.getByToken(token);
			
			logReq(req);

			next();
		});
		
		app.use(config.urlPrefix, apiRouter);
		
		app.use(function(req, res) {
			logReq(req, '**Unhandled**'.red);
			
			res.status(404);
			res.send({ error: 'Unable to handle request' });
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

function logReq(req, prefix) {
	var parts = [
			req.method, '[' + (req.user && req.user.name.cyan || 'GUEST'.yellow) + ']', req.url
		];
		
	parts[0] = parts[0] === 'GET'
		? parts[0].green
		: parts[0].yellow;
		
	if(prefix) {
		parts.unshift(prefix);
	}
	
	console.log.apply(console, parts);
}