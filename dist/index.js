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
 	Version 2.0.0:
 		Big update to bring in line with latest developments in other projects. Event emitter can
 		now use deferEmit(), emitId(), emitStatic(), emitStaticId(), willEmit(), willEmitId().
 	Version 1.1.9:
 		Updated changelog correctly
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

var EventMethods = {
	on: new Overload({
		/**
		 * Attach an event listener to the passed event.
		 * @param {String} event The name of the event to listen for.
		 * @param {Function} listener The method to call when the event is fired.
		 */
		'string, function': function (event, listener) {
			return this.$main(event, '*', listener);
		},
		
		/**
		 * Attach an event listener to the passed event only if the passed
		 * id matches the document id for the event being fired.
		 * @param {String} event The name of the event to listen for.
		 * @param {*} id The document id to match against.
		 * @param {Function} listener The method to call when the event is fired.
		 */
		'string, *, function': function (event, id, listener) {
			return this.$main(event, id, listener);
		},
		
		'$main': function (event, id, listener) {
			var self = this,
				generateTimeout,
				emitter,
				i;
			
			generateTimeout = function (emitter) {
				setTimeout(function () {
					listener.apply(self, emitter.args);
				}, 1);
			};
			
			this._listeners = this._listeners || {};
			this._listeners[event] = this._listeners[event] || {};
			this._listeners[event][id] = this._listeners[event][id] || [];
			this._listeners[event][id].push(listener);
			
			// Check for any static emitters, and fire the event if any exist
			if (this._emitters && this._emitters[event] && this._emitters[event].length) {
				// Emit events for each emitter
				for (i = 0; i < this._emitters[event].length; i++) {
					emitter = this._emitters[event];
					
					if (id === '*' || emitter.id === id) {
						// Call the listener out of process so that any code that expects a listener
						// to be called at some point in the future rather than immediately on registration
						// will not fail
						generateTimeout(emitter);
					}
				}
			}
			
			return this;
		}
	}),
	
	once: new Overload({
		/**
		 * Attach an event listener to the passed event which will only fire once.
		 * @param {String} event The name of the event to listen for.
		 * @param {Function} listener The method to call when the event is fired.
		 */
		'string, function': function (event, listener) {
			var self = this,
				fired = false,
				internalCallback = function () {
					if (!fired) {
						fired = true;
						self.off(event, internalCallback);
						listener.apply(self, arguments);
					}
				};
			
			return this.on(event, internalCallback);
		},
		
		/**
		 * Attach an event listener to the passed event only if the passed
		 * id matches the document id for the event being fired.
		 * @param {String} event The name of the event to listen for.
		 * @param {*} id The document id to match against.
		 * @param {Function} listener The method to call when the event is fired.
		 */
		'string, *, function': function (event, id, listener) {
			var self = this,
				fired = false,
				internalCallback = function () {
					if (!fired) {
						fired = true;
						self.off(event, id, internalCallback);
						listener.apply(self, arguments);
					}
				};
			
			return this.on(event, id, internalCallback);
		}
	}),
	
	off: new Overload({
		/**
		 * Cancels all event listeners for the passed event.
		 * @param {String} event The name of the event.
		 * @returns {*}
		 */
		'string': function (event) {
			var self = this;
			
			if (this._emitting) {
				this._eventRemovalQueue = this._eventRemovalQueue || [];
				this._eventRemovalQueue.push(function () {
					self.off(event);
				});
			} else {
				if (this._listeners && this._listeners[event]) {
					delete this._listeners[event];
				}
			}
			
			return this;
		},
		
		/**
		 * Cancels the event listener for the passed event and listener function.
		 * @param {String} event The event to cancel listener for.
		 * @param {Function} listener The event listener function used in the on()
		 * or once() call to cancel.
		 * @returns {*}
		 */
		'string, function': function (event, listener) {
			var self = this,
				arr,
				index;
			
			if (this._emitting) {
				this._eventRemovalQueue = this._eventRemovalQueue || [];
				this._eventRemovalQueue.push(function () {
					self.off(event, listener);
				});
			} else {
				if (typeof(listener) === 'string') {
					if (this._listeners && this._listeners[event] && this._listeners[event][listener]) {
						delete this._listeners[event][listener];
					}
				} else {
					if (this._listeners && this._listeners[event]) {
						arr = this._listeners[event]['*'];
						index = arr.indexOf(listener);
						
						if (index > -1) {
							arr.splice(index, 1);
						}
					}
				}
			}
			
			return this;
		},
		
		/**
		 * Cancels an event listener based on an event name, id and listener function.
		 * @param {String} event The event to cancel listener for.
		 * @param {String} id The ID of the event to cancel listening for.
		 * @param {Function} listener The event listener function used in the on()
		 * or once() call to cancel.
		 */
		'string, *, function': function (event, id, listener) {
			var self = this;
			
			if (this._emitting) {
				this._eventRemovalQueue = this._eventRemovalQueue || [];
				this._eventRemovalQueue.push(function () {
					self.off(event, id, listener);
				});
			} else {
				if (this._listeners && this._listeners[event] && this._listeners[event][id]) {
					var arr = this._listeners[event][id],
						index = arr.indexOf(listener);
					
					if (index > -1) {
						arr.splice(index, 1);
					}
				}
			}
		},
		
		/**
		 * Cancels all listeners for an event based on the passed event name and id.
		 * @param {String} event The event name to cancel listeners for.
		 * @param {*} id The ID to cancel all listeners for.
		 */
		'string, *': function (event, id) {
			var self = this;
			
			if (this._emitting) {
				this._eventRemovalQueue = this._eventRemovalQueue || [];
				this._eventRemovalQueue.push(function () {
					self.off(event, id);
				});
			} else {
				if (this._listeners && this._listeners[event] && this._listeners[event][id]) {
					// Kill all listeners for this event id
					delete this._listeners[event][id];
				}
			}
		}
	}),
	
	emit: new Overload({
		/**
		 * Emit an event.
		 * @param {String} event The event to emit.
		 * @returns {*}
		 */
		'string': function (event) {
			// Fire global listeners
			return this.$main(event);
		},
		
		/**
		 * Emit an event with data.
		 * @param {String} event The event to emit.
		 * @param {*} data Data to emit with the event.
		 * @returns {*}
		 */
		'string, ...': function (event, data) {
			// Fire global listeners first
			this.$main.apply(this, arguments);
			
			return this;
		},
		
		/**
		 * Handles emitting events, is an internal method not called directly.
		 * @param {String} event The name of the event to emit.
		 * @param {*} data The data to emit with the event.
		 * @returns {*}
		 * @private
		 */
		'$main': function (event, data) {
			var id = '*';
			this._listeners = this._listeners || {};
			this._emitting = true;
			
			if (this._listeners[event]) {
				var arrIndex,
					arrCount,
					tmpFunc,
					arr;
				
				// Handle global emit
				if (this._listeners[event][id]) {
					arr = this._listeners[event][id];
					arrCount = arr.length;
					
					for (arrIndex = 0; arrIndex < arrCount; arrIndex++) {
						// Check we have a function to execute
						tmpFunc = arr[arrIndex];
						
						if (typeof tmpFunc === 'function') {
							tmpFunc.apply(this, Array.prototype.slice.call(arguments, 1));
						}
					}
				}
			}
			
			this._emitting = false;
			this._processRemovalQueue();
			
			return this;
		}
	}),
	
	emitId: new Overload({
		'string': function (event) {
			throw('Missing id from emitId call!');
		},
		
		'string, *': function (event, id) {
			return this.$main(event, id);
		},
		
		'string, *, ...': function (event, id) {
			// Fire global listeners first
			this.$main.apply(this, arguments);
			
			return this;
		},
		
		'$main': function (event, id, data) {
			this._listeners = this._listeners || {};
			this._emitting = true;
			
			if (this._listeners[event]) {
				var arrIndex,
					arrCount,
					tmpFunc,
					arr;
				
				// Handle global emit
				if (this._listeners[event]['*']) {
					arr = this._listeners[event]['*'];
					arrCount = arr.length;
					
					for (arrIndex = 0; arrIndex < arrCount; arrIndex++) {
						// Check we have a function to execute
						tmpFunc = arr[arrIndex];
						
						if (typeof tmpFunc === 'function') {
							tmpFunc.apply(this, Array.prototype.slice.call(arguments, 2));
						}
					}
				}
				
				// Handle id emit
				if (this._listeners[event][id]) {
					arr = this._listeners[event][id];
					arrCount = arr.length;
					
					for (arrIndex = 0; arrIndex < arrCount; arrIndex++) {
						// Check we have a function to execute
						tmpFunc = arr[arrIndex];
						
						if (typeof tmpFunc === 'function') {
							tmpFunc.apply(this, Array.prototype.slice.call(arguments, 2));
						}
					}
				}
			}
			
			this._emitting = false;
			this._processRemovalQueue();
			
			return this;
		}
	}),
	
	emitStatic: new Overload({
		/**
		 * Emit an event that will fire on listeners even when the listener
		 * is registered AFTER the event has been emitted.
		 *
		 * @param {String} event The event to emit.
		 * @returns {*}
		 */
		'string': function (event) {
			// Fire global listeners
			return this.$main(event);
		},
		
		/**
		 * Emit an event with data that will fire on listeners even when the listener
		 * is registered AFTER the event has been emitted.
		 *
		 * @param {String} event The event to emit.
		 * @param {*} data Data to emit with the event.
		 * @returns {*}
		 */
		'string, ...': function (event, data) {
			// Fire global listeners first
			this.$main.apply(this, arguments);
			
			return this;
		},
		
		/**
		 * Handles emitting events, is an internal method not called directly.
		 * @param {String} event The name of the event to emit.
		 * @param {*} data The data to emit with the event.
		 * @returns {*}
		 * @private
		 */
		'$main': function (event, data) {
			var id = '*';
			this._listeners = this._listeners || {};
			this._emitting = true;
			
			if (this._listeners[event]) {
				var arrIndex,
					arrCount,
					tmpFunc,
					arr;
				
				// Handle global emit
				if (this._listeners[event][id]) {
					arr = this._listeners[event][id];
					arrCount = arr.length;
					
					for (arrIndex = 0; arrIndex < arrCount; arrIndex++) {
						// Check we have a function to execute
						tmpFunc = arr[arrIndex];
						
						if (typeof tmpFunc === 'function') {
							tmpFunc.apply(this, Array.prototype.slice.call(arguments, 1));
						}
					}
				}
			}
			
			this._emitting = false;
			
			this._emitters = this._emitters || {};
			this._emitters[event] = this._emitters[event] || [];
			this._emitters[event].push({
				id: '*',
				args: Array.prototype.slice.call(arguments, 1)
			});
			
			this._processRemovalQueue();
			
			return this;
		}
	}),
	
	emitStaticId: new Overload({
		/**
		 * Require an id to emit.
		 * @param event
		 */
		'string': function (event) {
			throw('Missing id from emitId call!');
		},
		
		/**
		 * Emit an event that will fire on listeners even when the listener
		 * is registered AFTER the event has been emitted.
		 *
		 * @param {String} event The event to emit.
		 * @param {String} id The id of the event to emit.
		 * @returns {*}
		 */
		'string, *': function (event, id) {
			return this.$main(event, id);
		},
		
		/**
		 * Emit an event that will fire on listeners even when the listener
		 * is registered AFTER the event has been emitted.
		 *
		 * @param {String} event The event to emit.
		 * @param {String} id The id of the event to emit.
		 * @param {*=} data The data to emit with the event.
		 * @returns {*}
		 */
		'string, *, ...': function (event, id, data) {
			// Fire global listeners first
			this.$main.apply(this, arguments);
			
			return this;
		},
		
		/**
		 * Handles emitting events, is an internal method not called directly.
		 * @param {String} event The name of the event to emit.
		 * @param {String} id The id of the event to emit.
		 * @param {*} data The data to emit with the event.
		 * @returns {*}
		 * @private
		 */
		'$main': function (event, id, data) {
			this._listeners = this._listeners || {};
			this._emitting = true;
			
			if (this._listeners[event]) {
				var arrIndex,
					arrCount,
					tmpFunc,
					arr;
				
				// Handle global emit
				if (this._listeners[event]['*']) {
					arr = this._listeners[event]['*'];
					arrCount = arr.length;
					
					for (arrIndex = 0; arrIndex < arrCount; arrIndex++) {
						// Check we have a function to execute
						tmpFunc = arr[arrIndex];
						
						if (typeof tmpFunc === 'function') {
							tmpFunc.apply(this, Array.prototype.slice.call(arguments, 2));
						}
					}
				}
				
				// Handle id emit
				if (this._listeners[event][id]) {
					arr = this._listeners[event][id];
					arrCount = arr.length;
					
					for (arrIndex = 0; arrIndex < arrCount; arrIndex++) {
						// Check we have a function to execute
						tmpFunc = arr[arrIndex];
						
						if (typeof tmpFunc === 'function') {
							tmpFunc.apply(this, Array.prototype.slice.call(arguments, 2));
						}
					}
				}
			}
			
			this._emitting = false;
			
			this._emitters = this._emitters || {};
			this._emitters[event] = this._emitters[event] || [];
			this._emitters[event].push({
				id: id,
				args: Array.prototype.slice.call(arguments, 2)
			});
			
			this._processRemovalQueue();
			
			return this;
		}
	}),
	
	/**
	 * Checks if an event has any event listeners or not.
	 * @param {String} event The name of the event to check for.
	 * @returns {boolean} True if one or more event listeners are registered for
	 * the event. False if none are found.
	 */
	willEmit: function (event) {
		var id = '*';
		
		if (this._listeners && this._listeners[event]) {
			var arrIndex,
				arrCount,
				tmpFunc,
				arr;
			
			// Handle global emit
			if (this._listeners[event][id]) {
				arr = this._listeners[event][id];
				arrCount = arr.length;
				
				for (arrIndex = 0; arrIndex < arrCount; arrIndex++) {
					// Check we have a function to execute
					tmpFunc = arr[arrIndex];
					
					if (typeof tmpFunc === 'function') {
						return true;
					}
				}
			}
		}
		
		return false
	},
	
	/**
	 * Checks if an event has any event listeners or not based on the passed id.
	 * @param {String} event The name of the event to check for.
	 * @param {String} id The event ID to check for.
	 * @returns {boolean} True if one or more event listeners are registered for
	 * the event. False if none are found.
	 */
	willEmitId: function (event, id) {
		if (this._listeners && this._listeners[event]) {
			var arrIndex,
				arrCount,
				tmpFunc,
				arr;
			
			// Handle global emit
			if (this._listeners[event]['*']) {
				arr = this._listeners[event]['*'];
				arrCount = arr.length;
				
				for (arrIndex = 0; arrIndex < arrCount; arrIndex++) {
					// Check we have a function to execute
					tmpFunc = arr[arrIndex];
					
					if (typeof tmpFunc === 'function') {
						return true;
					}
				}
			}
			
			// Handle id emit
			if (this._listeners[event][id]) {
				arr = this._listeners[event][id];
				arrCount = arr.length;
				
				for (arrIndex = 0; arrIndex < arrCount; arrIndex++) {
					// Check we have a function to execute
					tmpFunc = arr[arrIndex];
					
					if (typeof tmpFunc === 'function') {
						return true;
					}
				}
			}
		}
		
		return false
	},
	
	/**
	 * If events are cleared with the off() method while the event emitter is
	 * actively processing any events then the off() calls get added to a
	 * queue to be executed after the event emitter is finished. This stops
	 * errors that might occur by potentially modifying the event queue while
	 * the emitter is running through them. This method is called after the
	 * event emitter is finished processing.
	 * @private
	 */
	_processRemovalQueue: function () {
		var i;
		
		if (this._eventRemovalQueue && this._eventRemovalQueue.length) {
			// Execute each removal call
			for (i = 0; i < this._eventRemovalQueue.length; i++) {
				this._eventRemovalQueue[i]();
			}
			
			// Clear the removal queue
			this._eventRemovalQueue = [];
		}
	},
	
	/**
	 * Queues an event to be fired. This has automatic de-bouncing so that any
	 * events of the same type that occur within 100 milliseconds of a previous
	 * one will all be wrapped into a single emit rather than emitting tons of
	 * events for lots of chained inserts etc. Only the data from the last
	 * de-bounced event will be emitted.
	 * @param {String} eventName The name of the event to emit.
	 * @param {*=} data Optional data to emit with the event.
	 */
	deferEmit: function (eventName, data) {
		var self = this,
			args;
		
		if (!this._noEmitDefer && (!this._db || (this._db && !this._db._noEmitDefer))) {
			args = arguments;
			
			// Check for an existing timeout
			this._deferTimeout = this._deferTimeout || {};
			if (this._deferTimeout[eventName]) {
				clearTimeout(this._deferTimeout[eventName]);
			}
			
			// Set a timeout
			this._deferTimeout[eventName] = setTimeout(function () {
				self.emit.apply(self, args);
			}, 1);
		} else {
			this.emit.apply(this, arguments);
		}
		
		return this;
	}
};

var Emitter = function (obj) {
	if (obj) {
		// Convert the object prototype to have eventing capability
		obj.prototype.on = EventMethods.on;
		obj.prototype.off = EventMethods.off;
		obj.prototype.once = EventMethods.once;
		obj.prototype.emit = EventMethods.emit;
		obj.prototype.emitId = EventMethods.emitId;
		obj.prototype.emitStatic = EventMethods.emitStatic;
		obj.prototype.emitStaticId = EventMethods.emitStaticId;
		obj.prototype.deferEmit = EventMethods.deferEmit;
		obj.prototype.willEmit = EventMethods.willEmit;
		obj.prototype.willEmitId = EventMethods.willEmitId;
		obj.prototype._processRemovalQueue = EventMethods._processRemovalQueue;
	}
};

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
