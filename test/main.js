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
