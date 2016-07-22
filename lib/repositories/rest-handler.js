
var Q = require('q');


function RestHandler(logger, sessions, repository, viewFactory) {

	this._repository = repository;
	this._logger = logger;
	this._sessions = sessions; 
	this._viewFactory = viewFactory;
};

var proto = RestHandler.prototype;

proto.handle = function(verb, params, body) {
	var _self = this;
	
	_self._logger.log('Handling rest call: ' + JSON.stringify(arguments));

	var sessionId = params.sessionId;
	if(!sessionId)
		return Q.fail({ status: 400, message: 'No session' });

	var queries = [];
	
	queries.push(this._sessions.get(sessionId));

	if(params.id)
		queries.push(this._repository.get(params.id));

	return Q.spread(queries, function(session, item) { 
		_self._logger.log('Session: ' + JSON.stringify(session));

		if(!session || !session.user)	
			throw { status: 500, message: 'Invalid session'};
		if(verb == 'GET' && params.id) 
			return _self.handleLookup(session, params.id);
		if(verb == 'GET') 
			return _self.handleQuery(session, params);
		if(verb == 'PUT') 
			return _self.handleCreate(session, body);
		if(verb == 'POST') 
			return _self.handleUpdate(session, params.id, body);
		if(verb == 'DELETE') 
			return _self.handleDelete(session, params.id);
		throw { status: 500, message: 'Invalid verb'};

	});
};


proto.handleQuery = function(session, params) {
	var _self = this;

	var query = {};
	var ignoreParams = [ 'sessionId' ];

	query.userId = session.user.id;

	for(var key in params) {
		if(ignoreParams.indexOf(key) >= 0)
			continue;
		query[key] = params[key];
	}

	_self._logger.log('Executing query: ' + JSON.stringify(query));

	return this._repository.scan(query)
	.then(function(items) { 
		return items.map(_self._viewFactory);	
	});
};

proto.handleLookup = function(session, id) {
	var _self = this;

	return this._repository.get(id)
	.then(function(item) { 
		return _self._viewFactory(item);	
	});
};
proto.handleCreate = function(session, item) {
	var _self = this;

	var missingRequiredFields = this._repository.getFields()
	.filter(function(i) { return i.required && !item[k]; })
	.map(function(i,k) { return k; });

	if(missingRequiredFields.length)
		throw "Missing required fields: " + missingRequiredFields.join(',');
	
	item.userId = session.user.id;

	return this._repository.create(item)
	.then(function(item) {
		return _self._viewFactory(item);
	});
};

proto.handleUpdate = function(session, id, updates) {
	var _self = this;

	return this._repository.partialUpdate(id, updates)
	.then(function(item) {
		return _self._viewFactory(item);
	});
};

proto.handleDelete = function(session, item) {
	return this._repository.delete(item.id)	
	.then(function() { 
		return true; 
	});
};

module.exports = RestHandler;
