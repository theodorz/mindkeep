'use strict'

let AWS = require('aws-sdk');
let Q = require('q');
let uuid = require('uuid');

var method = DynamoRepository.prototype;

function DynamoRepository(logger, tableName, externalIndex) { 
	this._logger = logger;
	this._dynamo = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' });
	this._tableName = tableName;
	this._externalIndex = externalIndex;
	this._fields = [];
	this._fields['id'] = { type: 'string', mapped: false },
	this._fields['updated'] = { type: 'int', mapped: true },
	this._fields['created'] = { type: 'int', mapped: true, required: true }
};

method.getFields = function() {
	return this._fields;
};

method.get = function(id) { 	
	var _self = this;
	var result = Q.defer();

	this._dynamo.get({ 
		TableName: this._tableName,
		Key: { id: id }
	}, function(error, data) { 
		if(error)
			return result.reject(error);
		return result.resolve(data.Item);
	});

	return result.promise;
};


method.update = function(item) { 	
	var _self = this;
	var result = Q.defer();

	this._dynamo.put({ 
		TableName: this._tableName,
		Item: item
	}, function(error, data) { 
		if(error)
			return result.reject(error);
		return result.resolve(item);
	});

	return result.promise;
};

method.partialUpdate = function(id, updates) { 	
	var _self = this;
	var result = Q.defer();

	var params = { 
		Key: { id: id },
		TableName: this._tableName,
		AttributeUpdates: {}
	};

	for(var key in updates) { 
		params.AttributeUpdates[key] = {
			Action: 'PUT',
			Value: updates[key]
		};
	}

	this._dynamo.update(params, function(error, data) { 
		if(error) 
			return result.reject(error);
		return _self.get(id)
		.then(function(item) {
			return result.resolve(item);
		});
	});

	return result.promise;
};

method.create = function(item) { 
	var _self = this;
	var result = Q.defer();

	var missingFields = this._fields
	.filter(function(i) { return i.required; })
	.filter(function(i, k) { return item[k] != null; });
	if(missingFields.length)
		throw new Error('Missing required fields');	

	item.id = uuid.v1();
	item.created = new Date().getTime();
	
	this._logger.log('Creating item : ' + item.id);

	this._dynamo.put({
		TableName: this._tableName,
		Item: item
	}, function(error) { 
		if(error && error.statusCode != 200) { 
			_self._logger.log('Failed to create: ' + JSON.stringify(error));
			return result.reject(error);
		}
		_self._logger.log('Created item: ' + item.id + ' (' + _self.tableName + ')');
		return result.resolve(item);
	});	

	return result.promise;
};

method.getExternal = function(id) { 	
	var _self = this;
	var result = Q.defer();
	this._logger.log('Looking up external user: ' + id);

	this._dynamo.query({ 
		TableName: this._tableName,
		IndexName: this._externalIndex,
		KeyConditionExpression: 'externalId = :externalId',
		ExpressionAttributeValues: { 
			':externalId': id 
		}
	}, function(error, data) { 
		if(error) {
			_self._logger.log('Error querying for external: ' + JSON.stringify(error));
			return result.reject(error);
		}
		if(!data.Items || !data.Items.length) {
			_self._logger.log('External id ' + id + ' not found');
			return result.resolve(null);
		}
		_self._logger.log('Found external: ' + data.Items[0].id);
		return result.resolve(data.Items[0]);
	});

	return result.promise;
};

method.createExternal = function(external) { 
	this._logger.log('Creating from external: ' + external.id);

	var item = { };
	for(var key in external)
		item[key] = external[key];

	item.id = null;
	item.externalId = external.id;
	item.imported = new Date().getTime();

	return this.create(item);
};

method.equals = function(a, b) {
	for(var key in this._fields) {
		if(!this._fields[key].mapped)
			continue;
		if(a[key] != b[key])
			return false;
	}
	return true;
};

method.updateFields = function(target, source) {
	for(var key in this._fields) {
		if(!this._fields[key].mapped)
			continue;
		target[key] = source[key];
	}
};

method.resolveExternal = function(externalItem) {
	var _self = this;
	if(!externalItem) {
		_self._logger.log('No external item to resolv');
		return null;
	}
	_self._logger.log('Resolving external item: ' + externalItem.id);
	return this.getExternal(externalItem.id)
	.then(function(item) { 
		if(item) { 
			if(!_self.equals(item, externalItem)) {
				_self._logger.log('external item has been updated: ' + item.id);
				_self.updateFields(item, externalItem);
				return _self.update(item);
			}
			_self._logger.log('External item exists in db: ' + item.id);
			return item;
		}
		return _self.createExternal(externalItem)
			.then(function(item) { 
				return _self.getExternal(item.externalId);	
			}, function(error) {
				_self._logger.log('Failed to created external item: ' + error);
		});
	}, function(error) {
		_self._logger.log('Failed to get item: ' + error);
	 });
}

method.scan = function(filter) {
	var _self = this;
	var result = Q.defer();
	var query = { 
		TableName: this._tableName,
		ExpressionAttributeValues: {},
		ExpressionAttributeNames: {}
	};

	var expressions = [];
	for(var key in filter) { 
		var field =	this._fields[key];
		if(!field) {
			_self._logger.log('Field info missing for scan: ' + key);
			continue;
		}

		var value = filter[key];
		var operation = '=';

		if(value[0] == '>' || value[0] == '<') {
			operation = value[0];
			value = parseInt(value.substr(1));
		}

		if(field.type == 'int')
			value = parseInt(value);
		else if(field.type == 'decimal')
			value = parseFloat(value);

		query.ExpressionAttributeValues[':' + key] = value;
		query.ExpressionAttributeNames['#' + key] = key;
		expressions.push('(#' + key + ' ' + operation + ' :' + key + ')');
	}

	query.FilterExpression = expressions.join(' and ');
	
	this._dynamo.scan(query, function(error, data) { 
		if(error) {
			return result.reject(error);
		}
		return result.resolve({
			items: data.Items,
			total: data.Count
		});
	});

	return result.promise;

};

method.delete = function(id) { 
	var _self = this;
	var result = Q.defer();

	this._logger.log('Deleting item : ' + id);

	this._dynamo.delete({
		TableName: this._tableName,
		Key: { id: id } 
	}, function(error) { 
		if(error && error.statusCode != 200) { 
			_self._logger.log('Failed to delete: ' + JSON.stringify(error));
			return result.reject(error);
		}
		_self._logger.log('Deleting item: ' + id + ' (' + _self.tableName + ')');
		return result.resolve();
	});	

	return result.promise;
};

module.exports = DynamoRepository;
