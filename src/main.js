var path = require('path');
var conf = require('./conf.js')({
	defaults: {
		server: '127.0.0.1',
		port: 12001,
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

console.log('Welcome to the Word Guessing Game!\n');
cli.run();
