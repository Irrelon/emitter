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
var Emitter = (function () {
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

	Emitter.prototype.on = function(event, listener) {
		this._listeners = this._listeners || {};
		this._listeners[event] = this._listeners[event] || [];
		this._listeners[event].push({once: false, listener: listener});
	};

	Emitter.prototype.off = function(event, listener) {
		if (this._listeners) {
			if (event in this._listeners) {
				var arr = this._listeners[event],
					arrCount = arr.length,
					arrIndex;

				for (arrIndex = 0; arrIndex < arrCount; arrIndex++) {
					if (arr[arrIndex].listener === listener) {
						arr.splice(arrIndex, 1);
						break;
					}

				}
			}
		}
	};

	Emitter.prototype.once = function(event, listener) {
		this._listeners = this._listeners || {};
		this._listeners[event] = this._listeners[event] || [];
		this._listeners[event].push({once: true, listener: listener});
	};

	Emitter.prototype.emit = function(event, data) {
		this._listeners = this._listeners || {};

		if (event in this._listeners) {
			var arr = this._listeners[event],
				arrCount = arr.length,
				arrIndex,
				removeArr = [];

			for (arrIndex = 0; arrIndex < arrCount; arrIndex++) {
				arr[arrIndex].listener.apply(this, Array.prototype.slice.call(arguments, 1));
				if (arr[arrIndex].once) {
					removeArr.push(arrIndex);
				}
			}

			arrCount = removeArr.length;

			for (arrIndex = 0; arrIndex < arrCount; arrIndex++) {
				arr.splice(removeArr[arrIndex], 1);
			}
		}
	};

	Emitter.prototype.hasListener = function (event) {
		return this._listeners && event in this._listeners && this._listeners[event].length;
	};

	return Emitter;
})();

module.exports = Emitter;