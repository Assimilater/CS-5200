const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

const msg = require('./message.js');
const ns = require('./namespace.js');
const logger = require('./logger.js');

var $client = new ns();
logger($client);

socket.on('message', function(buff, remote) {
	$client('logger', function(log) {
		log('info', 'Received UDP message from server', {
			buff: buff,
			remote: remote 
		});
	});
	msg.decode(buff);
});

module.exports = function(conf) {
	return {
		create: function() {
			var buff =
				msg.encode(msg.Message.NewGame, {
					sid: conf.get('sid'),
					fname: conf.get('fname'),
					lname: conf.get('lname'),
				});
			
			socket.send(buff, 0, buff.length, conf.get('port'), conf.get('server'), function(err, bytes) {
				$client('logger', function(log) {
					log('info', 'Create Game message sent', {
						err: err,
						bytes: bytes,
						buff: buff,
						remote: conf.get('server') + ':' + conf.get('port'),
					});
				});
			});
		},
		
		close: function() {
			var buff = msg.encode(msg.Message.Exit, {});
			
			socket.send(buff, 0, buff.length, conf.get('port'), conf.get('server'), function(err, bytes) {
				$client('logger', function(log) {
					log('info', 'Create Game message sent', {
						err: err,
						bytes: bytes,
						buff: buff,
						remote: conf.get('server') + ':' + conf.get('port'),
					});
				});
			});
			
			socket.close();
		}
	};
}
