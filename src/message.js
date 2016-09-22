'use strict';

const type = { 
	'byte': 0, 
	'short': 1,
	'string': 2, 
};

var Messages = {
	NewGame: {
		MID: 0x0001,
		format: [
			{
				type: type.string,
				name: 'sid',
			},
			{
				type: type.string,
				name: 'fname',
			},
			{
				type: type.string,
				name: 'lname',
			}
		],
	},
	GameDef: {
		MID: 0x0002,
		format: [
			{
				type: type.short,
				name: 'gid',
			},
			{
				type: type.string,
				name: 'hint',
			},
			{
				type: type.string,
				name: 'definition',
			}
		],
	},
	Guess: {
		MID: 0x0003,
		format: [
			{
				type: type.short,
				name: 'gid',
			},
			{
				type: type.string,
				name: 'guess',
			}
		],
	},
	Answer: {
		MID: 0x0004,
		format: [
			{
				type: type.short,
				name: 'gid',
			},
			{
				type: type.byte,
				name: 'result',
			},
			{
				type: type.short,
				name: 'score',
			},
			{
				type: type.string,
				name: 'hint',
			}
		],
	},
	GetHint: {
		MID: 0x0005,
		format: [
			{
				type: type.short,
				name: 'gid',
			}
		],
	},
	Hint: {
		MID: 0x0006,
		format: [
			{
				type: type.short,
				name: 'gid',
			},
			{
				type: type.string,
				name: 'hint',
			}
		],
	},
	Exit: {
		MID: 0x0007,
		format: [
			{
				type: type.short,
				name: 'gid',
			}
		],
	},
	Ack: {
		MID: 0x0008,
		format: [
			{
				type: type.short,
				name: 'gid',
			}
		],
	},
	Error: {
		MID: 0x0009,
		format: [
			{
				type: type.short,
				name: 'gid',
			},
			{
				type: type.string,
				name: 'error',
			}
		],
	},
	Heartbeat: {
		MID: 0x000A,
		format: [
			{
				type: type.short,
				name: 'gid',
			}
		],
	},
};

var Map = {
	MID: {},
	Message: {},
};

// Populate the map
(function() {
	var MID = Object.keys(Messages);
	var i = 0;
	for (; i < MID.length; ++i) {
		var name = MID[i];
		var mid = Messages[MID[i]].MID;
		Map.MID[mid] = name;
		Map.Message[name] = mid;
	}
})();

// Helper for putting data into the proper format for big endian message buffers
function makeBuffer(data) {
	var buff = new Buffer(0), chunk;
	var i = 0, j;
	for(; i < data.length; ++i) {
		switch (data[i].type) {
			case type.short:
				chunk = new Buffer(2);
				chunk.writeInt16BE(data[i].value, 0);
				break;
				
			case type.byte:
				chunk = new Buffer(1);
				chunk.writeInt8(data[i].value, 0);
				break;
				
			case type.string:
				chunk = new Buffer(2 + (data[i].value.length * 2));
				chunk.fill(0);
				
				// Write the size (-2 because size is included in chunk.length)
				chunk.writeInt16BE(chunk.length - 2, 0);
				
				// Write the string character at a time because uft8 only encodes one byte per character
				var j = 0;
				for (; j < data[i].value.length; ++j) {
					chunk.writeInt16BE(data[i].value.charCodeAt(j), 2 + (j * 2));
				}
				
				break;
				
			default:
				console.log(`Unrecognized type: "${data[i].type}"`);
				return buff;
		}
		
		buff = Buffer.concat([buff, chunk]);
	}
	
	return buff;
}

// Helper for transforming buffer data into easy to use object
function parseBuffer(buff, format, data) {
	const IOR = 'Array Index Out Of Range';
	var i = 0, ptr = 0;
	try {
		for (; i < format.length; ++i) {
			// Verify boundary conditions
			if (ptr >= buff.length) {
				return IOR;
			}
			
			var param = format[i];
			switch (param.type) {
				case type.short:
					data[param.name] = buff.readInt16BE(ptr);
					ptr += 2;
					break;
					
				case type.byte:
					data[param.name] = buff.readInt8(ptr);
					ptr += 1;
					break;
					
				case type.string:
					var len = buff.readInt16BE(ptr);
					len /= 2; // Each character is two bytes
					ptr += 2;
					
					data[param.name] = '';
					
					var j = 0;
					for (; j < len; ++j) {
						// Verify boundary conditions
						if (ptr >= buff.length) {
							return IOR;
						}
						
						var elem = buff.readInt16BE(ptr);
						data[param.name] += String.fromCharCode(elem);
						ptr += 2;
					}
					break;
					
				default:
					return `Unrecognized type: "${data[i].type}"`;
			}
		}
	} catch(e) {
		return e;
	}
}

// Converts a message structure into a buffer used by sockets
function encodeMessage(mid, data) {
	var format = Messages[Map.MID[mid]].format;
	
	// Build the message components
	var message = [{
		type: type.short,
		value: mid,
	}];
	
	var i = 0;
	for (; i < format.length; ++i) {
		message.push({
			type: format[i].type,
			value: data[format[i].name],
		});
	}
	
	// Build the buffer
	return makeBuffer(message);
}

// Converts a buffer used by sockets into a message structure
function decodeMessage(raw, cb) {
	var buff = new Buffer(raw);
	
	// Get the type of message
	var mid = buff.readInt16BE(0);
	buff.slice(2);
	
	var format = Messages[Map.MID[mid]].format;
	
	// Parse the buffer
	var data = {};
	var err = parseBuffer(buff, format, data);
	
	// Relay the message
	cb(err, mid, data);
}

module.exports = {
	buffType: type,           // Needed for testing
	Message: Map.Message,
	MStr: function(mid) {
		return Map.MID[mid];
	},
	
	makeBuffer: makeBuffer,   // Needed for testing
	parseBuffer: parseBuffer, // Needed for testing
	encodeMessage: encodeMessage,
	decodeMessage: decodeMessage,
}
