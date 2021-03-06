var EvernoteService = require('./evernote/service.js');
var Logger = require('../infrastructure/console-logger.js');

var services = [];

services['EVN'] = function(user) {
	var accessToken = user.evernoteAccessToken;
	if(!accessToken) {
		console.log('Missing token');
		return null;
	}
	return new EvernoteService(new Logger(), accessToken);
};

var externalFactory = {
	create : function(providerId, user) { 
		return services[providerId](user);
	}
};

module.exports = externalFactory;
