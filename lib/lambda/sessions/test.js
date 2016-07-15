
var lambda = require('./handler.js');
global.__base = '../';

var event = { 
	context : {
		'http-method': 'POST'
	},
	'body-json' : { 
		sessionId: null
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
