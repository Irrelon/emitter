"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeEmitter = exports.Emitter = exports.EventReturnFlag = void 0;
var EventReturnFlag;
(function (EventReturnFlag) {
    EventReturnFlag[EventReturnFlag["none"] = 0] = "none";
    EventReturnFlag[EventReturnFlag["cancel"] = 1] = "cancel";
})(EventReturnFlag = exports.EventReturnFlag || (exports.EventReturnFlag = {}));
/**
 * Creates a new class with the capability to emit events.
 */
class Emitter {
    constructor() {
        this._eventsEmitting = false;
        this._eventRemovalQueue = [];
        this._eventListeners = {};
        this._eventStaticEmitters = {};
        this._eventsAllowDefer = false;
        this._eventsDeferTimeouts = {};
    }
    /**
     * Attach an event listener to the passed event only if the passed
     * id matches the id for the event being fired.
     * @param eventName The name of the event to listen for.
     * @param id The id to match against.
     * @param listener The method to call when the event is fired.
     * @returns The emitter instance.
     */
    _on(eventName, id, listener) {
        const generateTimeout = (emitter) => {
            setTimeout(() => {
                listener(...emitter.args);
            }, 1);
        };
        this._eventListeners = this._eventListeners || {};
        const nonNullableEventListeners = this._eventListeners[eventName] = this._eventListeners[eventName] || {};
        nonNullableEventListeners[id] = nonNullableEventListeners[id] || [];
        nonNullableEventListeners[id].push(listener);
        // Check for any static emitters, and fire the event if any exist
        if (!this._eventStaticEmitters || !this._eventStaticEmitters[eventName] || !this._eventStaticEmitters[eventName].length)
            return this;
        // Emit events for each emitter
        for (let i = 0; i < this._eventStaticEmitters[eventName].length; i++) {
            const emitter = this._eventStaticEmitters[eventName][i];
            if (id === "*" || emitter.id === id) {
                // Call the listener out of process so that any code that expects a listener
                // to be called at some point in the future rather than immediately on registration
                // will not fail
                generateTimeout(emitter);
            }
        }
        return this;
    }
    /**
     * Attach an event listener to the passed event only if the passed
     * id matches the document id for the event being fired.
     * @param eventName The name of the event to listen for.
     * @param id The id to match against.
     * @param listener The method to call when the event is fired.
     * @returns The emitter instance.
     */
    _once(eventName, id, listener) {
        let fired = false;
        let originalReturnData;
        const internalCallback = (...args) => {
            if (fired)
                return originalReturnData;
            fired = true;
            this.off(eventName, id, internalCallback);
            originalReturnData = listener(...args);
            return originalReturnData;
        };
        return this.on(eventName, id, internalCallback);
    }
    /**
     * Cancels an event listener based on an event name, id and listener function.
     * @param eventName The event to cancel listener for.
     * @param id The ID of the event to cancel listening for.
     * @param listener The event listener function used in the on()
     * or once() call to cancel.
     * @returns The emitter instance.
     */
    _off(eventName, id, listener) {
        // If the event name doesn't have any listeners, exit early
        if (!this._eventListeners || !this._eventListeners[eventName] || !this._eventListeners[eventName][id])
            return this;
        // If we are emitting events at the moment, don't remove this listener
        // until the process has completed, so we queue for removal instead
        if (this._eventsEmitting) {
            this._eventRemovalQueue = this._eventRemovalQueue || [];
            this._eventRemovalQueue.push(() => {
                this.off(eventName, id, listener);
            });
            return this;
        }
        // Check if we have no specific listener... in this case
        // we want to remove all listeners for an id
        if (!listener) {
            if (id === "*") {
                // The id is "all" and no listener was provided so delete all
                // event listeners for this event name
                delete this._eventListeners[eventName];
                return this;
            }
            // No listener provided, delete all listeners for this id
            delete this._eventListeners[eventName][id];
            return this;
        }
        const arr = this._eventListeners[eventName][id] || [];
        const index = arr.indexOf(listener);
        if (index > -1) {
            arr.splice(index, 1);
        }
        return this;
    }
    on(eventName, idOrListener, listener) {
        if (typeof idOrListener === "string") {
            return this._on(eventName, idOrListener, listener);
        }
        return this._on(eventName, "*", idOrListener);
    }
    once(eventName, ...rest) {
        const restTypes = rest.map((arg) => typeof arg);
        if (restTypes[0] === "function") {
            return this._once(eventName, "*", rest[0]);
        }
        return this._once(eventName, rest[0], rest[1]);
    }
    overwrite(eventName, ...rest) {
        const restTypes = rest.map((arg) => typeof arg);
        if (restTypes[0] === "function") {
            this.off(eventName);
            return this._on(eventName, "*", rest[0]);
        }
        this.off(eventName, rest[0]);
        return this._on(eventName, rest[0], rest[1]);
    }
    off(eventName, ...rest) {
        if (rest.length === 0) {
            // Only event was provided, use * as the id to mean "any without"
            // a specific id
            return this._off(eventName, "*");
        }
        const restTypes = rest.map((arg) => typeof arg);
        if (restTypes[0] === "function") {
            // The first arg after the event name was a function (listener)
            // so remove listening for events for this specific listener
            return this._off(eventName, "*", rest[0]);
        }
        // Both id and listener were provided, remove for the specific id
        return this._off(eventName, rest[0], rest[1]);
    }
    /**
     * Emit an event by name.
     * @param eventName The name of the event to emit.
     * @param {...any} data The arguments to send to any listening methods.
     * If you are sending multiple arguments, separate them with a comma so
     * that they are received by the function as separate arguments.
     * @return {number}
     * @example #Emit an Event
     *     // Emit the event named "hello"
     *     myEntity.emit('hello');
     * @example #Emit an Event With Data Object
     *     // Emit the event named "hello"
     *     myEntity.emit('hello', {moo: true});
     * @example #Emit an Event With Multiple Data Values
     *     // Emit the event named "hello"
     *     myEntity.emit('hello', {moo: true}, 'someString');
     * @example #Listen for Event Data
     *     // Set a listener to listen for the data (multiple values emitted
     *     // from an event are passed as function arguments)
     *     myEntity.on('hello', function (arg1, arg2) {
     *         console.log(arg1, arg2);
     *     }
     *
     *     // Emit the event named "hello"
     *     myEntity.emit('hello', 'data1', 'data2');
     *
     *     // The console output is:
     *     //    data1, data2
     */
    emit(eventName, ...data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._eventListeners) {
                return EventReturnFlag.none;
            }
            const id = "*";
            let returnFlag = EventReturnFlag.none;
            this._eventsEmitting = true;
            if (this._eventListeners[eventName] && this._eventListeners[eventName][id]) {
                // Handle global emit
                const arr = this._eventListeners[eventName][id];
                const promiseArr = arr.map((tmpFunc) => {
                    if (typeof tmpFunc !== "function")
                        return;
                    return tmpFunc(...data);
                });
                const result = (yield Promise.all(promiseArr)).find((tmpResult) => tmpResult !== EventReturnFlag.none);
                if (result) {
                    returnFlag = EventReturnFlag.cancel;
                }
            }
            this._eventsEmitting = false;
            this._processRemovalQueue();
            return returnFlag;
        });
    }
    emitId(eventName, id, ...data) {
        if (!this._eventListeners) {
            return EventReturnFlag.none;
        }
        this._eventListeners = this._eventListeners || {};
        this._eventsEmitting = true;
        if (!this._eventListeners[eventName]) {
            this._eventsEmitting = false;
            this._processRemovalQueue();
            return EventReturnFlag.none;
        }
        // Handle id emit
        if (this._eventListeners[eventName][id]) {
            const arr = this._eventListeners[eventName][id];
            const arrCount = arr.length;
            for (let arrIndex = 0; arrIndex < arrCount; arrIndex++) {
                // Check we have a function to execute
                const tmpFunc = arr[arrIndex];
                if (typeof tmpFunc === "function") {
                    tmpFunc.call(this, ...data);
                }
            }
        }
        // Handle global emit
        if (this._eventListeners[eventName]["*"]) {
            const arr = this._eventListeners[eventName]["*"];
            const arrCount = arr.length;
            for (let arrIndex = 0; arrIndex < arrCount; arrIndex++) {
                // Check we have a function to execute
                const tmpFunc = arr[arrIndex];
                if (typeof tmpFunc === "function") {
                    tmpFunc.call(this, ...data);
                }
            }
        }
        this._eventsEmitting = false;
        this._processRemovalQueue();
        return EventReturnFlag.none;
    }
    /**
     * Creates a persistent emitter record that will fire a listener if
     * one is added for this event after the emitStatic() call has been
     * made.
     * @param eventName The name of the event to emit.
     * @param {...any} data Optional arguments to emit with the event.
     * @returns The emitter instance.
     * @private
     */
    emitStatic(eventName, ...data) {
        const id = "*";
        this._eventListeners = this._eventListeners || {};
        this._eventsEmitting = true;
        if (this._eventListeners[eventName] && this._eventListeners[eventName][id]) {
            // Handle global emit
            const arr = this._eventListeners[eventName][id];
            const arrCount = arr.length;
            for (let arrIndex = 0; arrIndex < arrCount; arrIndex++) {
                // Check we have a function to execute
                const tmpFunc = arr[arrIndex];
                if (typeof tmpFunc === "function") {
                    tmpFunc.call(this, ...data);
                }
            }
        }
        this._eventsEmitting = false;
        this._eventStaticEmitters = this._eventStaticEmitters || {};
        this._eventStaticEmitters[eventName] = this._eventStaticEmitters[eventName] || [];
        this._eventStaticEmitters[eventName].push({
            "id": "*",
            "args": data
        });
        this._processRemovalQueue();
        return this;
    }
    /**
     * Creates a persistent emitter record that will fire a listener if
     * one is added for this event after the emitStatic() call has been
     * made.
     * @param eventName The name of the event to emit.
     * @param id The id of the event to emit.
     * @param {...any} data Optional arguments to emit with the event.
     * @returns The emitter instance.
     * @private
     */
    emitStaticId(eventName, id, ...data) {
        if (!id)
            throw new Error("Missing id from emitId call!");
        this._eventListeners = this._eventListeners || {};
        this._eventsEmitting = true;
        if (this._eventListeners[eventName]) {
            // Handle id emit
            if (this._eventListeners[eventName][id]) {
                const arr = this._eventListeners[eventName][id];
                const arrCount = arr.length;
                for (let arrIndex = 0; arrIndex < arrCount; arrIndex++) {
                    // Check we have a function to execute
                    const tmpFunc = arr[arrIndex];
                    if (typeof tmpFunc === "function") {
                        tmpFunc.call(this, ...data);
                    }
                }
            }
            // Handle global emit
            if (this._eventListeners[eventName]["*"]) {
                const arr = this._eventListeners[eventName]["*"];
                const arrCount = arr.length;
                for (let arrIndex = 0; arrIndex < arrCount; arrIndex++) {
                    // Check we have a function to execute
                    const tmpFunc = arr[arrIndex];
                    if (typeof tmpFunc === "function") {
                        tmpFunc.call(this, ...data);
                    }
                }
            }
        }
        this._eventsEmitting = false;
        this._eventStaticEmitters = this._eventStaticEmitters || {};
        this._eventStaticEmitters[eventName] = this._eventStaticEmitters[eventName] || [];
        this._eventStaticEmitters[eventName].push({
            id,
            "args": data
        });
        this._processRemovalQueue();
        return this;
    }
    /**
     * Handles removing emitters, is an internal method not called directly.
     * @param eventName The event to remove static emitter for.
     * @returns The emitter instance.
     * @private
     */
    cancelStatic(eventName) {
        this._eventStaticEmitters = this._eventStaticEmitters || {};
        this._eventStaticEmitters[eventName] = [];
        return this;
    }
    /**
     * Checks if an event has any event listeners or not.
     * @param eventName The name of the event to check for.
     * @returns True if one or more event listeners are registered for
     * the event. False if none are found.
     */
    willEmit(eventName) {
        const id = "*";
        if (!this._eventListeners || !this._eventListeners[eventName]) {
            return false;
        }
        const arr = this._eventListeners[eventName][id];
        const arrCount = arr.length;
        for (let arrIndex = 0; arrIndex < arrCount; arrIndex++) {
            // Check we have a function to execute
            const tmpFunc = arr[arrIndex];
            if (typeof tmpFunc === "function") {
                return true;
            }
        }
        return false;
    }
    /**
     * Checks if an event has any event listeners or not based on the passed id.
     * @param eventName The name of the event to check for.
     * @param id The event ID to check for.
     * @returns True if one or more event listeners are registered for
     * the event. False if none are found.
     */
    willEmitId(eventName, id) {
        if (!this._eventListeners || !this._eventListeners[eventName]) {
            return false;
        }
        // Handle id emit
        if (this._eventListeners[eventName][id]) {
            const arr = this._eventListeners[eventName][id];
            const arrCount = arr.length;
            for (let arrIndex = 0; arrIndex < arrCount; arrIndex++) {
                // Check we have a function to execute
                const tmpFunc = arr[arrIndex];
                if (typeof tmpFunc === "function") {
                    return true;
                }
            }
        }
        // Handle global emit
        if (this._eventListeners[eventName]["*"]) {
            const arr = this._eventListeners[eventName]["*"];
            const arrCount = arr.length;
            for (let arrIndex = 0; arrIndex < arrCount; arrIndex++) {
                // Check we have a function to execute
                const tmpFunc = arr[arrIndex];
                if (typeof tmpFunc === "function") {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Queues an event to be fired. This has automatic de-bouncing so that any
     * events of the same type that occur within 100 milliseconds of a previous
     * one will all be wrapped into a single emit rather than emitting tons of
     * events for lots of chained inserts etc. Only the data from the last
     * de-bounced event will be emitted.
     * @param eventName The name of the event to emit.
     * @param {...any} data Optional arguments to emit with the event.
     * @returns The emitter instance.
     */
    deferEmit(eventName, ...data) {
        if (!this._eventsAllowDefer) {
            // Check for an existing timeout
            this._eventsDeferTimeouts = this._eventsDeferTimeouts || {};
            if (this._eventsDeferTimeouts[eventName]) {
                clearTimeout(this._eventsDeferTimeouts[eventName]);
            }
            // Set a timeout
            this._eventsDeferTimeouts[eventName] = setTimeout(() => {
                void this.emit.call(this, eventName, ...data);
            }, 1);
        }
        else {
            void this.emit.call(this, eventName, ...data);
        }
        return this;
    }
    /**
     * If events are cleared with the off() method while the event emitter is
     * actively processing any events then the off() calls get added to a
     * queue to be executed after the event emitter is finished. This stops
     * errors that might occur by potentially modifying the event queue while
     * the emitter is running through them. This method is called after the
     * event emitter is finished processing.
     * @private
     */
    _processRemovalQueue() {
        if (!this._eventRemovalQueue || !this._eventRemovalQueue.length) {
            return;
        }
        // Execute each removal call
        for (let i = 0; i < this._eventRemovalQueue.length; i++) {
            this._eventRemovalQueue[i]();
        }
        // Clear the removal queue
        this._eventRemovalQueue = [];
    }
}
exports.Emitter = Emitter;
function makeEmitter(obj, prototypeMode) {
    let operateOnObject;
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
}
exports.makeEmitter = makeEmitter;
