'use strict';

const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

const msg = require('./message.js');
const ns = require('./namespace.js');
const logger = require('./logger.js');

var $client = new ns();
logger($client);

var conf = null;
function sendMsg(buff, debug) {
	socket.send(buff, 0, buff.length, conf.get('port'), conf.get('server'), function(err, bytes) {
		$client('logger', function(log) {
			log('info', debug + ' message sent', {
				err: err,
				bytes: bytes,
				buff: buff,
				remote: conf.get('server') + ':' + conf.get('port'),
			});
		});
	});
}

var active = {
	gid: null,
	hint: '',
	definition: '',
};

var exitGame = function() {
	if (active.gid !== null) {
		var buff = msg.encodeMessage(msg.Message.Exit, {
			gid: active.gid,
		});
		sendMsg(buff, msg.MStr(msg.Message.Exit));
	}
};

var print = null;
var printGame = function() {
	print(function() {
		console.log('\n'); // Get off the prompt and add some room while we're at it
		console.log('Definition: ' + active.definition);
		console.log('\t' + active.hint);
	});
};

function msgHandler(Message, data) {
	var buff;
	switch (Message) {
		case msg.Message.Heartbeat:
			buff = msg.encodeMessage(msg.Message.Ack, {
				gid: active.gid,
			})
			break;

		case msg.Message.GameDef:
			exitGame();
			active.gid = data.gid;
			active.hint = data.hint;
			active.description = data.description;
			printGame();
			break;
	}
};

socket.on('message', function(buff, remote) {
	$client('logger', function(log) {
		log('verbose', 'Received UDP message from server', {
			buff: buff,
			remote: remote 
		});

		msg.decodeMessage(buff, function(err, Message, data) {
			if (err) {
				log('error', 'Error Parsing UDP message', {
					err: err,
					buff: buff,
					type: msg.MStr(Message),
					data: data,
				});
				return;
			}

			log('info', 'Parsed UDP message', {
				type: msg.MStr(Message),
				data: data,
			});

			msgHandler(Message, data);
		});
	});
});

module.exports = function(cfg, ins) {
	conf = cfg;
	print = ins;
	return {
		start: function() {
			console.log('Starting a new game');
			var buff = msg.encodeMessage(msg.Message.NewGame, {
				sid: conf.get('sid'),
				fname: conf.get('fname'),
				lname: conf.get('lname'),
			});
			sendMsg(buff, msg.MStr(msg.Message.NewGame));
		},
		stop: function() {
			exitGame();
			socket.close();
		},
	};
}
