
var lambda = require('./handler.js');

var event = {
	"context" : { 
		"http-method": "GET",
		"body-json" : { }
	},
	"params" : { 
		"querystring": {
			"sessionId": "74095b90-4433-11e6-a7f6-c15c3a6d1491"
		},
		"path": { }
	}
};

var context = { 
	succeed: function(result) {
		//console.log('Success, items found: ' + result.length);
		console.log(result);
	},
	fail: function(error) {
		console.log(error);
		console.trace();
	}
};

lambda.handler(event, context);
