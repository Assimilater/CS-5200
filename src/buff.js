type = { 'byte': 0, 'short': 1, 'string': 2 };
module.exports = {
	type: type,
	encode: function(data) {
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
	},
};
