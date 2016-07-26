'use strict'

let Q = require('q');
let DynamoRepository = require('./base.js');

function Repository(logger) {
	DynamoRepository.call(this, logger, 'mindkeep.posts', 'externalId-index'); 

	this._fields['type'] = { type: 'string', required: true, mapped: true };
	this._fields['userId'] = { type: 'string', required: true, mapped: true };
	this._fields['title'] = { type: 'string', mapped: true };
	this._fields['content'] = { type: 'string', mapped: false };
	this._fields['url'] = { type: 'string', mapped: true };

	this._fields['nextReviewDate'] = { type: 'int', mapped: true };
	this._fields['reviewStage'] = { type: 'int', mapped: true };
};

Repository.prototype = new DynamoRepository();
var method = Repository.prototype;

module.exports = Repository;
