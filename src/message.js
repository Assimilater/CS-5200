const buff = require('./buff.js');

var Messages = {
	NewGame: {
		MID: 0x0001,
		format: [
			{
				type: buff.type.string,
				name: 'sid',
			},
			{
				type: buff.type.string,
				name: 'fname',
			},
			{
				type: buff.type.string,
				name: 'lname',
			}
		],
	},
	GameDef: {
		MID: 0x0002,
		format: [
			{
				type: buff.type.short,
				name: 'gid',
			},
			{
				type: buff.type.string,
				name: 'hint',
			},
			{
				type: buff.type.string,
				name: 'definition',
			}
		],
	},
	Guess: {
		MID: 0x0003,
		format: [
			{
				type: buff.type.short,
				name: 'gid',
			},
			{
				type: buff.type.string,
				name: 'guess',
			}
		],
	},
	Answer: {
		MID: 0x0004,
		format: [
			{
				type: buff.type.short,
				name: 'gid',
			},
			{
				type: buff.type.byte,
				name: 'result',
			},
			{
				type: buff.type.short,
				name: 'score',
			},
			{
				type: buff.type.string,
				name: 'hint',
			}
		],
	},
	GetHint: {
		MID: 0x0005,
		format: [
			{
				type: buff.type.short,
				name: 'gid',
			}
		],
	},
	Hint: {
		MID: 0x0006,
		format: [
			{
				type: buff.type.short,
				name: 'gid',
			},
			{
				type: buff.type.string,
				name: 'hint',
			}
		],
	},
	Exit: {
		MID: 0x0007,
		format: [
			{
				type: buff.type.short,
				name: 'gid',
			}
		],
	},
	Ack: {
		MID: 0x0008,
		format: [
			{
				type: buff.type.short,
				name: 'gid',
			}
		],
	},
	Error: {
		MID: 0x0009,
		format: [
			{
				type: buff.type.short,
				name: 'gid',
			},
			{
				type: buff.type.string,
				name: 'error',
			}
		],
	},
	Heartbeat: {
		MID: 0x000A,
		format: [
			{
				type: buff.type.short,
				name: 'gid',
			}
		],
	},
};

var Map = {
	MID: {},
	Message: {},
};

(function() {
	// Generate an object of Message => MID
	var MID = Object.keys(Messages);
	var i = 0;
	for (; i < MID.length; ++i) {
		var name = MID[i];
		var mid = Messages[MID[i]].MID;
		Map.MID[mid] = name;
		Map.Message[name] = mid;
	}
})();

module.exports = {
	Message: Map.Message,
	encode: function(mid, data) {
		var message = [{
			type: buff.type.short,
			value: mid,
		}];
		
		var format = Messages[Map.MID[mid]].format;
		console.log(format);
		
		// Add each parameter
		var i = 0;
		for (; i < format.length; ++i) {
			message.push({
				type: format[i].type,
				value: data[format[i].name],
			});
		}
		console.log(message);
		return buff.encode(message);
	},
	decode: function(data) {
		
	},
}
