'use strict';
var assert = require('assert');
var allSuites = [
	require('./message.js')
];

suite('WordGuessingClient', function() {
	for(var i = 0; i < allSuites.length; ++i) {
		allSuites[i].apply(this, [assert]);
	}
});

//describe('Array', function() {
//	describe('#indexOf()', function() {
//		it('should return -1 when the value is not present', function() {
//			assert.equal(-1, [1,2,3].indexOf(4));
//		});
//	});
//});
