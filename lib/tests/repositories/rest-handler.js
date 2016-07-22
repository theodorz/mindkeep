
var RestHandler = require('../../repositories/rest-handler.js');
var Logger = require('../../infrastructure/console-logger.js');
var Q = require('q');

var sessions = {
	get: function(id) {
		return Q({ id: '1', user: { id: '1' }});
	}
};

var repo = {
	get: function(id) {
		return Q({ id: id, title: 'test' });
	},
	scan: function(query) {
		return Q([ { id: '1', title: 'test1' } ]);
	},
	getFields: function() {
		return [];
	},
	create: function(item) {
		return Q(item);
	},
	partialUpdate: function(id, updates) {
		return repo.get(id)
		.then(function(item) {
			for(var i in updates)
				item[i] = updates[i];
			return item;
		});
	},
	delete: function(id) {
		return Q(true);
	}
};

var viewFactory = function(item) {
	return item;
};

var onfail = function(error) {
	console.log('failed');
	console.log(error);
	console.log(error.stack);
};

var success = function(result) {
	console.log('success: ' + JSON.stringify(result));
};

var logger = new Logger();
var handler = new RestHandler(logger, sessions, repo, viewFactory);

console.log('Testing Lookup');

handler.handle('GET', { id: '1', sessionId: '1'}, { })
.then(success)
.fail(onfail);

console.log('Testing Query');

handler.handle('GET', { sessionId: '1'}, { })
.then(success)
.fail(onfail);


console.log('Testing Create');

handler.handle('PUT', { sessionId: '1'}, { id: '2', title: 'New item' })
.then(success)
.fail(onfail);

console.log('Testing Update');

handler.handle('POST', { sessionId: '1', id: '2'}, { title: 'updated item 2' })
.then(success)
.fail(onfail);

console.log('Testing Delete');

handler.handle('DELETE', { sessionId: '1', id: '2'}, { })
.then(success)
.fail(onfail);
