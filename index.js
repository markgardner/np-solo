var server = require('./lib/server');

module.exports = function(config) {
	server.auth(config.authProvider);
	server.storage(config.storageProvider);
	
	server.start(config, function() {
		var address = this.address();
		
		if(address.address === '::') {
			address.address = 'localhost';
		}
		
		console.log('Server started on http://' + address.address + ':' + address.port);
	});
};