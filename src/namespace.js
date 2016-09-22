var ps = require('process');

function Namespace() {
	if (!(this instanceof Namespace)) { return new Namespace(); }

	var wait = [];
	var pending = [];
	var available = [];
	var $ = {};

	// Helper to remove plugins that are loaded from the waiting list
	var ready = function(promise) {
		// Iterating in reverse so splice can be done safely
		var i = promise.waiting.length - 1;
		for (; i >= 0; --i) {
			var index = available.indexOf(promise.waiting[i]);
			if (index !== -1) {
				promise.waiting.splice(i, 1);
			}
		}

		return promise.waiting.length === 0;
	};

	// Helper to pass all requested plugins to the callback
	var invoke = function(promise) {
		var args = [];
		var i = 0;
		for (; i < promise.plugins.length; ++i) {
			args.push($[promise.plugins[i]]);
		}

		promise.ready.apply(this, args);
	};

	// Helper to check on all promises and invoke all that are ready
	var update = function() {
		// Iterating in reverse so splice can be done safely
		var i = wait.length - 1;
		for (; i >= 0; --i) {
			var promise = wait[i];
			if (ready(promise)) {
				invoke(promise);
				wait.splice(i, 1);
			}
		}
	};

	// The actual namespace function
	// A list of pluggins is supplied, and the callback is given each plugin as an argument when ready
	var load = function(plugins, cb) {
		// Handle case where only one plugin is of interest
		if (typeof plugins === 'string') {
			plugins = [plugins];
		}

		var promise = {
			plugins: plugins.slice(),
			waiting: plugins.slice(),
			ready: cb,
		};

		if (ready(promise)) {
			invoke(promise);
		} else {
			wait.push(promise);
		}
	};

	// The plugin registry helper
	load.addPlugin = function(name) {
		if (available.indexOf(name) !== -1 || pending.indexOf(name) !== -1) {
			console.log('Fatal error: multiply defined plugin "' + name + '"');
			ps.exit();
			return function() {};
		}

		pending.push(name);

		return function($plugin) {
			$[name] = $plugin;

			// Remove from pending
			pending.splice(pending.indexOf(name), 1);
			available.push(name);

			// Invoke any promises ready to fulfill
			update();
		};
	};

	// Maintain reference to namespace while returning a function
	load.__proto__ = this.__proto__;
	return load;
};

Namespace.addPlugin = function($ns, name) {
	return $ns.addPlugin(name);
};

module.exports = Namespace;
