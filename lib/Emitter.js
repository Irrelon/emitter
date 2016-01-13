/*
 The MIT License (MIT)

 Copyright (c) 2014 Irrelon Software Limited
 http://www.irrelon.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice, url and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 Source: https://github.com/irrelon/emitter

 Changelog:
 	Version 1.1.0:
 		Added support for overloaded methods
 		Added support for events with ids
 	Version 1.0.2:
 		Removed AMD support, added browserify support
 		Added package.json
 		Added once() method
 		Added hasListener() method
 		Published to NPM as irrelon-emitter
 	Version 1.0.1:
 		Added ability to extend any object with eventing capability
 		Added AMD / Require.js support
		 Added Node.js support
	Version 1.0.0:
		First commit
 */
"use strict";

var Overload = require('irrelon-overload');

var Emitter = function (obj) {
	if (obj) {
		// Convert the object prototype to have eventing capability
		obj.prototype.on = Emitter.prototype.on;
		obj.prototype.off = Emitter.prototype.off;
		obj.prototype.once = Emitter.prototype.once;
		obj.prototype.emit = Emitter.prototype.emit;
		obj.prototype.hasListener = Emitter.prototype.hasListener;
	}
};

Emitter.prototype.on = new Overload({
	'string, function': function(event, listener) {
		return this.$main.call(this, event, '*', listener, false);
	},

	'string, function, boolean': function(event, listener, once) {
		return this.$main.call(this, event, '*', listener, once);
	},

	'string, string, function': function(event, id, listener) {
		return this.$main.call(this, event, id, listener, false);
	},

	'string, string, function, boolean': function(event, id, listener, once) {
		return this.$main.call(this, event, id, listener, once);
	},

	'$main': function (event, id, listener, once) {
		this._listeners = this._listeners || {};
		this._listeners[event] = this._listeners[event] || {};
		this._listeners[event][id] = this._listeners[event][id] || [];
		this._listeners[event][id].push({once: once, listener: listener});
	}
});

Emitter.prototype.once = function(event, listener) {
	var i,
		argList = [];

	for (i = 0; i < arguments.length; i++) {
		argList.push(arguments[i]);
	}

	argList.push(true);

	return this.on.apply(this, argList);
};

Emitter.prototype.off = new Overload({
	'string': function (event) {
		return this.$main.call(this, event, '*', '*');
	},

	'string, function': function(event, listener) {
		return this.$main.call(this, event, '*', listener);
	},

	'string, string, function': function(event, id, listener) {
		return this.$main.call(this, event, id, listener);
	},

	'$main': function (event, id, listener) {
		var tmpId,
			eventObj,
			arr,
			arrCount,
			arrIndex;

		if (this._listeners) {
			if (event in this._listeners) {
				eventObj = this._listeners[event];

				if (id === '*') {
					// Loop all ids in the listener for this event
					for (tmpId in eventObj) {
						if (eventObj.hasOwnProperty(tmpId)) {
							arr = eventObj[tmpId];
							arrCount = arr.length;

							for (arrIndex = 0; arrIndex < arrCount; arrIndex++) {
								if (listener === '*' || arr[arrIndex].listener === listener) {
									arr.splice(arrIndex, 1);
									break;
								}

							}
						}
					}
				} else {
					arr = eventObj[id];
					arrCount = arr.length;

					for (arrIndex = 0; arrIndex < arrCount; arrIndex++) {
						if (listener === '*' || arr[arrIndex].listener === listener) {
							arr.splice(arrIndex, 1);
							break;
						}

					}
				}
			}
		}
	}
});

Emitter.prototype.emit = new Overload({
	'string': function (event) {
		this.$main.call(this, event, '*');
	},

	'string, *': function (event, data) {
		this.$main.call(this, event, '*', data);
	},

	'string, string, *': function (event, id, data) {
		this.$main.call(this, event, id, data);
	},

	'$main': function (event, id, data) {
		this._listeners = this._listeners || {};

		if (event in this._listeners) {
			var arr = this._listeners[event][id],
					arrCount = arr.length,
					arrIndex,
					removeArr = [];

			for (arrIndex = 0; arrIndex < arrCount; arrIndex++) {
				arr[arrIndex].listener.apply(this, Array.prototype.slice.call(arguments, 2));
				if (arr[arrIndex].once) {
					removeArr.push(arrIndex);
				}
			}

			arrCount = removeArr.length;

			for (arrIndex = 0; arrIndex < arrCount; arrIndex++) {
				arr.splice(removeArr[arrIndex], 1);
			}
		}
	}
});

Emitter.prototype.hasListener = new Overload({
	'string': function (event) {
		return this.$main.call(this, event, '*');
	},

	'string, string': function (event, id) {
		return this.$main.call(this, event, id);
	},

	'$main': function (event, id) {
		return this._listeners && event in this._listeners && this._listeners[event][id] && this._listeners[event][id].length;
	}
});

module.exports = Emitter;