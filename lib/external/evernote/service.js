
var Evernote = require('evernote').Evernote;
var request = require('request');
var Q = require('q');
var qs = require('querystring');
var cheerio = require('cheerio');
var AWS = require('aws-sdk');

function EvernoteService(accessToken) {
	this._client = new Evernote.Client({
		consumerKey: '',
		consumerSecret: '',
		sandbox: false,
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
	var content = this.parseContent(item.content);
	return { 
		id: 'EVN:' + item.guid,
		title: item.title,
		content: item.content ? content.text : null,
		created: item.created,
		updated: item.updated,
		url: item.attributes ? item.attributes.sourceURL : null,
		resources: content.resources
	};
};
function evernoteObjectToString(obj, type) {
	var enmlHash = new Evernote.Buffer(obj).toString(type);
	return enmlHash;
	var result = '';
	for(var i in obj)
		result += (obj[i]);
	return result;
}

EvernoteService.prototype.downloadResource = function(noteId, resource) { 
	var result = Q.defer();
	var noteStore = this._client.getNoteStore();
	noteStore.getResource(resource.guid, true, false, true,false,  function(error, data) {
		if(error) {
			return result.reject(error);
		}
		var s3bucket = new AWS.S3({params: {Bucket: 'mindkeep.io'}});
		var bodyHashString = evernoteObjectToString(data.data.bodyHash, 'hex');
		var bodyBuffer = new Evernote.Buffer(data.data.body);
		return s3bucket.upload({ 
			Key: 'external/evernote/' + bodyHashString, 
			Body: bodyBuffer,
			ContentType: resource.mime,
			ACL: 'public-read'
		}, function(error, data) {
			if (error) {
				return result.reject(true);
			}
			return result.resolve(true);
		});
		//var body = data.body;
		//return result.resolve(true);
	});
	return result.promise;
};

EvernoteService.prototype.downloadResources = function(noteId, resources) { 
	var _self = this;
	if(!resources || !resources.length)
		return Q(0);
	
	var tasks = resources.map(function(i) {
		return _self.downloadResource(noteId, i);
	});

	return Q.all(tasks);
};

EvernoteService.prototype.get = function(id) { 
	var _self = this;
	var result = Q.defer();

	var noteStore = this._client.getNoteStore();

	noteStore.getNote(id, true, false, false, false, function(error, note) {
		if(error)
			return result.reject(error);
		var item = _self.transformItem(note);
		return _self.downloadResources(note.id, note.resources)
		.then(function() {
			return result.resolve(item);
		});
	});

	return result.promise;
};

EvernoteService.prototype.parseContent = function(content) { 
	if(!content)
		return {};

	var $ = cheerio.load(content);

	var noteBody = $('en-note');
	var resources = [];
	$('en-media', noteBody)
	.each(function(i) { 
		var hash = $(this).attr('hash');
		resources.push(hash);
		var img = $('<img>');
		img.attr('src', '/external/evernote/' + hash);
		img.attr('height', $(this).attr('height'));
		img.attr('width', $(this).attr('width'));
		img.css('max-width', '100%');
		img.css('height', 'auto');
		$(this).replaceWith(img);
	});

	return {
		text: noteBody.html(),
		resources: resources
	};
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
