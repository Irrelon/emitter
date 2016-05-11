(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var Emitter = _dereq_('../lib/Emitter');

if (typeof window !== 'undefined') {
	window.Emitter = Emitter;
}

module.exports = Emitter;
},{"../lib/Emitter":2}],2:[function(_dereq_,module,exports){
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
 	Version 1.1.8:
 		Removed tons of dependencies wrongly included in main dependencies, have moved to devDependencies section of package.json
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

var Overload = _dereq_('irrelon-overload');

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
},{"irrelon-overload":3}],3:[function(_dereq_,module,exports){
"use strict";

/**
 * Allows a method to accept overloaded calls with different parameters controlling
 * which passed overload function is called.
 * @param {Object} def
 * @returns {Function}
 * @constructor
 */
var Overload = function (def) {
	if (def) {
		var self = this,
			index,
			count,
			tmpDef,
			defNewKey,
			sigIndex,
			signatures;

		if (!(def instanceof Array)) {
			tmpDef = {};

			// Def is an object, make sure all prop names are devoid of spaces
			for (index in def) {
				if (def.hasOwnProperty(index)) {
					defNewKey = index.replace(/ /g, '');

					// Check if the definition array has a * string in it
					if (defNewKey.indexOf('*') === -1) {
						// No * found
						tmpDef[defNewKey] = def[index];
					} else {
						// A * was found, generate the different signatures that this
						// definition could represent
						signatures = this.generateSignaturePermutations(defNewKey);

						for (sigIndex = 0; sigIndex < signatures.length; sigIndex++) {
							if (!tmpDef[signatures[sigIndex]]) {
								tmpDef[signatures[sigIndex]] = def[index];
							}
						}
					}
				}
			}

			def = tmpDef;
		}

		return function () {
			var arr = [],
				lookup,
				type;

			// Check if we are being passed a key/function object or an array of functions
			if (def instanceof Array) {
				// We were passed an array of functions
				count = def.length;
				for (index = 0; index < count; index++) {
					if (def[index].length === arguments.length) {
						return self.callExtend(this, '$main', def, def[index], arguments);
					}
				}
			} else {
				// Generate lookup key from arguments
				// Copy arguments to an array
				for (index = 0; index < arguments.length; index++) {
					type = typeof arguments[index];

					// Handle detecting arrays
					if (type === 'object' && arguments[index] instanceof Array) {
						type = 'array';
					}

					// Add the type to the argument types array
					arr.push(type);
				}

				lookup = arr.join(',');

				// Check for an exact lookup match
				if (def[lookup]) {
					return self.callExtend(this, '$main', def, def[lookup], arguments);
				} else {
					for (index = arr.length; index >= 0; index--) {
						// Get the closest match
						lookup = arr.slice(0, index).join(',');

						if (def[lookup + ',...']) {
							// Matched against arguments + "any other"
							return self.callExtend(this, '$main', def, def[lookup + ',...'], arguments);
						}
					}
				}
			}

			throw('ForerunnerDB.Overload "' + this.name() + '": Overloaded method does not have a matching signature for the passed arguments: ' + JSON.stringify(arr));
		};
	}

	return function () {};
};

/**
 * Generates an array of all the different definition signatures that can be
 * created from the passed string with a catch-all wildcard *. E.g. it will
 * convert the signature: string,*,string to all potentials:
 * string,string,string
 * string,number,string
 * string,object,string,
 * string,function,string,
 * string,undefined,string
 *
 * @param {String} str Signature string with a wildcard in it.
 * @returns {Array} An array of signature strings that are generated.
 */
Overload.prototype.generateSignaturePermutations = function (str) {
	var signatures = [],
		newSignature,
		types = ['string', 'object', 'number', 'function', 'undefined'],
		index;

	if (str.indexOf('*') > -1) {
		// There is at least one "any" type, break out into multiple keys
		// We could do this at query time with regular expressions but
		// would be significantly slower
		for (index = 0; index < types.length; index++) {
			newSignature = str.replace('*', types[index]);
			signatures = signatures.concat(this.generateSignaturePermutations(newSignature));
		}
	} else {
		signatures.push(str);
	}

	return signatures;
};

Overload.prototype.callExtend = function (context, prop, propContext, func, args) {
	var tmp,
		ret;

	if (context && propContext[prop]) {
		tmp = context[prop];

		context[prop] = propContext[prop];
		ret = func.apply(context, args);
		context[prop] = tmp;

		return ret;
	} else {
		return func.apply(context, args);
	}
};

module.exports = Overload;
},{}]},{},[1]);
