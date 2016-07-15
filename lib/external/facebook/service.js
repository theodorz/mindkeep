'use strict'

let Q = require('q');
let request = require('request');

function FacebookAuthService() { 
};

FacebookAuthService.prototype.lookup = function(authInfo) {	
	if(!authInfo) {
		console.log('No auth info received to FacebookAuthService');
		return null;
	}
	var result = Q.defer();
	request({ 
		url: 'https://graph.facebook.com/me',
		qs: { 
			fields: 'id,name,about,age_range,bio,birthday,email',
			access_token: authInfo.accessToken,
			client_id: '1732167897022532',
			client_secret: '8989d2bf99f9eb95c9f7edd02a66856e'
		}},
		function(error, response, body) {
			if(error)
				return result.reject(error);
			result.resolve(JSON.parse(body));
	});

	return result.promise.then(function(result) {
		if(!result) {
			console.log('No user authed');
			return null;
		}
		return { 
			id: 'FB:' + result.id,
			name: result.name,
			email: result.email
		};
	});
};

module.exports = FacebookAuthService;
