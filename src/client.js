'use strict';

const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

const msg = require('./message.js');
const ns = require('./namespace.js');
const logger = require('./logger.js');

var $client = new ns();
logger($client);

// Sends messages to the server and handles logging
var conf = null;
function sendMsg(buff) {
	socket.send(buff, 0, buff.length, conf.get('port'), conf.get('server'), function(err, bytes) {
		$client('logger', function(log) {
			log('info', msg.MStr(buff[1]) + ' message sent', {
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
	score: 0,
	finished: false,
	wait: null,
};

// Asynchronous handler for an exit request
var exitGame = function(cb) {
	if (active.gid !== null) {
		var buff = msg.encodeMessage(msg.Message.Exit, {
			gid: active.gid,
		});
		active.wait = function(err) {
			if (err) {
				console.log('Error stopping game: ' + err);
				cb && cb(err);
			} else {
				cb && cb();
			}
		};
		sendMsg(buff);
	} else {
		cb && cb();
	}
};

// CLI output function
var resume = null;
var printGame = function() {
	console.log('\nDefinition: ' + active.definition);
	console.log('\t' + active.hint);
};

// The game logic function on message received from the server
function msgHandler(Message, data) {
	var buff;
	switch (Message) {
		case msg.Message.Heartbeat:
			buff = msg.encodeMessage(msg.Message.Ack, {
				gid: active.gid,
			});
			sendMsg(buff);
			break;

		case msg.Message.GameDef:
			exitGame();
			active.finished = false;
			active.score = 0;
			active.gid = data.gid;
			active.hint = data.hint;
			active.definition = data.definition;
			printGame();
			resume();
			break;

		case msg.Message.Ack:
			active.wait && active.wait();
			break;

		case msg.Message.Error:
			active.wait && active.wait(data.error);
			break;

		case msg.Message.Answer: case msg.Message.Hint:
			active.wait && active.wait(data);
			break;
	}
};

// Event for socket receive handles logging before calling the game logic function
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

module.exports = function(cfg, res) {
	conf = cfg;
	resume = res;
	return {
		start: function() {
			console.log('Starting a new game');
			var buff = msg.encodeMessage(msg.Message.NewGame, {
				sid: conf.get('sid'),
				fname: conf.get('fname'),
				lname: conf.get('lname'),
			});
			sendMsg(buff);
		},

		// A callback may arise from the cli waiting to know if it's ok to exit
		stop: function(cb) {
			// We must wait for an ack from the server after sending an exit message
			exitGame(function(err) {
				if (err) { cb && cb(err); resume(); }
				else { socket.close(); }
				cb && cb();
			});
		},
		hint: function() {
			if (active.gid === null) {
				console.log('No Active Game...');
				return true; // No need to hang things up
			}

			var buff = msg.encodeMessage(msg.Message.GetHint, {
				gid: active.gid,
			});
			active.wait = function(hint) {
				if (typeof hint === 'string') {
					console.log('Error: ' + hint);
					return;
				}

				// Update the game with the new hint and continue
				active.hint = hint.hint;
				printGame();
				resume();
			};
			sendMsg(buff);
		},
		guess: function(val) {
			if (active.gid === null) {
				console.log('No Active Game...');
				return true; // No need to hang things up
			}

			var buff = msg.encodeMessage(msg.Message.Guess, {
				gid: active.gid,
				guess: val,
			});
			active.wait = function(answer) {
				if (typeof answer === 'string') {
					console.log('Error: ' + answer);
					return;
				}

				// Did they get it right?
				if (answer.result) {
					active.finished = true;
					console.log('You got it!');
				} else {
					active.hint = answer.hint;
					console.log('Not Quite!');
				}

				// Show the score
				console.log('Score: ' + (active.score = answer.score));

				// Print the game if it's still going
				if (!active.finished) {
					console.log('');
					printGame();
				}

				// Get rid of the game id if it's over
				else {
					active.gid = null;
				}

				// Return control to the user
				resume();
			};
			sendMsg(buff);
		},
		status: function() {
			if (active.gid === null) {
				console.log('No active game');
			} else {
				console.log('Score: ' + active.score);
				printGame();
			}
		},
	};
}
