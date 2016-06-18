'use strict'

let AWS = require('aws-sdk');
let uuid = require('uuid');
let Q = require('q');

function DynamoSessionRepository(logger) {
	this._logger = logger;
	this._dynamo = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' });
};

DynamoSessionRepository.prototype.getOrCreate = function(id) { 
    var result = Q.defer();
	var logger = this._logger;

	if(id) {
        this._dynamo.getItem({ 
            TableName: 'mindkeep.sessions',
            Key:  { id: id }
        }, function(item) { 
            logger.log("Session created: " + JSON.stringify(item));
            result.resolve(item);
        });
    } else {
        id = uuid.v1();
		
		var item = { id: id, create_time: new Date().getTime() };
		
		logger.log('New sessiond id: ' + id);
        
		this._dynamo.put({ 
            TableName: 'mindkeep.sessions',
            Item: item
        }, function(error) {
			if(error && error.statusCode != 200) { 
            	logger.log("Session error response: " + JSON.stringify(error));
				return result.reject(error);
			}
            
			logger.log("Session created: " + JSON.stringify(item));
           
			result.resolve(item); 
        });
    }

	return result.promise;
};


module.exports = DynamoSessionRepository;
