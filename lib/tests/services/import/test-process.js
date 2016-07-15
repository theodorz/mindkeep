
var ImportService = require('../../../services/import/service.js');
var EvernoteService = require('../../../external/evernote/service.js');
var UserRepository = require('../../../repositories/dynamo/users.js');
var Logger = require('../../../infrastructure/console-logger.js');

var logger = new Logger();

var postRepository = { 
	resolveExternal: function(item) { 
		console.log('resolving item: ' + item.id);
		return { externalId: item.id, id: 'Something', title: item.title };
	}
};

var importRepository = { };

var users = new UserRepository(logger); 

var externalFactory = {
	create : function(providerId, user) { 
		return new EvernoteService(user.evernoteAccessToken);
	}
};


var service = new ImportService(importRepository, postRepository, externalFactory, users);

var input = { 
	filter: { 
		query: null
	},
	providerId: 'EVN',
	userId: '901bd850-3789-11e6-a323-512cf0d2482c'
};

service.process(input)
.then(function(result) {
	console.log(result);
}, function(error) { 
	console.log(error);
});
