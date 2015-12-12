module.exports = function(app, config) {
	var jsonBodyParser = require('body-parser').json({
			limit: config.maxRequestSize 
		});
	
	function accessCheck(permission) {
		return function(req, res, next) {
			var user = req.user,
				userExplicitAccess = user && user.can[permission],
				anonymousHasAccess = config.allowAnonymous;
				
			if(typeof(anonymousHasAccess) === 'object') {
				anonymousHasAccess = anonymousHasAccess[permission];
			}
			
			if(!userExplicitAccess && !anonymousHasAccess) {
				res.status(403);
				res.send({
					error: 'Access denied'
				});
			} else {
				next();
			}
		};
	}
	
	function formatPackageName(params) {
		 return params.scope
			? '@' + params.scope + '/' + params.package
			: params.package
	}
	
	app.put('/-/user/org.couchdb.user::user', jsonBodyParser, function(req, res, next) {
		var remoteIp = req.connection.remoteAddress,
			u = req.body;
			
		if(!app._authProvider) {
			res.status(201);
			
			res.send({
				ok: 'user "' + u.name + '"(guest) logged in',
				token: '00000000-0000-0000-0000-000000000000'
			});
		} else {
			app._authProvider.authenticate(u.name, u.password, remoteIp, function(err, token) {
				if(err) {
					res.status(401);
					res.send({
						error: 'User "' + u.name + '" not found'
					});
				} else {
					res.status(201);
					
					res.send({
						ok: 'user "' + u.name + '" logged in',
						token: token
					});
				}
			});
		}
	});
	
	app.get(['/@:scope/:package', '/:package'], accessCheck('read'), function(req, res) {
		req.params.package = formatPackageName(req.params);
		
		app._storageProvider.getPackage(req.params.package, function(err, pkg) {
			if(err) {
				res.status(404);
				res.send({
					error: 'Package "' + req.params.package + '" not found'
				});
			} else {
				res.status(200);
				res.send(pkg);
			}
		});
	});
	
	app.get(['/@:scope/:package/-/@:scope/:tar', '/:package/-/:tar'], accessCheck('read'), function(req, res) {
		var params = req.params,
			packageName = formatPackageName(params),
			revision = params.tar.slice(params.package.length + 1).slice(0,-4),
			tarStream = app._storageProvider.openTarbal(packageName, revision);

		tarStream.pipe(res);
	});
	
	app.put(['/@:scope/:package', '/:package'], accessCheck('write'), jsonBodyParser, function(req, res) {
		var params = req.params,
			newVersion = req.body['dist-tags'].latest;
		
		req.params.package = formatPackageName(req.params);
		
		if(app._storageProvider.packageExists(params.package, newVersion)) {
			res.status(409);
			res.send({
				reason: 'Package already exists'
			});
		} else {
			var name = req.body.name,
				revision = req.body['dist-tags'].latest,
				tar = req.body._attachments[name + '-' + revision + '.tgz'];
				
			delete req.body._attachments;

			app._storageProvider.savePackage(name, req.body, req.user, function(err) {
				if(err) {
					res.status(409);
					res.send({
						error: 'There was a problem saving package'
					});
				} else {
					app._storageProvider.saveTarball(name, revision, tar, function(err) {
						res.status(200);
						res.send({
							ok: 'Stuff worked'
						});
					});
				}
			});
		}
	});
}