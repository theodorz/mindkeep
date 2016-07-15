var EvernoteService = require('../../external/evernote/service.js');
var SessionRepository = require('../../repositories/dynamo/sessions.js');
var Logger = require('../../infrastructure/console-logger.js');
var Q = require('q');

exports.handler = function(event, context) {

	console.log(event);

	if(!event || !event.params || !event.params.querystring)
		return context.fail({ status: 400, message: 'Callback parameter missing'});

	var callback = event.params.querystring.callback;
	var sessionId = event.params.querystring.sessionId;
	if(!callback || !sessionId)
		return context.fail({ status: 400, message: 'Session parameter missing'});
		
	var logger = new Logger();
	var sessions = new SessionRepository(logger);
	var service = new EvernoteService();

	Q.all([
		service.getToken(callback),
		sessions.get(sessionId)
	]).spread(function(token, session) { 
		logger.log('Got temporary token: ' + JSON.stringify(token));
		logger.log('Got session: ' + JSON.stringify(session));
		session.evernoteToken = token;
		return sessions.update(session)
		.then(function() {
			logger.log('Updated session with token info');
			var url = service.getLoginUrl(token);
			return context.succeed(url);
		});
	}).fail(function(error) { 
		return context.fail({ status: 500, message: 'Failed to process', error: error});
	});
/*
	service.getLoginUrl(callback)
	.then(function(result) {
		
	}).then(function(result) {
		console.log(result);
		return context.succeed(result);
	}, function(error) {
		console.log(error); 
		return context.fail({ status: 500, message: 'Failed to get login url'});
	});
*/
};

