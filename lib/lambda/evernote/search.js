var EvernoteService = require('../../external/evernote/service.js');
var UsersRepository = require('../../repositories/dynamo/users.js');
var SessionRepository = require('../../repositories/dynamo/sessions.js');
var Logger = require('../../infrastructure/console-logger.js');
var Q = require('q');

exports.handler = function(event, context) {

	console.log(event);
	if(!event || !event.params || !event.params.querystring) {
		return context.fail('missing params');
	}

	var sessionId = event.params.querystring.sessionId;
	var query = event.params.querystring.query;
	var userId = event.params.querystring.userId;
	var itemId = event.params.querystring.itemId;

	if(!userId)
		return context.fail('missing params');

	var logger = new Logger();
	var service = new EvernoteService();
	var users = new UsersRepository(logger);
	var sessions = new SessionRepository(logger);

	var filter = { query: query };
	
	users.get(userId)
	.then(function(user) {
		var token = user.evernoteAccessToken;
		if(!token)
			return context.fail('No evernote token on user');
		logger.log('Detected evernote token: ' + JSON.stringify(token));

		var evernote = new EvernoteService(token);

		if(itemId)
			return evernote.get(itemId);
		return evernote.search(filter, 0, 100);
	})
	.then(function(result) { 
		context.succeed(result);
	}).fail(function(error) { 
		logger.log(error);
		fail('Error: ' + JSON.stringify(error));
	});

};

