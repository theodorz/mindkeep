'use strict'

let Q = require('q');
let DynamoRepository = require('./base.js');

function Repository(logger) {
	DynamoRepository.call(this, logger, 'mindkeep.posts', 'externalId-index'); 

	this._fields['type'] = { required: true, mapped: true };
	this._fields['userId'] = { required: true, mapped: true };
	this._fields['title'] = { mapped: true };
	this._fields['content'] = { mapped: true };
	this._fields['url'] = { mapped: true };
};

Repository.prototype = new DynamoRepository();
var method = Repository.prototype;

module.exports = Repository;
