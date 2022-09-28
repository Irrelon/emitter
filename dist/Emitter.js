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
    Version 4.0.1:
        Updated library to use new ES6 functionality making Overload()
        less useful so it can be removed as a dependency.
    Version 4.0.0:
        Breaking change. Library now has named exports `Emitter` and
        `makeEmitter`. `Emitter` is an ES6 class that can be extended
        and `makeEmitter` is a function that takes an object or class
        and does what `Emitter(someObject)` used to do. This change is
        to support being able to extend `Emitter` as a base class.
    Version 3.1.0:
        Changed order of execution so that listeners that are listening
        against a specific ID get called before the general catch-all
        listeners. Renamed package to @irrelon/emitter.
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var EventMainMethods = {
    /**
     * Attach an event listener to the passed event only if the passed
     * id matches the document id for the event being fired.
     * @memberOf Emitter
     * @method on
     * @param {String} event The name of the event to listen for.
     * @param {*} id The document id to match against.
     * @param {Function} listener The method to call when the event is fired.
     * @returns {Emitter} The emitter instance.
     */
    "_on": function (event, id, listener) {
        var _this = this;
        var self = this;
        var generateTimeout = function (emitter) {
            setTimeout(function () {
                listener.apply(_this, emitter.args);
            }, 1);
        };
        this._listeners = this._listeners || {};
        this._listeners[event] = this._listeners[event] || {};
        this._listeners[event][id] = this._listeners[event][id] || [];
        this._listeners[event][id].push(listener);
        // Check for any static emitters, and fire the event if any exist
        if (!this._emitters || !this._emitters[event] || !this._emitters[event].length)
            return this;
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
        return this;
    },
    /**
     * Attach an event listener to the passed event only if the passed
     * id matches the document id for the event being fired.
     * @memberOf Emitter
     * @method once
     * @param {String} event The name of the event to listen for.
     * @param {*} id The document id to match against.
     * @param {Function} listener The method to call when the event is fired.
     * @returns {Emitter} The emitter instance.
     */
    "_once": function (event, id, listener) {
        var _this = this;
        var fired = false;
        var internalCallback = function () {
            if (fired)
                return;
            fired = true;
            _this.off(event, id, internalCallback);
            listener.apply(_this, arguments);
        };
        return this.on(event, id, internalCallback);
    },
    /**
     * Cancels an event listener based on an event name, id and listener function.
     * @memberOf Emitter
     * @method off
     * @param {String} event The event to cancel listener for.
     * @param {String} id The ID of the event to cancel listening for.
     * @param {Function} listener The event listener function used in the on()
     * or once() call to cancel.
     * @returns {Emitter} The emitter instance.
     */
    "_off": function (event, id, listener) {
        var _this = this;
        if (this._emitting) {
            this._eventRemovalQueue = this._eventRemovalQueue || [];
            this._eventRemovalQueue.push(function () {
                _this.off(event, id, listener);
            });
            return this;
        }
        if (!this._listeners || !this._listeners[event] || !this._listeners[event][id])
            return this;
        if (id && !listener) {
            if (id === "*") {
                delete this._listeners[event];
                return this;
            }
            // No listener provided, delete all listeners
            delete this._listeners[event][id];
            return this;
        }
        var arr = this._listeners[event][id] || [], index = arr.indexOf(listener);
        if (index > -1) {
            arr.splice(index, 1);
        }
    }
};
/**
 * @class Emitter
 * @constructor
 */
var Emitter = /** @class */ (function () {
    function Emitter() {
    }
    /**
     * Attach an event listener to the passed event only if the passed
     * id matches the document id for the event being fired.
     * @memberOf Emitter
     * @method on
     * @param {String} event The name of the event to listen for.
     * @param {*} id The document id to match against.
     * @param {Function} listener The method to call when the event is fired.
     * @returns {Emitter} The emitter instance.
     */
    Emitter.prototype.on = function (event) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        var restTypes = rest.map(function (arg) { return typeof arg; });
        if (restTypes[0] === "function") {
            return EventMainMethods._on.call(this, event, "*", rest[0]);
        }
        return EventMainMethods._on.call(this, event, rest[0], rest[1]);
    };
    /**
     * Attach an event listener to the passed event only if the passed
     * id matches the document id for the event being fired.
     * @memberOf Emitter
     * @method once
     * @param {String} event The name of the event to listen for.
     * @param {*} id The document id to match against.
     * @param {Function} listener The method to call when the event is fired.
     * @returns {Emitter} The emitter instance.
     */
    Emitter.prototype.once = function (event) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        var restTypes = rest.map(function (arg) { return typeof arg; });
        if (restTypes[0] === "function") {
            return EventMainMethods._once.call(this, event, "*", rest[0]);
        }
        return EventMainMethods._once.call(this, event, rest[0], rest[1]);
    };
    /**
     * Attach an event listener to the passed event only if the passed
     * id matches the document id for the event being fired.
     * @memberOf Emitter
     * @method once
     * @param {String} event The name of the event to listen for.
     * @param {*} id The document id to match against.
     * @param {Function} listener The method to call when the event is fired.
     * @returns {Emitter} The emitter instance.
     */
    Emitter.prototype.one = function (event) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        var restTypes = rest.map(function (arg) { return typeof arg; });
        if (restTypes[0] === "function") {
            this.off(event);
            return EventMainMethods._on.call(this, event, "*", rest[0]);
        }
        this.off(event, rest[0]);
        return EventMainMethods._on.call(this, event, rest[0], rest[1]);
    };
    /**
     * Cancels an event listener based on an event name, id and listener function.
     * @memberOf Emitter
     * @method off
     * @param {String} event The event to cancel listener for.
     * @param {String} id The ID of the event to cancel listening for.
     * @param {Function} listener The event listener function used in the on()
     * or once() call to cancel.
     * @returns {Emitter} The emitter instance.
     */
    Emitter.prototype.off = function (event) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        if (rest.length === 0) {
            // Only event was provided
            return EventMainMethods._off.call(this, event, "*");
        }
        var restTypes = rest.map(function (arg) { return typeof arg; });
        if (restTypes[0] === "function") {
            return EventMainMethods._off.call(this, event, "*", rest[0]);
        }
        return EventMainMethods._off.call(this, event, rest[0], rest[1]);
    };
    /**
     * Handles emitting events, is an internal method not called directly.
     * @param {String} event The name of the event to emit.
     * @param {*} data The data to emit with the event.
     * @returns {Emitter} The emitter instance.
     * @private
     */
    Emitter.prototype.emit = function (event) {
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
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
                    tmpFunc.call.apply(tmpFunc, __spreadArray([this], __read(data), false));
                }
            }
        }
        this._emitting = false;
        this._processRemovalQueue();
        return this;
    };
    Emitter.prototype.emitId = function (event, id) {
        var data = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            data[_i - 2] = arguments[_i];
        }
        this._listeners = this._listeners || {};
        this._emitting = true;
        if (!this._listeners[event]) {
            this._emitting = false;
            this._processRemovalQueue();
            return this;
        }
        // Handle id emit
        if (this._listeners[event][id]) {
            var arr = this._listeners[event][id];
            var arrCount = arr.length;
            for (var arrIndex = 0; arrIndex < arrCount; arrIndex++) {
                // Check we have a function to execute
                var tmpFunc = arr[arrIndex];
                if (typeof tmpFunc === "function") {
                    tmpFunc.call.apply(tmpFunc, __spreadArray([this], __read(data), false));
                }
            }
        }
        // Handle global emit
        if (this._listeners[event]["*"]) {
            var arr = this._listeners[event]["*"];
            var arrCount = arr.length;
            for (var arrIndex = 0; arrIndex < arrCount; arrIndex++) {
                // Check we have a function to execute
                var tmpFunc = arr[arrIndex];
                if (typeof tmpFunc === "function") {
                    tmpFunc.call.apply(tmpFunc, __spreadArray([this], __read(data), false));
                }
            }
        }
        this._emitting = false;
        this._processRemovalQueue();
        return this;
    };
    /**
     * Handles emitting events, is an internal method not called directly.
     * @param {String} event The name of the event to emit.
     * @param {*} data The data to emit with the event.
     * @returns {Emitter} The emitter instance.
     * @private
     */
    Emitter.prototype.emitStatic = function (event) {
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
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
                    tmpFunc.call.apply(tmpFunc, __spreadArray([this], __read(data), false));
                }
            }
        }
        this._emitting = false;
        this._emitters = this._emitters || {};
        this._emitters[event] = this._emitters[event] || [];
        this._emitters[event].push({
            "id": "*",
            "args": data
        });
        this._processRemovalQueue();
        return this;
    };
    /**
     * Handles emitting events, is an internal method not called directly.
     * @param {String} event The name of the event to emit.
     * @param {String} id The id of the event to emit.
     * @param {*} data The data to emit with the event.
     * @returns {Emitter} The emitter instance.
     * @private
     */
    Emitter.prototype.emitStaticId = function (event, id) {
        var data = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            data[_i - 2] = arguments[_i];
        }
        if (!id)
            throw new Error("Missing id from emitId call!");
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
                        tmpFunc.call.apply(tmpFunc, __spreadArray([this], __read(data), false));
                    }
                }
            }
            // Handle global emit
            if (this._listeners[event]["*"]) {
                var arr = this._listeners[event]["*"];
                var arrCount = arr.length;
                for (var arrIndex = 0; arrIndex < arrCount; arrIndex++) {
                    // Check we have a function to execute
                    var tmpFunc = arr[arrIndex];
                    if (typeof tmpFunc === "function") {
                        tmpFunc.call.apply(tmpFunc, __spreadArray([this], __read(data), false));
                    }
                }
            }
        }
        this._emitting = false;
        this._emitters = this._emitters || {};
        this._emitters[event] = this._emitters[event] || [];
        this._emitters[event].push({
            id: id,
            "args": data
        });
        this._processRemovalQueue();
        return this;
    };
    /**
     * Handles removing emitters, is an internal method not called directly.
     * @param {String} event The event to remove static emitter for.
     * @returns {Emitter} The emitter instance.
     * @private
     */
    Emitter.prototype.cancelStatic = function (event) {
        this._emitters = this._emitters || {};
        this._emitters[event] = [];
        return this;
    };
    /**
     * Checks if an event has any event listeners or not.
     * @memberOf Emitter
     * @method willEmit
     * @param {String} event The name of the event to check for.
     * @returns {boolean} True if one or more event listeners are registered for
     * the event. False if none are found.
     */
    Emitter.prototype.willEmit = function (event) {
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
    };
    /**
     * Checks if an event has any event listeners or not based on the passed id.
     * @memberOf Emitter
     * @method willEmitId
     * @param {String} event The name of the event to check for.
     * @param {String} id The event ID to check for.
     * @returns {boolean} True if one or more event listeners are registered for
     * the event. False if none are found.
     */
    Emitter.prototype.willEmitId = function (event, id) {
        if (!this._listeners || !this._listeners[event]) {
            return false;
        }
        // Handle id emit
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
        }
        // Handle global emit
        if (this._listeners[event]["*"]) {
            var arr = this._listeners[event]["*"];
            var arrCount = arr.length;
            for (var arrIndex = 0; arrIndex < arrCount; arrIndex++) {
                // Check we have a function to execute
                var tmpFunc = arr[arrIndex];
                if (typeof tmpFunc === "function") {
                    return true;
                }
            }
        }
        return false;
    };
    /**
     * Queues an event to be fired. This has automatic de-bouncing so that any
     * events of the same type that occur within 100 milliseconds of a previous
     * one will all be wrapped into a single emit rather than emitting tons of
     * events for lots of chained inserts etc. Only the data from the last
     * de-bounced event will be emitted.
     * @memberOf Emitter
     * @method deferEmit
     * @param {String} eventName The name of the event to emit.
     * @param {*=} data Optional data to emit with the event.
     * @returns {Emitter} The emitter instance.
     */
    Emitter.prototype.deferEmit = function (eventName) {
        var _a;
        var _this = this;
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        if (!this._noEmitDefer && (!this._db || (this._db && !this._db._noEmitDefer))) {
            // Check for an existing timeout
            this._deferTimeout = this._deferTimeout || {};
            if (this._deferTimeout[eventName]) {
                clearTimeout(this._deferTimeout[eventName]);
            }
            // Set a timeout
            this._deferTimeout[eventName] = setTimeout(function () {
                var _a;
                (_a = _this.emit).call.apply(_a, __spreadArray([_this, eventName], __read(data), false));
            }, 1);
        }
        else {
            (_a = this.emit).call.apply(_a, __spreadArray([this, eventName], __read(data), false));
        }
        return this;
    };
    /**
     * If events are cleared with the off() method while the event emitter is
     * actively processing any events then the off() calls get added to a
     * queue to be executed after the event emitter is finished. This stops
     * errors that might occur by potentially modifying the event queue while
     * the emitter is running through them. This method is called after the
     * event emitter is finished processing.
     * @private
     */
    Emitter.prototype._processRemovalQueue = function () {
        if (!this._eventRemovalQueue || !this._eventRemovalQueue.length) {
            return;
        }
        // Execute each removal call
        for (var i = 0; i < this._eventRemovalQueue.length; i++) {
            this._eventRemovalQueue[i]();
        }
        // Clear the removal queue
        this._eventRemovalQueue = [];
    };
    return Emitter;
}());
/**
 * Makes the passed class or object into an emitter by modifying either the
 * prototype or the actual object to include event emitter methods.
 * @param {Object} [obj={}] The object / function / class to add event methods to.
 * If none is provided a new object will be created. This allows you to use
 * new Emitter() to generate an event emitter that is not tied to any other
 * object or class.
 * @param {Boolean} [prototypeMode=true] Defaults to true. Set to true to add emitter
 * methods to the the passed object"s prototype property e.g. obj.prototype.on
 * = emitter.on. Set to false to add emitter methods the object directly e.g.
 * obj.on = emitter.on.
 * @returns {Object} The newly augmented object.
 */
var makeEmitter = function (obj, prototypeMode) {
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
    if (typeof obj !== "object" && typeof obj !== "function") {
        throw new Error("Cannot operate on a non-object / non-function passed as first argument!");
    }
    if (prototypeMode) {
        if (obj.prototype === undefined) {
            throw new Error("Cannot modify prototype of passed object, it has no prototype property! Was it instantiated with the new operator correctly?");
        }
        operateOnObject = obj.prototype;
    }
    else {
        operateOnObject = obj;
    }
    // Convert the object prototype to have eventing capability
    operateOnObject.on = Emitter.prototype.on;
    operateOnObject.off = Emitter.prototype.off;
    operateOnObject.one = Emitter.prototype.one;
    operateOnObject.once = Emitter.prototype.once;
    operateOnObject.emit = Emitter.prototype.emit;
    operateOnObject.emitId = Emitter.prototype.emitId;
    operateOnObject.emitStatic = Emitter.prototype.emitStatic;
    operateOnObject.emitStaticId = Emitter.prototype.emitStaticId;
    operateOnObject.cancelStatic = Emitter.prototype.cancelStatic;
    operateOnObject.deferEmit = Emitter.prototype.deferEmit;
    operateOnObject.willEmit = Emitter.prototype.willEmit;
    operateOnObject.willEmitId = Emitter.prototype.willEmitId;
    operateOnObject._processRemovalQueue = Emitter.prototype._processRemovalQueue;
    return obj;
};
module.exports = {
    Emitter: Emitter,
    makeEmitter: makeEmitter
};
