var ProviderFactory = require('../../external/provider-factory.js');
var UsersRepository = require('../../repositories/dynamo/users.js');
var PostsRepository = require('../../repositories/dynamo/posts.js');
var ImportService = require('../../services/import/service.js');
var ImportsRepository = require('../../repositories/dynamo/imports.js');
var Logger = require('../../infrastructure/console-logger.js');
var Utility = require('../../infrastructure/utility.js');
var Q = require('q');

exports.handler = function(event, context) {

	console.log('Starting import processing: ' + JSON.stringify(event));

	var importId = Utility.get(event, 'importId');	
	var userId = Utility.get(event, 'userId');	

	var logger = new Logger();
	var users = new UsersRepository(logger);
	var posts = new PostsRepository(logger);
	var imports = new ImportsRepository(logger);
	
	
	var importService = new ImportService(imports, posts, ProviderFactory, users);

	if(importId)
		return imports.get(importId)
		.then(function(importInfo) {
			return importService.process(importInfo);
		});

	importService.processAll()
	.then(function(items) {
		logger.log('Successfully processed ' + items.length + ' imports');
		context.succeed(items);
	});
};

