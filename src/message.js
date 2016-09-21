const type = { 
	'byte': 0, 
	'short': 1,
	'string': 2 
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
var makeBuff = function(data) {
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
				console.log(`Unrecognized type: "${data[i].type}"`)
				return buff;
		}
		
		buff = Buffer.concat([buff, chunk]);
	}
	
	return buff;
};

module.exports = {
	Message: Map.Message,
	encode: function(mid, data) {
		var message = [{
			type: type.short,
			value: mid,
		}];
		
		var format = Messages[Map.MID[mid]].format;
		
		// Add each parameter
		var i = 0;
		for (; i < format.length; ++i) {
			message.push({
				type: format[i].type,
				value: data[format[i].name],
			});
		}
		
		return makeBuff(message);
	},
	decode: function(data) {
		var message = new Buffer(data);
		
		console.log(message);
	},
}
