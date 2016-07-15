'use strict'

let Q = require('q');
let DynamoRepository = require('./base.js');

function DynamoUsersRepository(logger) {
	DynamoRepository.call(this, logger, 'mindkeep.users', 'externalId-index'); 
};

DynamoUsersRepository.prototype = new DynamoRepository();
var method = DynamoUsersRepository.prototype;

module.exports = DynamoUsersRepository;
