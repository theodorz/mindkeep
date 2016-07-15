var lambda = require('./process.js');

var event = {
};

var context = { 
	succeed: function(result) {
		console.log('Success, items processed: ' + result.length);
	},
	fail: function(error) {
		console.log(error);
		console.trace();
	}
};

lambda.handler(event, context);
