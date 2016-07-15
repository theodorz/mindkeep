'use strict';
console.log('Loading function');

let Q = require('q');

let SessionRepository = require('../../repositories/dynamo/sessions.js');
let UsersRepository = require('../../repositories/dynamo/users.js');
let Logger = require('../../infrastructure/console-logger.js');
let FacebookAuthService = require('../../external/facebook/service.js');

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
	
    
    if(method == "POST") {
        return mindkeep.sessions.getOrCreate(sessionId, function(item) { 
            context.succeed({
                session: item,
                method: method,
                time: new Date(),
                input: event
            });
        });
    }
    
    dynamo.getItem({ 
        TableName: 'mindkeep.users',
        Key:  { id: "279e65bb-4f89-4632-ba25-e43c52848701" }
    }, callback);
    
    return;
    //return context.succeed(method);
    
    const operation = event.operation;

    if (event.tableName) {
        event.payload.TableName = event.tableName;
    }

    switch (operation) {
        case 'create':
            dynamo.putItem(event.payload, callback);
            break;
        case 'read':
            dynamo.getItem(event.payload, callback);
            break;
        case 'update':
            dynamo.updateItem(event.payload, callback);
            break;
        case 'delete':
            dynamo.deleteItem(event.payload, callback);
            break;
        case 'list':
            dynamo.scan(event.payload, callback);
            break;
        case 'echo':
            callback(null, event.payload);
            break;
        case 'ping':
            callback(null, 'pong');
            break;
        default:
            callback(new Error("Unrecognized operation "));
    }
};
