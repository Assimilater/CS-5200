const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
const buff = require('./buff.js');

const ns = require('./namespace.js');
const logger = require('./logger.js');

var $client = new ns();
logger($client);

//socket.on('listening', function() {
//	$client('logger', function(log) {
//		log('verbose', `Listening on ${socket.address}:${socket.port}`);
//	});
//});

module.exports = function(conf) {
	return {
		create: function() {
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
			
			socket.send(message, 0, message.length, conf.get('port'), conf.get('server'), function(err, bytes) {
				$client('logger', function(log) {
					log('info', 'UDP message sent to ' + conf.get('server') + ':' + conf.get('port'));
					//log('verbose', `Listening on ${socket.address}:${socket.port}`);
					socket.close();
				});
			});
		},
	};
}

/*
server.on('error', function(err) {
	console.log(`server error:\n${err.stack}`);
	server.close();
});

server.on('message', function(msg, rinfo) {
	console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

server.on('listening', function() {
	var address = server.address();
	console.log(`server listening ${address.address}:${address.port}`);
});
*/