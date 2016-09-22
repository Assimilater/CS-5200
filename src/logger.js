require('datejs');
var fs = require('fs');
var ps = require('process');
var path = require('path');
var winston = require('winston');
var ns = require('./namespace.js');

module.exports = function($ns, prefix) {
	if (!($ns instanceof ns)) { 
		console.log('Fatal error: invalid namspace provided to logger');
		ps.exit();
		return;
	}
	init(ns.addPlugin($ns, 'logger'), prefix);
}

function init(ready, prefix) {
	if (typeof prefix !== 'string') {
		prefix = '';
	} else {
		prefix = prefix + '-';
	}

	// All logs collected in a 'log' folder with a date-stamped name and an iteration number
	// Related to how many times the application was started today
	var stamp = Date.today().toString('yyyy-MM-dd');

	// Obtained from: http://stackoverflow.com/a/21196961/310560
	function ensureExists(path, mask, cb) {
		if (typeof mask == 'function') { // allow the `mask` parameter to be optional
			cb = mask;
			mask = 0777;
		}
		fs.mkdir(path, mask, function(err) {
			if (err) {
				if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
				else cb(err); // something else went wrong
			} else cb(null); // successfully created folder
		});
	}

	// Check the existence of the log directory
	ensureExists('log', function(err) {
		if (err) {
			console.log('Fatal error: unable to create log root! Error dump:')
			console.log(err);
			ps.exit();
			return;
		}

		// Callback for creating the log file upon determining a valid name
		var init = function(file) {
			// Logger is programmed to be context dependent
			// This gets screwed up by the namespace paradigm
			var logger = new (winston.Logger)({
				transports: [
					new (winston.transports.File)({ filename: file })
				],
			});

			ready(function() {
				logger.log.apply(logger, arguments);
			});
		};

		// Recursively handle async checking for a valid file
		(function next(i) {
			var file = path.join('log', '' + prefix + '' + stamp + '.' + i + '.log');
			fs.stat(file, function(err, stats) {
				if (err) {
					if (err.code === 'ENOENT') {
						// File doesn't exit; good to go
						init(file);
					} else {
						// Something unexpected happened
						console.log('Fatal error: unable to create log file! Error dump:')
						console.log(err);
						ps.exit();
						return;
					}
				} else if (stats.isFile()) {
					// 
					next(++i);
				} else {
					// Directory of the same name exists; also good to go
					init(file);
				}
			});
		})(0);
	});
}
