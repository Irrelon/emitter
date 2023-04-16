/*
 The MIT License (MIT)

 Copyright (c) 2014 Irrelon Software Limited
 https://www.irrelon.com

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
 	Version 5.0.2:
 		Removed some unnecessary code, updated to be in step with version
 		that is being used in the new version of Isogenic Game Engine.
 	Version 5.0.1:
 		Further TypeScript updates.
 	Version 5.0.0:
 		Added TypeScript and prettier, removed babel etc
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
export enum EventReturnFlag {
	none,
	cancel
}

export type EventListenerCallback = (...args: any[]) => any | Promise<any>;
export interface EventStaticEmitterObject {
	id: string;
	args: any[];
}

/**
 * Creates a new class with the capability to emit events.
 */
export class Emitter {
	_eventsEmitting: boolean = false;
	_eventRemovalQueue: any[] = [];
	_eventListeners?: Record<string, Record<string, EventListenerCallback[]>>;
	_eventStaticEmitters: Record<string, EventStaticEmitterObject[]> = {};
	_eventsAllowDefer: boolean = false;
	_eventsDeferTimeouts: Record<any, number> = {};

	/**
	 * Attach an event listener to the passed event only if the passed
	 * id matches the id for the event being fired.
	 * @param {string} eventName The name of the event to listen for.
	 * @param {string} id The id to match against.
	 * @param {function} listener The method to call when the event is fired.
	 * @returns {Emitter} The emitter instance.
	 */
	_on (eventName: string, id: string, listener: EventListenerCallback) {
		const generateTimeout = (emitter: EventStaticEmitterObject) => {
			setTimeout(() => {
				listener(...emitter.args);
			}, 1);
		};

		this._eventListeners = this._eventListeners || {};
		this._eventListeners[eventName] = this._eventListeners[eventName] || {};
		this._eventListeners[eventName][id] = this._eventListeners[eventName][id] || [];
		this._eventListeners[eventName][id].push(listener);

		// Check for any static emitters, and fire the event if any exist
		if (!this._eventStaticEmitters || !this._eventStaticEmitters[eventName] || !this._eventStaticEmitters[eventName].length) return this;

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
	 * @param {String} eventName The name of the event to listen for.
	 * @param {*} id The id to match against.
	 * @param {Function} listener The method to call when the event is fired.
	 * @returns {Emitter} The emitter instance.
	 */
	_once (eventName: string, id: string, listener: EventListenerCallback) {
		let fired = false;

		const internalCallback = (...args: any[]) => {
			if (fired) return;

			fired = true;
			this.off(eventName, id, internalCallback);
			listener(...args);
		};

		return this.on(eventName, id, internalCallback);
	}

	/**
	 * Cancels an event listener based on an event name, id and listener function.
	 * @param {String} eventName The event to cancel listener for.
	 * @param {String} id The ID of the event to cancel listening for.
	 * @param {Function} listener The event listener function used in the on()
	 * or once() call to cancel.
	 * @returns {Emitter} The emitter instance.
	 */
	_off (eventName: string, id: string, listener?: EventListenerCallback): this {
		// If the event name doesn't have any listeners, exit early
		if (!this._eventListeners || !this._eventListeners[eventName] || !this._eventListeners[eventName][id]) return this;

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

	/**
	 * Attach an event listener to the passed event only if the passed
	 * id matches the document id for the event being fired.
	 * @param {String} eventName The name of the event to listen for.
	 * @param {*} id The id to match against.
	 * @param {Function} listener The method to call when the event is fired.
	 * @returns {Emitter} The emitter instance.
	 */
	on (eventName: string, id: string, listener: EventListenerCallback): this;
	on (eventName: string, listener: EventListenerCallback): this;
	on (eventName: string, ...rest: any[]): this {
		const restTypes = rest.map((arg) => typeof arg);

		if (restTypes[0] === "function") {
			return this._on(eventName, "*", rest[0]);
		}

		return this._on(eventName, rest[0], rest[1]);
	}

	/**
	 * Attach an event listener to the passed event only if the passed
	 * id matches the document id for the event being fired.
	 * @param {String} eventName The name of the event to listen for.
	 * @param id The id to match against.
	 * @param listener
	 * @returns {Emitter} The emitter instance.
	 */
	once (eventName: string, id: string, listener: EventListenerCallback): this;
	once (eventName: string, listener: EventListenerCallback): this;
	once (eventName: string, ...rest: any[]): this {
		const restTypes = rest.map((arg) => typeof arg);

		if (restTypes[0] === "function") {
			return this._once(eventName, "*", rest[0]);
		}

		return this._once(eventName, rest[0], rest[1]);
	}

	/**
	 * Overwrites any previous event listeners so that if the event fires, only
	 * the listener you pass will be called. If you pass an id along with the
	 * listener, only listeners for the id will be overwritten. This is similar
	 * to calling `.off(eventName)` then `on(eventName, listener)` since
	 * `off(eventName)` will cancel any previous event listeners for the passed
	 * event name.
	 * @param {String} eventName The name of the event to listen for.
	 * @param {*} id The id to match against.
	 * @param {Function} listener The method to call when the event is fired.
	 * @returns {Emitter} The emitter instance.
	 */
	overwrite (eventName: string, id: string, listener: EventListenerCallback): this;
	overwrite (eventName: string, listener: EventListenerCallback): this;
	overwrite (eventName: string, ...rest: any[]) {
		const restTypes = rest.map((arg) => typeof arg);

		if (restTypes[0] === "function") {
			this.off(eventName);
			return this._on(eventName, "*", rest[0]);
		}

		this.off(eventName, rest[0]);
		return this._on(eventName, rest[0], rest[1]);
	}

	/**
	 * Cancels an event listener based on an event name, id and listener function.
	 * @param {String} eventName The event to cancel listener for.
	 * @param {String} id The ID of the event to cancel listening for.
	 * @param {Function} listener The event listener function used in the on()
	 * or once() call to cancel.
	 * @returns {Emitter} The emitter instance.
	 */
	off (eventName: string, id: string, listener?: EventListenerCallback): this;
	off (eventName: string, listener?: EventListenerCallback): this;
	off (eventName: string): this;
	off (eventName: string, ...rest: any[]) {
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
	 * @param {Object} eventName The name of the event to emit.
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
	async emit (eventName: string, ...data: any[]): Promise<EventReturnFlag> {
		if (!this._eventListeners) {
			return EventReturnFlag.none;
		}

		const id = "*";

		let returnFlag: EventReturnFlag = EventReturnFlag.none;
		this._eventsEmitting = true;

		if (this._eventListeners[eventName] && this._eventListeners[eventName][id]) {
			// Handle global emit
			const arr = this._eventListeners[eventName][id];

			const promiseArr = arr.map((tmpFunc) => {
				if (typeof tmpFunc !== "function") return;
				return tmpFunc(...data);
			});

			const result = (await Promise.all(promiseArr)).find((tmpResult) => tmpResult !== EventReturnFlag.none);

			if (result) {
				returnFlag = EventReturnFlag.cancel;
			}
		}

		this._eventsEmitting = false;
		this._processRemovalQueue();

		return returnFlag;
	}

	emitId (eventName: string, id: string, ...data: any[]): EventReturnFlag {
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
	 * @param {String} eventName The name of the event to emit.
	 * @param {...any} data Optional arguments to emit with the event.
	 * @returns {Emitter} The emitter instance.
	 * @private
	 */
	emitStatic (eventName: string, ...data: any[]) {
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
	 * @param {String} eventName The name of the event to emit.
	 * @param {String} id The id of the event to emit.
	 * @param {...any} data Optional arguments to emit with the event.
	 * @returns {Emitter} The emitter instance.
	 * @private
	 */
	emitStaticId (eventName: string, id: string, ...data: any[]) {
		if (!id) throw new Error("Missing id from emitId call!");

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
	 * @param {String} eventName The event to remove static emitter for.
	 * @returns {Emitter} The emitter instance.
	 * @private
	 */
	cancelStatic (eventName: string) {
		this._eventStaticEmitters = this._eventStaticEmitters || {};
		this._eventStaticEmitters[eventName] = [];

		return this;
	}

	/**
	 * Checks if an event has any event listeners or not.
	 * @param {String} eventName The name of the event to check for.
	 * @returns {boolean} True if one or more event listeners are registered for
	 * the event. False if none are found.
	 */
	willEmit (eventName: string) {
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
	 * @param {String} eventName The name of the event to check for.
	 * @param {String} id The event ID to check for.
	 * @returns {boolean} True if one or more event listeners are registered for
	 * the event. False if none are found.
	 */
	willEmitId (eventName: string, id: string) {
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
	 * @param {String} eventName The name of the event to emit.
	 * @param {...any} data Optional arguments to emit with the event.
	 * @returns {Emitter} The emitter instance.
	 */
	deferEmit (eventName: string, ...data: any[]) {
		if (!this._eventsAllowDefer) {
			// Check for an existing timeout
			this._eventsDeferTimeouts = this._eventsDeferTimeouts || {};

			if (this._eventsDeferTimeouts[eventName]) {
				clearTimeout(this._eventsDeferTimeouts[eventName]);
			}

			// Set a timeout
			this._eventsDeferTimeouts[eventName] = setTimeout(() => {
				this.emit.call(this, eventName, ...data);
			}, 1) as unknown as number;
		} else {
			this.emit.call(this, eventName, ...data);
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
	_processRemovalQueue () {
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

export function makeEmitter(obj: new (...args: any[]) => any, prototypeMode: boolean): Emitter;
export function makeEmitter(obj: boolean): Emitter;
export function makeEmitter(obj: Record<string, unknown>, prototypeMode: boolean): Emitter;
export function makeEmitter (obj: any, prototypeMode?: any) {
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
	} else {
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