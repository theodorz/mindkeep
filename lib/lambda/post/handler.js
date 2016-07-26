

'use strict';
let Q = require('q');
let SessionRepository = require('../../repositories/dynamo/sessions.js');
let PostsRepository = require('../../repositories/dynamo/posts.js');
let Logger = require('../../infrastructure/console-logger.js');
let RestHandler = require('../../repositories/rest-handler.js');
var Utility = require('../../infrastructure/utility.js');

exports.handler = (event, context, callback) => {
    console.log('Received posts event:', JSON.stringify(event, null, 2));

	var method = Utility.get(event,'context.http-method');
	var body = Utility.get(event, 'body-json');
	var params = Utility.merge(Utility.get(event, 'params.path'), Utility.get(event, 'params.querystring'));

	var logger = new Logger();
	var posts = new PostsRepository(logger);
	var sessions = new SessionRepository(logger);

	var handler = new RestHandler(logger, sessions, posts, createView);

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
		externalId: i.externalId,
		userId: i.userId,
		title: i.title,
		type: i.type,
		created: i.created,
		updated: i.updated,
		imported: i.imported,
		content: i.content,
		reviewStage: i.reviewStage,
		nextReviewDate: i.nextReviewDate
	};
}

