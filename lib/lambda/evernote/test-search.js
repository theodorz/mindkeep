var lambda = require('./search.js');

var event = {
	params: {
		querystring: {
			query: '',
			sessionId: '7d03cca0-3793-11e6-8c54-979607bc2f5d',
			userId: '901bd850-3789-11e6-a323-512cf0d2482c'//,
//			itemId: '50bf2daf-083b-4bfd-8b48-e9c5c2a0f37d'
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
