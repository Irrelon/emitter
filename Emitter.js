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

 Source: https://github.com/coolbloke1324/emitter

 Changelog:
 	Version 1.0.1:
 		Added ability to extend any object with eventing capability
 		Added AMD / Require.js support
		 Added Node.js support
	Version 1.0.0:
		First commit
 */
var Emitter = (function () {
	var Emitter = function (obj) {
		if (obj) {
			// Convert the object prototype to have eventing capability
			obj.prototype.on = this.prototype.on;
			obj.prototype.off = this.prototype.off;
			obj.prototype.emit = this.prototype.emit;
		}
	};

	Emitter.prototype.on = function(event, listener) {
		this._listeners = this._listeners || {};
		this._listeners[event] = this._listeners[event] || [];
		this._listeners[event].push(listener);
	};

	Emitter.prototype.off = function(event, listener) {
		if (this._listeners) {
			if (event in this._listeners) {
				var arr = this._listeners[event],
					index = arr.indexOf(listener);

				if (index > -1) {
					arr.splice(index, 1);
				}
			}
		}
	};

	Emitter.prototype.emit = function(event, data) {
		this._listeners = this._listeners || {};

		if (event in this._listeners) {
			var arr = this._listeners[event],
				arrCount = arr.length,
				arrIndex;

			for (arrIndex = 0; arrIndex < arrCount; arrIndex++) {
				arr[arrIndex].apply(this, Array.prototype.slice.call(arguments, 1));
			}
		}
	};
})();

/**
 * Node.js module support.
 */
if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
	Emitter.prototype._isServer = true;
	module.exports = Emitter;
}

/**
 * AMD module support.
 */
if (typeof(define) === 'function' && define.amd) {
	define([], function() {
		return Emitter;
	});
}
