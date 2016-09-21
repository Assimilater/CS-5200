var path = require('path');
//------------------------------------------------------------------------------------------------+
// Basic operational utilities                                                                    |
//------------------------------------------------------------------------------------------------+
var conf = require('./conf.js')({
	defaults: {
		server: '127.0.0.1',
		port: 12001,
		fname: 'First',
		lname: 'Last',
		sid: 'Axxxxxxxx',
	}
});

//------------------------------------------------------------------------------------------------+
// Command Line Interface                                                                         |
//------------------------------------------------------------------------------------------------+
var cli = require('./cli.js');

// Configuration scripts
cli.script('server', 'Gets or sets the address of the server to connect to', {
	usage: 'server [ip|domain]',
}, function(args) {
	if (args) {
		conf.set('server', args);
		conf.push();
	}
	console.log('server address: ' + conf.get('server'));
})

cli.script('port', 'Gets or sets the port to connect to on the remote server', {
	usage: 'server [port]',
}, function(args) {
	if (args) {
		conf.set('port', args);
		conf.push();
	}
	console.log('server port: ' + conf.get('port'));
});

cli.script('sid', 'Gets or sets the student A#', {
	usage: 'sid [axxxxxxxx]',
}, function(args) {
	if (args) {
		conf.set('sid', args);
		conf.push();
	}
	console.log('A#: ' + conf.get('sid'));
});

cli.script('name', 'Gets or sets the student name', {
	usage: 'name [first last]',
}, function(args) {
	if (args) {
		var parts = args.split(' ');
		conf.set('fname', parts[0]);
		conf.set('lname', parts[1]);
		conf.push();
	}
	console.log('Name: ' + conf.get('fname') + ' ' + conf.get('lname'));
});

// Runtime Scripts
var buff = require('./buff.js');
cli.script('new', 'Exits the current game and starts a new one', {}, function(args) {
	console.log('Connection to game server...');
	var message = buff.encode([
		{
			type: buff.type.short,
			value: 0x0001,
		},
		{
			type: buff.type.string,
			value: conf.get('sid'),
		},
		{
			type: buff.type.string,
			value: conf.get('fname'),
		},
		{
			type: buff.type.string,
			value: conf.get('lname'),
		},
	]);
	
	console.log(message);
	// Create encode and send mesage to server 'NewGame'
	// Parse GameDef message
});

// Network Communication Maintenance
cli.closer(function() {
	
});

// Start the front-end program
console.log('Welcome to the Word Guessing Game!\n');
cli.run();
