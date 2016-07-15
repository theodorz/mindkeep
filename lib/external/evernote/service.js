
var Evernote = require('evernote').Evernote;
var request = require('request');
var Q = require('q');
var qs = require('querystring');

function EvernoteService(accessToken) {
	this._baseUrl = 'https://sandbox.evernote.com/oauth';
	this._client = new Evernote.Client({
		consumerKey: '',
		consumerSecret: '',
		sandbox: true,
		token: accessToken
	});
};


EvernoteService.prototype.getLoginUrl = function(token) { 
	var _self = this;
	return _self._client.getAuthorizeUrl(token.token);
};

EvernoteService.prototype.getToken = function(callback) { 
	var _self = this;
	var result = Q.defer();

	this._client.getRequestToken(callback, function(error, oauthToken, oauthTokenSecret, results) {
		if(error)
			return result.reject(error);
		return result.resolve({
			token: oauthToken,
			secret: oauthTokenSecret
		});
	});
	return result.promise;
};

EvernoteService.prototype.search = function(filter, offset, max) { 
	var _self = this;
	var result = Q.defer();
	max = max ? max : 0;

	var noteStore = this._client.getNoteStore();

	var noteFilter = new Evernote.NoteFilter;
	noteFilter.ascending = true;
	noteFilter.order = 0;
	noteFilter.words = filter && filter.query ? filter.query : null;
	noteFilter.tagGuids = null;
	noteFilter.inactive = false;
	
	var resultSpec = new Evernote.NotesMetadataResultSpec;
    resultSpec.includeTitle=true;

	noteStore.findNotesMetadata(noteFilter, offset, max, resultSpec, function(error, notes) {
		if(error)
			return result.reject(error);
		return _self.batchGet(notes.notes)
		.then(function(items) {
			debugger;
			return result.resolve({
				total: notes.totalNotes,
				items: items
			});
		}, function(error) { 
			return result.reject(error);
		});
		
		/*return result.resolve({
			total: notes.totalNotes,
			items: notes.notes.map(_self.transformItem)
		});*/
	});

	return result.promise;
};

EvernoteService.prototype.batchGet = function(items) { 
	var _self = this;
	var tasks = items.map(function(i) {
		return _self.get(i.guid);
	});
	return Q.all(tasks);
};

EvernoteService.prototype.transformItem = function(item) { 
	return { 
		id: 'EVN:' + item.guid,
		title: item.title,
		content: item.content ? this.parseContent(item.content) : null,
		created: item.created,
		updated: item.updated,
		url: item.attributes ? item.attributes.sourceURL : null
	};
};

EvernoteService.prototype.get = function(id) { 
	var _self = this;
	var result = Q.defer();

	var noteStore = this._client.getNoteStore();

	noteStore.getNote(id, true, false, false, false, function(error, note) {
		if(error)
			return result.reject(error);
		return result.resolve(_self.transformItem(note));
	});

	return result.promise;
};

EvernoteService.prototype.parseContent = function(content) { 
	return content;
};

EvernoteService.prototype.getAccessToken = function(token, verifier) { 
	var _self = this;
	var result = Q.defer();

	this._client.getAccessToken(token.token, token.secret, verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
		if(error)
			return result.reject(error);		
		return result.resolve(oauthAccessToken);
	});
	return result.promise;
};

module.exports = EvernoteService;
