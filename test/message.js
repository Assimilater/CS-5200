'use strict';

var msg = require('../src/message.js');

module.exports = function(assert, debugStr) {
	suite('Message Translator', function() {
		test('Byte Encoding', function() {
			var message;
			
			message = [{
				type: msg.buffType.byte,
				value: 0x10,
			}];
			
			// Test encoding one byte
			var buff = msg.makeBuffer(message);
			assert(buff.length === 1, `buff.length === ${buff.length}; // expected 1`);
			assert(buff[0] === 16,    `buff[0] === ${buff[0]}; // expected 16 (0x10)`);
			
			// Test parsing one byte
			var err = msg.parseBuffer(buff, [{ type: msg.buffType.byte, name: 'val' }], message = {});
			assert(!err, (err || '').toString());
			assert(message.val, 'Value not extracted from buffer');
			assert(message.val === 16, `message.val === ${message.val}; // expected 16 (0x10)`);
			
			// Ensure parser failes when given empty buffer
			err = msg.parseBuffer(new Buffer(0), [{ type: msg.buffType.byte, name: 'val' }], message = {});
			assert(err === 'Array Index Out Of Range', `err !== AIOOR; err = ${err}`)
		});
		
		test('Short Encoding', function() {
			var message;
			
			message = [{
				type: msg.buffType.short,
				value: 0x100F,
			}];
			
			// Test encoding two bytes
			var buff = msg.makeBuffer(message);
			assert(buff.length === 2, `buff.length === ${buff.length}; // expected 2`);
			assert(buff[0] === 16,    `buff[0] === ${buff[0]}; // expected 16 (0x10)`);
			assert(buff[1] === 15,    `buff[1] === ${buff[1]}; // expected 15 (0x0F)`);
			
			// Test parsing two bytes
			var err = msg.parseBuffer(buff, [{ type: msg.buffType.short, name: 'val' }], message = {});
			assert(!err, (err || '').toString());
			assert(message.val, 'Value not extracted from buffer');
			assert(message.val === 4111, `message.val === ${message.val}; // expected 4111 (0x100F)`);
			
			// Ensure parser failes when given empty buffer
			err = msg.parseBuffer(new Buffer(0), [{ type: msg.buffType.short, name: 'val' }], message = {});
			assert(err === 'Array Index Out Of Range', `err !== AIOOR; err = ${err}`)
		});
		
		test('String Encoding', function() {
			const asBytes = Buffer('000a00680065006c006c006f', 'hex');
			var message;
			
			message = [{
				type: msg.buffType.string,
				value: 'hello',
			}];
			
			// Test encoding 'hello'
			var buff = msg.makeBuffer(message);
			assert(buff.length === asBytes.length, `${buff.length} === ${asBytes.length}`);
			
			var i = 0;
			for (; i < buff.length; ++i) {
				assert(buff[i] === asBytes[i], `${i}: ${buff[i]} === ${asBytes[i]}`);
			}
			
			// Test parsing 'hello'
			var err = msg.parseBuffer(buff, [{ type: msg.buffType.string, name: 'val' }], message = {});
			assert(!err, 'Error parsing buffer: ' + ((err || '').toString()));
			assert(message.val, 'Value not extracted from buffer');
			assert(message.val === 'hello', `message.val === ${message.val}; // expected 'hello'`);
			
			// Ensure parser failes when given empty buffer
			err = msg.parseBuffer(new Buffer(0), [{ type: msg.buffType.string, name: 'val' }], message = {});
			assert(err === 'Array Index Out Of Range', `err !== AIOOR; err = ${err}`)
		});
		
		
	});
};
