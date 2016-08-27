
var ImportService = require('../../../services/import/service.js');
var EvernoteService = require('../../../external/evernote/service.js');
var UserRepository = require('../../../repositories/dynamo/users.js');
var ImportRepository = require('../../../repositories/dynamo/imports.js');
var PostRepository = require('../../../repositories/dynamo/posts.js');
var Logger = require('../../../infrastructure/console-logger.js');

var logger = new Logger();

var posts = new PostRepository(logger); 
var imports = new ImportRepository(logger); 
var users = new UserRepository(logger); 

var externalFactory = {
	create : function(providerId, user) { 
		return new EvernoteService(logger, user.evernoteAccessToken);
	}
};

var service = new ImportService(imports, posts, externalFactory, users);

service.processAll()
.then(function(result) {
	console.log(result);
}, function(error) { 
	console.log(error);
});
