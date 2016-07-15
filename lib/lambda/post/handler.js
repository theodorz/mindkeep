

'use strict';
let Q = require('q');

let SessionRepository = require('../../repositories/dynamo/sessions.js');
let PostsRepository = require('../../repositories/dynamo/posts.js');
let UsersRepository = require('../../repositories/dynamo/users.js');
let Logger = require('../../infrastructure/console-logger.js');

exports.handler = (event, context, callback) => {
    console.log('Received posts event:', JSON.stringify(event, null, 2));

    var method = event.context["http-method"];
	var body = event["body-json"];
	var itemId = event.params.path.id;
    var sessionId = event.params.querystring.sessionId;
	if(!sessionId)
		sessionId = body.sessionId;
	if(!sessionId)
		return context.fail('no session');

	var logger = new Logger();
	var posts = new PostsRepository(logger);
	var users = new UsersRepository(logger);
	var sessions = new SessionRepository(logger);

	return sessions.get(sessionId)
	.then(function(session) { 
		if(!session || !session.user)	
			return context.fail('Invalid session');
		if(method == "GET") 
			return handleQuery(posts, session);
		if(method == "POST") 
			return handleCreate(posts, session, body);
		if(method == "DELETE") 
			return handleDelete(posts, session, itemId);
		throw "Invalid method";
	})
	.then(context.succeed)
	.fail(context.fail);
};

function createView(i) { 
	return { 
		id: i.id,
		externalId: i.externalId,
		userId: i.userId,
		title: i.title,
		type: i.type,
		createDate: i.createDate,
		importDate: i.importDate,
		content: i.content
	};
}

function handleQuery(posts, session) {
	return posts.scan({ 	
		userId: session.user.id 
	})
	.then(function(items) { 
		return items.map(createView);	
	});
};

function handleCreate(posts, session, item) {
	if(!item.providerId)
		throw "Missing provier";
	item.userId = session.user.id;
	return posts.create(item)
	.then(function(item) {
		return createView(item);
	});
};

function handleDelete(posts, session, id) {
	return posts.delete(id)	
	.then(function() { 
		return true; 
	});
};
