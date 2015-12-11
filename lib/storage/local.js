var fs = require('fs'),
	path = require('path'),
	mkdirp = require('mkdirp'),
	baseDir;

module.exports = {
	init: function(config) {
		baseDir = path.resolve(config.dir);
	},
	packageExists: function(name, revision) {
		var packageExists = fs.existsSync(resolvePackageFile(name)),
			tarExists = false;
		
		if(revision) {
			tarExists = fs.existsSync(resolveTarFile(name, revision));
		}
		
		return packageExists && (!revision || tarExists);
	},
	savePackage: function(name, pkg, user, cb) {
		var packageFolder = resolvePackageFolder(name),
			packageFile = resolvePackageFile(name),
			maintainers = pkg.maintainers || (pkg.maintainers = []);
		
		if(!maintainers.some(function(m) { return m.name === user.name; })) {
			maintainers.push({
				name: user.name,
				email: user.email
			});
		}
		
		mkdirp(packageFolder, function(err) {
			if(err) { return cb(err); }
			
			fs.writeFile(packageFile, JSON.stringify(pkg), { encoding: 'utf8' }, function(err) {
				if(err) { return cb(err); }
				
				cb(null);
			});
		});
	},
	getPackage: function(name, cb) {
		var packageFile = resolvePackageFile(name);
		
		fs.readFile(packageFile, { encoding: 'utf8' }, function(err, contents) {
			cb(err, contents && JSON.parse(contents));
		});
	},
	saveTarball: function(name, revision, tar, cb) {
		var tarFolder = resolvePackageFolder(name),
			tarFile = resolveTarFile(name, revision),
			buffer = new Buffer(tar.data, 'base64');
		
		mkdirp(tarFolder, function(err) {
			if(err) { return cb(err); }
			
			fs.writeFile(tarFile, buffer, function(err) {
				if(err) { return cb(err); }
				
				cb(null);
			});
		});
	},
	openTarbal: function(name, revision) {
		var tarFile = tarFile = resolveTarFile(name, revision);
		
		return fs.createReadStream(tarFile);
	}
};

function resolveTarFile(name, revision) {
	return path.join(resolvePackageFolder(name), revision + '.tgz');
}

function resolvePackageFile(name) {
	return path.join(resolvePackageFolder(name), 'package.json');
}

function resolvePackageFolder(name) {
	return path.join(baseDir, 'packages', name);
}