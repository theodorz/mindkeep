
module.exports = {

	get: function(obj, key) {
	    return key.split(".").reduce(function(o, x) {
			return (typeof o == "undefined" || o === null) ? o : o[x];
				    }, obj);
	},

	merge: function(a, b) {
		var res = {};
		if(a)
			for(var key in a)
				res[key] = a[key];
		if(b)
			for(var key in b)
				res[key] = b[key];
		return res;
	}
};
