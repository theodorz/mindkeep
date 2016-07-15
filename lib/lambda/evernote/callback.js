var EvernoteService = require('../../external/evernote/service.js');
var UsersRepository = require('../../repositories/dynamo/users.js');
var SessionRepository = require('../../repositories/dynamo/sessions.js');
var Logger = require('../../infrastructure/console-logger.js');
var Q = require('q');

exports.handler = function(event, context) {

	var fail = function(msg) { 
		return context.fail('http://mindkeep.io?evernote_callback_result=' + msg);
	};

	console.log(event);
	if(!event || !event.params || !event.params.querystring) {
		return fail('missing params');
	}

	var oauth_token = event.params.querystring.oauth_token;
	var oauth_verifier = event.params.querystring.oauth_verifier;
	var sessionId = event.params.querystring.sessionId;
	var redirect = event.params.querystring.redirect;
	if(!redirect) redirect = 'http://www.mindkeep.io?evernote_callback_result=1';

	if(!oauth_token || !oauth_verifier || !sessionId)
		return fail('missing params');

	var logger = new Logger();
	var service = new EvernoteService();
	var users = new UsersRepository(logger);
	var sessions = new SessionRepository(logger);
	
	logger.log('Oauth token: ' + oauth_token);
	logger.log('Oauth verifier: ' + oauth_verifier);

	sessions.get(sessionId)
	.then(function(session) {
		var token = session.evernoteToken;
		if(!token)
			return fail('No evernote token in session');
		if(!session.user)
			return fail('No user in session');
		logger.log('Detected session token: ' + JSON.stringify(token));

		return Q.all([
			service.getAccessToken(token, oauth_verifier),
			users.get(session.user.id)
		]).spread(function(accessToken, user) {
			logger.log('Got user: ' + JSON.stringify(user));
			logger.log('Got access token: ' + JSON.stringify(accessToken));
			user.evernoteAccessToken = accessToken;
			return users.update(user)
			.then(function() {
				logger.log('Successfully updated user with new evernote access token, redirecting...'); 
				return context.fail(redirect);	
			});
		}).fail(function(error) { 
			logger.log(error);
			fail('Error: ' + JSON.stringify(error));
		});

	}).fail(function(error) { 
		logger.log(error);
		fail('Error: ' + JSON.stringify(error));
	});

};

