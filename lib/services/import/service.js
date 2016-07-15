var Q = require('q');

function Service(importRepository, postRepository, externalRepositoryFactory, userRepository) { 
	this._importRepository = importRepository;
	this._postRepository = postRepository;
	this._externalRepositoryFactory = externalRepositoryFactory;
	this._userRepository = userRepository;
};

Service.prototype.processAll = function(batchSize) {
	batchSize = batchSize ? batchSize : 10; 
	var _self = this;
	return this._importRepository.scan({ active: true })
	.then(function(items) { 
		return items.reduce(function(promise, item) {
		    return promise.then(function() {
    		    return _self.process(item);
		    });
		}, Q.resolve());
		//.then(function(chain) {
		//	return items;
		//});
	}, function(error) { 
		console.log('Failed'); 
		console.log(error);
	});
};

Service.prototype.process = function(importInfo, offset) {
	if(!importInfo || !importInfo.userId)
		throw new Error('Invalid arguments'); 
	var _self = this;
	var logger = this._logger;
	offset = offset ? offset : 0;
	console.log('Starting import with batch offset: ' + offset + ', userId: ' + importInfo.userId);

	return this._userRepository.get(importInfo.userId)
	.then(function(user) { 
		var service = _self._externalRepositoryFactory.create(
			importInfo.providerId, user);
		return service.search(importInfo.filter, offset, 5)
	}).then(function(result) {
		console.log('Got items: ' + result.items.length);
		var batch = _self.processBatch(result.items, importInfo);
		var nextOffset = result.items.length + offset;
		if(nextOffset < result.total)
			return batch.then(function() { 
				return _self.process(importInfo, result.items.length);
			});
		return batch;
	}).fail(function(error) {
		console.log('Failed: ' + error.stack); 
		console.log(error);
	});
};

Service.prototype.processBatch = function(items, importInfo) { 
	var _self = this;
	var promises = items.map(function(i) { 	
		i.userId = importInfo.userId;
		i.type = importInfo.type;
		if(importInfo.createProps)
			for(var prop in importInfo.createProps)
				i[prop] = importInfo.createProps[prop];
		return _self._postRepository.resolveExternal(i);
	});

	return Q.all(promises);
};


module.exports = Service;
