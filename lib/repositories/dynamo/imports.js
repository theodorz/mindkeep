'use strict'

let Q = require('q');
let DynamoRepository = require('./base.js');

function Repository(logger) {
	DynamoRepository.call(this, logger, 'mindkeep.imports'); 

	this._fields['providerId'] = { required: true, mapped: true };
	this._fields['userId'] = { required: true, mapped: true };
	this._fields['type'] = { required: true, mapped: true };
	this._fields['createProps'] = { mapped: true };
};

Repository.prototype = new DynamoRepository();
var method = Repository.prototype;

module.exports = Repository;
