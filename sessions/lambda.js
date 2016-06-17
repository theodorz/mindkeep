'use strict';
console.log('Loading function');

let uuid = require('uuid');
let doc = require('dynamodb-doc');
let dynamo = new doc.DynamoDB();

var mindkeep = {};
mindkeep.sessions = {};

mindkeep.sessions.getOrCreate = function(id, callback) { 
    if(id) {
        dynamo.getItem({ 
            TableName: 'mindkeep.sessions',
            Key:  { id: id }
        }, function(item) { 
            console.log("Session created: " + JSON.stringify(item));
            callback(item);
        });
    } else {
        id = uuid.v1();
        dynamo.getItem({ 
            TableName: 'mindkeep.sessions',
            Key:  { id: id, created: new Date() }
        }, function(item) { 
            console.log("Session created: " + JSON.stringify(item));
            callback(item);
        });
    }
};

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    var method = event.context["http-method"];
    var sessionId = event.sessionId;
    
    if(method == "POST") {
        return mindkeep.sessions.getOrCreate(sessionId, function(item) { 
            callback({
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
            callback(new Error(`Unrecognized operation "${operation}"`));
    }
};
