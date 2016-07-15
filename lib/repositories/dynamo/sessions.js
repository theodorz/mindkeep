'use strict'

let DynamoRepository = require('./base.js');
let Q = require('q');

function DynamoSessionRepository(logger, usersRepository, authService) {
	DynamoRepository.call(this, logger, 'mindkeep.sessions', null);
	this._authService = authService;
	this._usersRepository = usersRepository;
};

DynamoSessionRepository.prototype = new DynamoRepository();

DynamoSessionRepository.prototype.logout = function(id) { 
	var _self = this;
	return this.getOrCreate(id)
	.then(function(session) { 
		session.user = null;
		return _self.update(session);
	});
};

DynamoSessionRepository.prototype.resolve = function(id, authInfo) { 
	var _self = this;

	return this.getOrCreate(id)
		.then(function(session) { 
			if(!authInfo || session.user) {
				_self._logger.log('No auth to be done, returning session');
				return session;
			}
			return _self._authService.lookup(authInfo)
				.then(_self._usersRepository.resolveExternal.bind(_self._usersRepository))
				.then(function(user) { 
					_self._logger.log('User resolved: ' + JSON.stringify(user));
					return _self.getOrCreate(null, user);
				});
		});

	return Q.fcall(_self._authService.lookup.bind(_self._authService), authInfo)
		.then(_self._usersRepository.resolveExternal.bind(_self._usersRepository))
		.then(function(user) { 
			_self._logger.log('User resolved: ' + JSON.stringify(user));
			return _self.getOrCreate(id, user);
		}).catch(function(error) {
			_self._logger.log('Error caught: ' + JSON.stringify(error));
		});	
};

DynamoSessionRepository.prototype.getOrCreate = function(id, user) { 
	if(id) {
		return this.get(id);
    } else {
		var item = { user : user };
		return this.create(item);
    }
};

module.exports = DynamoSessionRepository;
