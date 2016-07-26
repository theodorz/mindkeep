'use strict';
console.log('Loading function');

let Q = require('q');

let SessionRepository = require('../../repositories/dynamo/sessions.js');
let UsersRepository = require('../../repositories/dynamo/users.js');
let Logger = require('../../infrastructure/console-logger.js');
let FacebookAuthService = require('../../external/facebook/service.js');
let Utility = require('../../infrastructure/utility.js');

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    var method = event.context["http-method"];
    var sessionId = event['body-json'].sessionId;
    var fbAuth = event['body-json'].fbAuth;
    var logout = event['body-json'].logout;

	var logger = new Logger();
	var users = new UsersRepository(logger);
	var auth = new FacebookAuthService(logger);
	var sessions = new SessionRepository(logger, users, auth);

	if(fbAuth) { 
		console.log('FB Auth received: ' + JSON.stringify(fbAuth));
	}

	if(logout)
		return sessions.logout(sessionId)
		.then(context.succeed)
		.fail(context.fail);

	return sessions.resolve(sessionId, fbAuth)
		.then(context.succeed)
		.fail(context.fail);
};
