
'use strict';
let Q = require('q');

let RestHandler = require('../../repositories/rest-handler.js');
let SessionRepository = require('../../repositories/dynamo/sessions.js');
let ImportsRepository = require('../../repositories/dynamo/imports.js');
let Logger = require('../../infrastructure/console-logger.js');
let Utility = require('../../infrastructure/utility.js');

exports.handler = (event, context, callback) => {
    console.log('Received imports event:', JSON.stringify(event, null, 2));

	var method = Utility.get(event,'context.http-method');
	var body = Utility.get(event, 'body-json');
	var params = Utility.merge(Utility.get(event, 'params.path'), Utility.get(event, 'params.querystring'));

	var logger = new Logger();
	var imports = new ImportsRepository(logger);
	var sessions = new SessionRepository(logger);

	var handler = new RestHandler(logger, sessions, imports, createView);

	return handler.handle(method, params, body)
	.then(context.succeed)
	.fail(function(error) {
		logger.log('Failed');
		if(error.stack)
			logger.log(error.stack);
		context.fail(error);
		return error;
	});
};

function createView(i) { 
	return { 
		id: i.id,
		userId: i.userId,
		active: i.active,
		type: i.type,
		providerId: i.providerId,
		createDate: i.createDate,
		filter: i.filter,
		createProps: i.createProps
	};
}

