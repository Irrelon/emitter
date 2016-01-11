var Emitter = require('../lib/Emitter');

if (typeof window !== 'undefined') {
	window.Emitter = Emitter;
}

module.exports = Emitter;