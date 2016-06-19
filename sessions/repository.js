'use strict'

let AWS = require('aws-sdk');
let uuid = require('uuid');
let Q = require('q');
let request = require('request');

function DynamoSessionRepository(logger) {
	this._logger = logger;
	this._dynamo = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' });
};

DynamoSessionRepository.prototype.resolve = function(id, fbAuth) { 
	var _self = this;

	if(fbAuth) { 
		var result = Q.defer();
		request({ 
			url: 'https://graph.facebook.com/me',
			qs: { 
				fields: 'id,name,about,age_range,bio,birthday,email',
				access_token: fbAuth.accessToken,
				client_id: '1732167897022532',
				client_secret: '8989d2bf99f9eb95c9f7edd02a66856e'
			}},
			function(error, response, body) {
				if(error)
					return result.reject(error);
				result.resolve(body);
		});

		return result.promise.then(function(result) {
			console.log(result);
			// { id, name, age_range, email }
			var externalUser = { 
				id: 'FB:' + result.id,
				name: result.name,
				email: result.email
			};			
			return _self.getOrCreate(id, result);
		});
	} else {	
		return this.getOrCreate(id);
	}
	
};

DynamoSessionRepository.prototype.getOrCreate = function(id) { 
    var result = Q.defer();
	var logger = this._logger;

	if(id) {
        this._dynamo.get({ 
            TableName: 'mindkeep.sessions',
            Key:  { id: id }
        }, function(error, response) {
			if(error)
				return result.reject(error);
 
            logger.log("Existing session found: " + JSON.stringify(response));
            result.resolve(response.Item);
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
