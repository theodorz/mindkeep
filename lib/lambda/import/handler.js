
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
	var body = Utility.get(event, 'context.body-json');
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
    /*var method = event.context["http-method"];
	var body = event["body-json"];
	var itemId = event.params.path.id;
    var sessionId = event.params.querystring.sessionId;
	if(!sessionId)
		sessionId = body.sessionId;
	if(!sessionId)
		return context.fail('no session');

	var logger = new Logger();
	var imports = new ImportsRepository(logger);
	var users = new UsersRepository(logger);
	var sessions = new SessionRepository(logger);

	return sessions.get(sessionId)
	.then(function(session) { 
		if(!session || !session.user)	
			return context.fail('Invalid session');
		if(method == "GET") 
			return handleQuery(imports, session);
		if(method == "POST") 
			return handleCreate(imports, session, body);
		if(method == "DELETE") 
			return handleDelete(imports, session, itemId);
		throw "Invalid method";
	})
	.then(context.succeed)
	.fail(context.fail);*/
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

/*function handleQuery(imports, session) {
	return imports.scan({ 	
		userId: session.user.id 
	})
	.then(function(items) { 
		return items.map(createView);	
	});
};

function handleCreate(imports, session, item) {
	if(!item.providerId)
		throw "Missing provier";
	item.userId = session.user.id;
	if(!item.filter) 
		item.filter = {};
	return imports.create(item)
	.then(function(item) {
		return createView(item);
	});
};

function handleDelete(imports, session, id) {
	return imports.delete(id)	
	.then(function() { 
		return true; 
	});
};
*/
