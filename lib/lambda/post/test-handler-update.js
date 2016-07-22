

var lambda = require('./handler.js');

var event = {
	"context" : { 
"http-method": "POST",
		"body-json" : { 
			"title": "Updated title",
			"created": new Date().getTime()
		}
	},
	"params" : { 
		"querystring": {
			"sessionId": "74095b90-4433-11e6-a7f6-c15c3a6d1491"
		},
		"path": { 
			"id": "f6373a00-4137-11e6-9e28-2bc45e39b6d4"
		}
	}
};

var context = { 
	succeed: function(result) {
		console.log('success');
		console.log(result);
	},
	fail: function(error) {
		console.log('failed');
		console.log(error);
		console.trace();
	}
};

lambda.handler(event, context);
