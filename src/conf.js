var fs = require('fs');
var path = require('path');

module.exports = function(conf) {
	var file =     (conf && conf.file)     || path.join('.', 'settings.json');
	var settings = (conf && conf.defaults) || {};
	
	var proto = {
		pull: function() {
			settings = require(file);
		},
		push: function(callback) {
			fs.writeFile(file, JSON.stringify(settings), 'utf8', callback);
		},
		get: function(key) {
			return settings[key];
		},
		set: function(key, val) {
			settings[key] = val;
		},
	};
	
	// Do an initial load of of the file
	try {
		fs.statSync(file);
		proto.pull();
	} catch(e) {
		proto.push();
	}
	
	return proto;
};
