var lambda = require('./login.js');

var event = {
	params: {
		querystring: {
			callback: 'http://www.hej.com',
			sessionId: '7d03cca0-3793-11e6-8c54-979607bc2f5d'
		}
	}
};

var context = { 
	succeed: function(result) {
		console.log(result);
	},
	fail: function(error) {
		console.log(error);
	}
};

lambda.handler(event, context);
