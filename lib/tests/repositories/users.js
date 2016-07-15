var Q = require('q');
var UsersRepository = require('./repository.js');
var Logger = require('../infrastructure/console-logger.js');

var logger = new Logger();
var repo = new UsersRepository(logger);

logger.log('Testing UserRepository.getexternal: ');

var externalUser = { 
	email: 'testuser@test.com',
	id: '123456789',
	name: 'Test User'
};

externalUser = {
    "id": "FB:10154136402566136",
    "name": "Theo Zettersten",
    "email": "theodorz@gmail.com"
};

var resolveReq = repo.resolveExternal(externalUser).then(function(result) {
	logger.log('Resolved external user: ');
	logger.log(result);
	
}, function(error) {
	logger.log(error);
 });

Q.allSettled(resolveReq);
