var alias = {};
var keys = [];
var exit_handler;

var postpad = function(fill, str, len) {
	return (str + Array(len + 1).join(fill)).substring(0, len);
}

// Command line processing modules
var ps = require('process');
var cli = require('readline').createInterface({
	input: ps.stdin,
	output: ps.stdout,
	completer: function(line) {
		var hits = keys.filter(function(cmd) {
			return cmd.indexOf(line) === 0;
		});

		return [hits, line];
	},
});

// Comand line "scripts"
var app = {
	'exit': {
		description: 'Exits the program',
		usage: '',
		help: '',
		alias: ['close', 'quit', 'stop'],
		func: function(args) {
			if (exit_handler instanceof Function) {
				exit_handler();
			}
			ps.exit();
		}
	},
	'help': {
		description: 'Shows a list of commands or help for a specific command',
		usage: 'help [cmd]',
		help: '',
		alias: [],
		func: function(args) {
			if (args) {
				// Show help for specific command
				args = args.toLowerCase().trim();
				var cmd = args.split(' ')[0].trim();
				if (cmd !== args) {
					cmd = 'help';
				}

				if (alias[cmd] === undefined) {
					console.log('Unrecognized command "' + cmd + '"');
				} else {
					// Valid help entry
					var script = app[alias[cmd]];

					console.log('Manual for command: "' + alias[cmd] + '":');
					console.log(    '\tDescription    ' + script.description);
					if (script.alias.length !== 0) {
						console.log('\tAliases        ' + script.alias.join(', '));
					}
					if (script.usage !== '') {
						console.log('\tUsage          ' + script.usage);
					}
					if (script.help !== '') {
						console.log('\n' + script.help);
					}
				}

			} else {
				console.log('List of available commands:');

				var i = 0;
				for(; i < keys.length; ++i) {
					console.log('\t' + postpad(' ', keys[i], 12) + app[alias[keys[i]]].description);
				}
			}
		},
	},
};

// Generates the list of available commands for the program
var rebuild = function() {
	alias = {};
	var i = 0, j;
	var commands = Object.keys(app);
	for (; i < commands.length; ++i) {
		alias[commands[i]] = commands[i];
		for (j = 0; j < app[commands[i]].alias.length; ++j) {
			alias[app[commands[i]].alias[j]] = commands[i];
		}
	}
	keys = Object.keys(alias);
	keys.sort();
}

module.exports = {
	script: function(cmd, description, opts, func) {
		app[cmd.toLowerCase()] = {
			func:         func,
			description:  description,
			usage:        opts.usage   || '',
			help:         opts.help    || '',
			alias:        opts.alias   || [],
		};

		// To handle the edge case the user added
		// a new command after calling run()
		rebuild();
	},

	run: function() {
		rebuild();

		cli.prompt();
		cli.on('line', function(line) {
			var cmd = line.split(' ')[0].toLowerCase();
			var args = line.substring(cmd.length + 1).trim();

			var script = app[alias[cmd]];
			if (script === undefined) {
				console.log('Unrecognized command: "' + cmd + '"');
				script = app['help'];
				args = '';
			}

			script.func(args);
			console.log(''); // Space between content and next prompt looks better
			cli.prompt();
		});
	},

	closer: function(callback) {
		exit_handler = callback;
	},
};
