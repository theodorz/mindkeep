var lambda = require('./callback.js');

var event = {
	params: {
		querystring: {
			callback: 'http://www.hej.com',
			sessionId: '7d03cca0-3793-11e6-8c54-979607bc2f5d',
			oauth_verifier: 'D0631B76D764AB1B9F2F4E71D4786698',
			oauth_token: 'theodorz.155888C7944.68747470733A2F2F706D32786F666F7A71672E657865637574652D6170692E65752D776573742D312E616D617A6F6E6177732E636F6D2F70726F642F696E746567726174696F6E732F657665726E6F74652F63616C6C6261636B3F73657373696F6E49643D39353632346431302D333931362D313165362D623165372D623138633232316230363535.57053E0C6F51CCE483897E854897160D'
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