
var lambda = require('./lambda.js')

var event = { 
	context : {
		'http-method': 'POST'
	}
};

var context = {};
context.succeed = function () {
	console.log('success');	
};
context.fail = function() { 
	console.log('failed');
};

lambda.handler(event, context, context.succeed);
