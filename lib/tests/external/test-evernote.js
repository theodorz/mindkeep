var EvernoteService = require('../../external/evernote/service.js');
var service = new EvernoteService();

service.getToken('http://mindkeep.io')
	.then(service.getLoginUrl.bind(service))
	.then(function(result) { 
		console.log(result);
	}, function(error) { 
		console.log(error);
	});

var token = {
	token: 'theodorz.15586900CE7.68747470733A2F2F706D32786F666F7A71672E657865637574652D6170692E65752D776573742D312E616D617A6F6E6177732E636F6D2F70726F642F696E746567726174696F6E732F657665726E6F74652F63616C6C6261636B3F7573657249643D39303162643835302D333738392D313165362D613332332D353132636630643234383263.E317F099C7DDDF3741F146AFB017CAC2', 
	verifier: 'BCFDE627CA9699D7C6B31B87D9790129'
 };

service.getAccessToken(token)
	.then(function(result) { 
		console.log(result);
	}, function(error) { 
		console.log(error);
	});
	
