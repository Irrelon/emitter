declare const EventMainMethods: {
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
    _on(event: any, id: any, listener: any): any;
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
    _once(event: any, id: any, listener: any): any;
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
    _off(event: any, id: any, listener: any): any | undefined;
};
/**
 * @class Emitter
 * @constructor
 */
declare class Emitter {
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
    on(event: any, ...rest: any[]): {
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
        _on(event: any, id: any, listener: any): any;
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
        _once(event: any, id: any, listener: any): any;
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
        _off(event: any, id: any, listener: any): any | undefined;
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
    once(event: any, ...rest: any[]): any;
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
    one(event: any, ...rest: any[]): {
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
        _on(event: any, id: any, listener: any): any;
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
        _once(event: any, id: any, listener: any): any;
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
        _off(event: any, id: any, listener: any): any | undefined;
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
    off(event: any, ...rest: any[]): {
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
        _on(event: any, id: any, listener: any): any;
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
        _once(event: any, id: any, listener: any): any;
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
        _off(event: any, id: any, listener: any): any | undefined;
    } | undefined;
    /**
     * Handles emitting events, is an internal method not called directly.
     * @param {String} event The name of the event to emit.
     * @param {*} data The data to emit with the event.
     * @returns {Emitter} The emitter instance.
     * @private
     */
    emit(event: any, ...data: any[]): this;
    emitId(event: any, id: any, ...data: any[]): this;
    /**
     * Handles emitting events, is an internal method not called directly.
     * @param {String} event The name of the event to emit.
     * @param {*} data The data to emit with the event.
     * @returns {Emitter} The emitter instance.
     * @private
     */
    emitStatic(event: any, ...data: any[]): this;
    /**
     * Handles emitting events, is an internal method not called directly.
     * @param {String} event The name of the event to emit.
     * @param {String} id The id of the event to emit.
     * @param {*} data The data to emit with the event.
     * @returns {Emitter} The emitter instance.
     * @private
     */
    emitStaticId(event: any, id: any, ...data: any[]): this;
    /**
     * Handles removing emitters, is an internal method not called directly.
     * @param {String} event The event to remove static emitter for.
     * @returns {Emitter} The emitter instance.
     * @private
     */
    cancelStatic(event: any): this;
    /**
     * Checks if an event has any event listeners or not.
     * @memberOf Emitter
     * @method willEmit
     * @param {String} event The name of the event to check for.
     * @returns {boolean} True if one or more event listeners are registered for
     * the event. False if none are found.
     */
    willEmit(event: any): boolean;
    /**
     * Checks if an event has any event listeners or not based on the passed id.
     * @memberOf Emitter
     * @method willEmitId
     * @param {String} event The name of the event to check for.
     * @param {String} id The event ID to check for.
     * @returns {boolean} True if one or more event listeners are registered for
     * the event. False if none are found.
     */
    willEmitId(event: any, id: any): boolean;
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
    deferEmit(eventName: any, ...data: any[]): this;
    /**
     * If events are cleared with the off() method while the event emitter is
     * actively processing any events then the off() calls get added to a
     * queue to be executed after the event emitter is finished. This stops
     * errors that might occur by potentially modifying the event queue while
     * the emitter is running through them. This method is called after the
     * event emitter is finished processing.
     * @private
     */
    _processRemovalQueue(): void;
}
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
declare const makeEmitter: (obj: any, prototypeMode: any) => any;
