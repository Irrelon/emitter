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
 	Version 3.1.0:
 		Changed order of execution so that listeners that are listening
 		against a specific ID get called before the general catch-all
 		listeners.
 	Version 2.0.11:
 		Added cancelStatic method to allow cancelling a static event
 	Version 2.0.7:
 		Fixed UMD module support
 	Version 2.0.6:
 		Added UMD module support
 	Version 2.0.5:
 		Added bower version number
 	Version 2.0.4:
 		Allow instantiation as independent instance, updated unit tests
 	Version 2.0.3:
 		Documentation updates, published to bower
 	Version 2.0.2:
 		Documentation updates
 	Version 2.0.1:
 		Bug fix in this._emitters usage
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

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var Overload = require("irrelon-overload");

var EventMethods = {
  "on": new Overload({
    /**
     * Attach an event listener to the passed event.
     * @memberof Emitter
     * @method on
     * @param {String} event The name of the event to listen for.
     * @param {Function} listener The method to call when the event is fired.
     */
    "string, function": function stringFunction(event, listener) {
      return this.$main(event, "*", listener);
    },

    /**
     * Attach an event listener to the passed event only if the passed
     * id matches the document id for the event being fired.
     * @memberof Emitter
     * @method on
     * @param {String} event The name of the event to listen for.
     * @param {*} id The document id to match against.
     * @param {Function} listener The method to call when the event is fired.
     */
    "string, *, function": function stringFunction(event, id, listener) {
      return this.$main(event, id, listener);
    },

    /**
     * @param event
     * @param id
     * @param listener
     * @return {$main}
     * @private
     */
    "$main": function $main(event, id, listener) {
      var self = this;

      var generateTimeout = function generateTimeout(emitter) {
        setTimeout(function () {
          listener.apply(self, emitter.args);
        }, 1);
      };

      this._listeners = this._listeners || {};
      this._listeners[event] = this._listeners[event] || {};
      this._listeners[event][id] = this._listeners[event][id] || [];

      this._listeners[event][id].push(listener); // Check for any static emitters, and fire the event if any exist


      if (this._emitters && this._emitters[event] && this._emitters[event].length) {
        // Emit events for each emitter
        for (var i = 0; i < this._emitters[event].length; i++) {
          var emitter = this._emitters[event];

          if (id === "*" || emitter.id === id) {
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
  "once": new Overload({
    /**
     * Attach an event listener to the passed event which will only fire once.
     * @memberof Emitter
     * @method once
     * @param {String} event The name of the event to listen for.
     * @param {Function} listener The method to call when the event is fired.
     */
    "string, function": function stringFunction(event, listener) {
      var self = this;
      var fired = false;

      var internalCallback = function internalCallback() {
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
     * @memberof Emitter
     * @method once
     * @param {String} event The name of the event to listen for.
     * @param {*} id The document id to match against.
     * @param {Function} listener The method to call when the event is fired.
     */
    "string, *, function": function stringFunction(event, id, listener) {
      var self = this;
      var fired = false;

      var internalCallback = function internalCallback() {
        if (!fired) {
          fired = true;
          self.off(event, id, internalCallback);
          listener.apply(self, arguments);
        }
      };

      return this.on(event, id, internalCallback);
    }
  }),
  "one": new Overload({
    /**
     * Attach an event listener to the passed event which will cancel all
     * previous listeners and only fire this newest one.
     * @memberof Emitter
     * @method one
     * @param {String} event The name of the event to listen for.
     * @param {Function} listener The method to call when the event is fired.
     */
    "string, function": function stringFunction(event, listener) {
      this.off(event);
      return this.on(event, listener);
    },

    /**
     * Attach an event listener to the passed event only if the passed
     * id matches the document id for the event being fired.
     * @memberof Emitter
     * @method once
     * @param {String} event The name of the event to listen for.
     * @param {*} id The document id to match against.
     * @param {Function} listener The method to call when the event is fired.
     */
    "string, *, function": function stringFunction(event, id, listener) {
      this.off(event, id);
      return this.on(event, id, listener);
    }
  }),
  "off": new Overload({
    /**
     * Cancels all event listeners for the passed event.
     * @memberof Emitter
     * @method off
     * @param {String} event The name of the event.
     * @returns {*}
     */
    "string": function string(event) {
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
     * @memberof Emitter
     * @method off
     * @param {String} event The event to cancel listener for.
     * @param {Function} listener The event listener function used in the on()
     * or once() call to cancel.
     * @returns {*}
     */
    "string, function": function stringFunction(event, listener) {
      var self = this;

      if (this._emitting) {
        this._eventRemovalQueue = this._eventRemovalQueue || [];

        this._eventRemovalQueue.push(function () {
          self.off(event, listener);
        });
      } else if (typeof listener === "string") {
        if (this._listeners && this._listeners[event] && this._listeners[event][listener]) {
          delete this._listeners[event][listener];
        }
      } else {
        if (this._listeners && this._listeners[event]) {
          var arr = this._listeners[event]["*"] || [];
          var index = arr.indexOf(listener);

          if (index > -1) {
            arr.splice(index, 1);
          }
        }
      }

      return this;
    },

    /**
     * Cancels an event listener based on an event name, id and listener function.
     * @memberof Emitter
     * @method off
     * @param {String} event The event to cancel listener for.
     * @param {String} id The ID of the event to cancel listening for.
     * @param {Function} listener The event listener function used in the on()
     * or once() call to cancel.
     */
    "string, *, function": function stringFunction(event, id, listener) {
      var self = this;

      if (this._emitting) {
        this._eventRemovalQueue = this._eventRemovalQueue || [];

        this._eventRemovalQueue.push(function () {
          self.off(event, id, listener);
        });
      } else {
        if (this._listeners && this._listeners[event] && this._listeners[event][id]) {
          var arr = this._listeners[event][id] || [],
              index = arr.indexOf(listener);

          if (index > -1) {
            arr.splice(index, 1);
          }
        }
      }
    },

    /**
     * Cancels all listeners for an event based on the passed event name and id.
     * @memberof Emitter
     * @method off
     * @param {String} event The event name to cancel listeners for.
     * @param {*} id The ID to cancel all listeners for.
     */
    "string, *": function string(event, id) {
      var self = this;

      if (this._emitting) {
        this._eventRemovalQueue = this._eventRemovalQueue || [];

        this._eventRemovalQueue.push(function () {
          self.off(event, id);
        });
      } else if (this._listeners && this._listeners[event] && this._listeners[event][id]) {
        // Kill all listeners for this event id
        delete this._listeners[event][id];
      }
    }
  }),
  "emit": new Overload({
    /**
     * Emit an event.
     * @memberof Emitter
     * @method emit
     * @param {String} event The event to emit.
     * @returns {*}
     */
    "string": function string(event) {
      // Fire global listeners
      return this.$main(event);
    },

    /**
     * Emit an event with data.
     * @memberof Emitter
     * @method emit
     * @param {String} event The event to emit.
     * @param {*} data Data to emit with the event.
     * @returns {*}
     */
    "string, ...": function string(event, data) {
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
    "$main": function $main(event, data) {
      var id = "*";
      this._listeners = this._listeners || {};
      this._emitting = true;

      if (this._listeners[event] && this._listeners[event][id]) {
        // Handle global emit
        var arr = this._listeners[event][id];
        var arrCount = arr.length;

        for (var arrIndex = 0; arrIndex < arrCount; arrIndex++) {
          // Check we have a function to execute
          var tmpFunc = arr[arrIndex];

          if (typeof tmpFunc === "function") {
            tmpFunc.apply(this, Array.prototype.slice.call(arguments, 1));
          }
        }
      }

      this._emitting = false;

      this._processRemovalQueue();

      return this;
    }
  }),
  "emitId": new Overload({
    "string": function string(event) {
      throw "Missing id from emitId call!";
    },
    "string, *": function string(event, id) {
      return this.$main(event, id);
    },
    "string, *, ...": function string(event, id) {
      // Fire global listeners first
      this.$main.apply(this, arguments);
      return this;
    },
    "$main": function $main(event, id, data) {
      this._listeners = this._listeners || {};
      this._emitting = true;

      if (!this._listeners[event]) {
        this._emitting = false;

        this._processRemovalQueue();

        return this;
      } // Handle id emit


      if (this._listeners[event][id]) {
        var arr = this._listeners[event][id];
        var arrCount = arr.length;

        for (var arrIndex = 0; arrIndex < arrCount; arrIndex++) {
          // Check we have a function to execute
          var tmpFunc = arr[arrIndex];

          if (typeof tmpFunc === "function") {
            tmpFunc.apply(this, Array.prototype.slice.call(arguments, 2));
          }
        }
      } // Handle global emit


      if (this._listeners[event]["*"]) {
        var _arr = this._listeners[event]["*"];
        var _arrCount = _arr.length;

        for (var _arrIndex = 0; _arrIndex < _arrCount; _arrIndex++) {
          // Check we have a function to execute
          var _tmpFunc = _arr[_arrIndex];

          if (typeof _tmpFunc === "function") {
            _tmpFunc.apply(this, Array.prototype.slice.call(arguments, 2));
          }
        }
      }

      this._emitting = false;

      this._processRemovalQueue();

      return this;
    }
  }),
  "emitStatic": new Overload({
    /**
     * Emit an event that will fire on listeners even when the listener
     * is registered AFTER the event has been emitted.
     * @memberof Emitter
     * @method emitStatic
     * @param {String} event The event to emit.
     * @returns {*}
     */
    "string": function string(event) {
      // Fire global listeners
      return this.$main(event);
    },

    /**
     * Emit an event with data that will fire on listeners even when the listener
     * is registered AFTER the event has been emitted.
     * @memberof Emitter
     * @method emitStatic
     * @param {String} event The event to emit.
     * @param {*} data Data to emit with the event.
     * @returns {*}
     */
    "string, ...": function string(event, data) {
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
    "$main": function $main(event, data) {
      var id = "*";
      this._listeners = this._listeners || {};
      this._emitting = true;

      if (this._listeners[event] && this._listeners[event][id]) {
        // Handle global emit
        var arr = this._listeners[event][id];
        var arrCount = arr.length;

        for (var arrIndex = 0; arrIndex < arrCount; arrIndex++) {
          // Check we have a function to execute
          var tmpFunc = arr[arrIndex];

          if (typeof tmpFunc === "function") {
            tmpFunc.apply(this, Array.prototype.slice.call(arguments, 1));
          }
        }
      }

      this._emitting = false;
      this._emitters = this._emitters || {};
      this._emitters[event] = this._emitters[event] || [];

      this._emitters[event].push({
        "id": "*",
        "args": Array.prototype.slice.call(arguments, 1)
      });

      this._processRemovalQueue();

      return this;
    }
  }),
  "emitStaticId": new Overload({
    /**
     * Require an id to emit.
     * @memberof Emitter
     * @method emitStaticId
     * @param event
     */
    "string": function string(event) {
      throw "Missing id from emitId call!";
    },

    /**
     * Emit an event that will fire on listeners even when the listener
     * is registered AFTER the event has been emitted.
     * @memberof Emitter
     * @method emitStaticId
     * @param {String} event The event to emit.
     * @param {String} id The id of the event to emit.
     * @returns {*}
     */
    "string, *": function string(event, id) {
      return this.$main(event, id);
    },

    /**
     * Emit an event that will fire on listeners even when the listener
     * is registered AFTER the event has been emitted.
     * @memberof Emitter
     * @method emitStaticId
     * @param {String} event The event to emit.
     * @param {String} id The id of the event to emit.
     * @param {*=} data The data to emit with the event.
     * @returns {*}
     */
    "string, *, ...": function string(event, id, data) {
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
    "$main": function $main(event, id, data) {
      this._listeners = this._listeners || {};
      this._emitting = true;

      if (this._listeners[event]) {
        // Handle id emit
        if (this._listeners[event][id]) {
          var arr = this._listeners[event][id];
          var arrCount = arr.length;

          for (var arrIndex = 0; arrIndex < arrCount; arrIndex++) {
            // Check we have a function to execute
            var tmpFunc = arr[arrIndex];

            if (typeof tmpFunc === "function") {
              tmpFunc.apply(this, Array.prototype.slice.call(arguments, 2));
            }
          }
        } // Handle global emit


        if (this._listeners[event]["*"]) {
          var _arr2 = this._listeners[event]["*"];
          var _arrCount2 = _arr2.length;

          for (var _arrIndex2 = 0; _arrIndex2 < _arrCount2; _arrIndex2++) {
            // Check we have a function to execute
            var _tmpFunc2 = _arr2[_arrIndex2];

            if (typeof _tmpFunc2 === "function") {
              _tmpFunc2.apply(this, Array.prototype.slice.call(arguments, 2));
            }
          }
        }
      }

      this._emitting = false;
      this._emitters = this._emitters || {};
      this._emitters[event] = this._emitters[event] || [];

      this._emitters[event].push({
        id: id,
        "args": Array.prototype.slice.call(arguments, 2)
      });

      this._processRemovalQueue();

      return this;
    }
  }),
  "cancelStatic": new Overload({
    /**
     * Remove a static event emitter.
     * @memberof Emitter
     * @method emitStatic
     * @param {String} event The event to remove static emitter for.
     * @returns {*}
     */
    "string": function string(event) {
      // Fire global listeners
      return this.$main(event);
    },

    /**
     * Handles removing emitters, is an internal method not called directly.
     * @param {String} event The event to remove static emitter for.
     * @returns {*}
     * @private
     */
    "$main": function $main(event) {
      this._emitters = this._emitters || {};
      this._emitters[event] = [];
      return this;
    }
  }),

  /**
   * Checks if an event has any event listeners or not.
   * @memberof Emitter
   * @method willEmit
   * @param {String} event The name of the event to check for.
   * @returns {boolean} True if one or more event listeners are registered for
   * the event. False if none are found.
   */
  "willEmit": function willEmit(event) {
    var id = "*";

    if (!this._listeners || !this._listeners[event]) {
      return false;
    }

    var arr = this._listeners[event][id];
    var arrCount = arr.length;

    for (var arrIndex = 0; arrIndex < arrCount; arrIndex++) {
      // Check we have a function to execute
      var tmpFunc = arr[arrIndex];

      if (typeof tmpFunc === "function") {
        return true;
      }
    }

    return false;
  },

  /**
   * Checks if an event has any event listeners or not based on the passed id.
   * @memberof Emitter
   * @method willEmitId
   * @param {String} event The name of the event to check for.
   * @param {String} id The event ID to check for.
   * @returns {boolean} True if one or more event listeners are registered for
   * the event. False if none are found.
   */
  "willEmitId": function willEmitId(event, id) {
    if (!this._listeners || !this._listeners[event]) {
      return false;
    } // Handle id emit


    if (this._listeners[event][id]) {
      var arr = this._listeners[event][id];
      var arrCount = arr.length;

      for (var arrIndex = 0; arrIndex < arrCount; arrIndex++) {
        // Check we have a function to execute
        var tmpFunc = arr[arrIndex];

        if (typeof tmpFunc === "function") {
          return true;
        }
      }
    } // Handle global emit


    if (this._listeners[event]["*"]) {
      var _arr3 = this._listeners[event]["*"];
      var _arrCount3 = _arr3.length;

      for (var _arrIndex3 = 0; _arrIndex3 < _arrCount3; _arrIndex3++) {
        // Check we have a function to execute
        var _tmpFunc3 = _arr3[_arrIndex3];

        if (typeof _tmpFunc3 === "function") {
          return true;
        }
      }
    }

    return false;
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
  "_processRemovalQueue": function _processRemovalQueue() {
    if (!this._eventRemovalQueue || !this._eventRemovalQueue.length) {
      return;
    } // Execute each removal call


    for (var i = 0; i < this._eventRemovalQueue.length; i++) {
      this._eventRemovalQueue[i]();
    } // Clear the removal queue


    this._eventRemovalQueue = [];
  },

  /**
   * Queues an event to be fired. This has automatic de-bouncing so that any
   * events of the same type that occur within 100 milliseconds of a previous
   * one will all be wrapped into a single emit rather than emitting tons of
   * events for lots of chained inserts etc. Only the data from the last
   * de-bounced event will be emitted.
   * @memberof Emitter
   * @method deferEmit
   * @param {String} eventName The name of the event to emit.
   * @param {*=} data Optional data to emit with the event.
   */
  "deferEmit": function deferEmit(eventName, data) {
    var self = this;

    if (!this._noEmitDefer && (!this._db || this._db && !this._db._noEmitDefer)) {
      var args = arguments; // Check for an existing timeout

      this._deferTimeout = this._deferTimeout || {};

      if (this._deferTimeout[eventName]) {
        clearTimeout(this._deferTimeout[eventName]);
      } // Set a timeout


      this._deferTimeout[eventName] = setTimeout(function () {
        self.emit.apply(self, args);
      }, 1);
    } else {
      this.emit.apply(this, arguments);
    }

    return this;
  }
};
/**
 * @class Emitter
 * @param {Object=} obj The object / function / class to add event methods to.
 * If none is provided a new object will be created. This allows you to use
 * new Emitter() to generate an event emitter that is not tied to any other
 * object or class.
 * @param {Boolean=} prototypeMode Defaults to true. Set to true to add emitter
 * methods to the the passed object"s prototype property e.g. obj.prototype.on
 * = emitter.on. Set to false to add emitter methods the object directly e.g.
 * obj.on = emitter.on.
 * @constructor
 */

var Emitter = function Emitter(obj, prototypeMode) {
  var operateOnObject;

  if (obj === undefined && prototypeMode === undefined) {
    obj = {};
    prototypeMode = false;
  }

  if (typeof obj === "boolean" && prototypeMode === undefined) {
    prototypeMode = obj;
    obj = {};
  }

  if (prototypeMode === undefined) {
    prototypeMode = true;
  }

  if ((0, _typeof2.default)(obj) !== "object" && typeof obj !== "function") {
    throw new Error("Cannot operate on a non-object / non-function passed as first argument!");
  }

  if (prototypeMode) {
    if (obj.prototype === undefined) {
      throw new Error("Cannot modify prototype of passed object, it has no prototype property! Was it instantiated with the new operator correctly?");
    }

    operateOnObject = obj.prototype;
  } else {
    operateOnObject = obj;
  } // Convert the object prototype to have eventing capability


  operateOnObject.on = EventMethods.on;
  operateOnObject.off = EventMethods.off;
  operateOnObject.one = EventMethods.one;
  operateOnObject.once = EventMethods.once;
  operateOnObject.emit = EventMethods.emit;
  operateOnObject.emitId = EventMethods.emitId;
  operateOnObject.emitStatic = EventMethods.emitStatic;
  operateOnObject.emitStaticId = EventMethods.emitStaticId;
  operateOnObject.cancelStatic = EventMethods.cancelStatic;
  operateOnObject.deferEmit = EventMethods.deferEmit;
  operateOnObject.willEmit = EventMethods.willEmit;
  operateOnObject.willEmitId = EventMethods.willEmitId;
  operateOnObject._processRemovalQueue = EventMethods._processRemovalQueue;
  return obj;
};

Emitter.prototype = EventMethods;
module.exports = Emitter;