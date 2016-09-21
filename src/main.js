var path = require('path');
var conf = require('./conf.js')({
	defaults: {
		server: '127.0.0.1',
		port: 12001,
		fname: 'First',
		lname: 'Last',
		sid: 'Axxxxxxxx',
	}
});

var cli = require('./cli.js');

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

cli.script('new', 'Exits the current game and starts a new one', {}, function(args) {
	console.log('Connection to game server...');
	// Create encode and send mesage to server 'NewGame'
	// Parse GameDef message
});

cli.closer(function() {
	
});

console.log('Welcome to the Word Guessing Game!\n');
cli.run();
