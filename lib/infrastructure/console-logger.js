
var method = ConsoleLogger.prototype;

function ConsoleLogger() {
	this._test = "test";
};

method.log = function(msg) { 
	console.log(msg);
};

module.exports = ConsoleLogger;
