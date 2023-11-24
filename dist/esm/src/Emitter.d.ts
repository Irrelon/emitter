export type AnyFunction<ReturnType = any> = (...args: any[]) => ReturnType;
export type AnyConstructor = new (...args: any[]) => any;
export declare enum EventReturnFlag {
    none = 0,
    cancel = 1
}
export type EventListenerCallback<EventCallbackFunctionSignature extends AnyFunction = AnyFunction> = (...args: Parameters<EventCallbackFunctionSignature>) => ReturnType<EventCallbackFunctionSignature>;
export interface EventStaticEmitterObject<EventCallbackFunctionSignature extends AnyFunction = AnyFunction> {
    id: string;
    args: Parameters<EventCallbackFunctionSignature>;
}
export interface EmitterEventsInterface {
    [key: string]: AnyFunction;
}
export type ConvertInterfaceToDict<T> = {
    [K in keyof T]: T[K];
};
/**
 * Creates a new class with the capability to emit events.
 */
export declare class Emitter<EventsInterface extends EmitterEventsInterface = EmitterEventsInterface> {
    _eventsEmitting: boolean;
    _eventRemovalQueue: any[];
    _eventListeners?: {
        [EventName in (keyof EventsInterface)]?: Record<string, EventListenerCallback<EventsInterface[EventName]>[]>;
    };
    _eventStaticEmitters: {
        [EventName in (keyof EventsInterface)]?: EventStaticEmitterObject<EventsInterface[EventName]>[];
    };
    _eventsAllowDefer: boolean;
    _eventsDeferTimeouts: Record<any, number>;
    /**
     * Attach an event listener to the passed event only if the passed
     * id matches the id for the event being fired.
     * @param eventName The name of the event to listen for.
     * @param id The id to match against.
     * @param listener The method to call when the event is fired.
     * @returns The emitter instance.
     */
    _on<EventName extends keyof EventsInterface>(eventName: EventName, id: string, listener: EventListenerCallback<EventsInterface[EventName]>): this;
    /**
     * Attach an event listener to the passed event only if the passed
     * id matches the document id for the event being fired.
     * @param eventName The name of the event to listen for.
     * @param id The id to match against.
     * @param listener The method to call when the event is fired.
     * @returns The emitter instance.
     */
    _once<EventName extends keyof EventsInterface>(eventName: EventName, id: string, listener: EventListenerCallback<EventsInterface[EventName]>): this;
    /**
     * Cancels an event listener based on an event name, id and listener function.
     * @param eventName The event to cancel listener for.
     * @param id The ID of the event to cancel listening for.
     * @param listener The event listener function used in the on()
     * or once() call to cancel.
     * @returns The emitter instance.
     */
    _off<EventName extends keyof EventsInterface>(eventName: EventName, id: string, listener?: EventListenerCallback<EventsInterface[EventName]>): this;
    /**
     * Attach an event listener to the passed event only if the passed
     * id matches the document id for the event being fired.
     * @param eventName The name of the event to listen for.
     * @param id The id to match against.
     * @param listener The method to call when the event is fired.
     * @returns The emitter instance.
     */
    on<EventName extends keyof EventsInterface>(eventName: EventName, id: string, listener: EventListenerCallback<EventsInterface[EventName]>): this;
    on<EventName extends keyof EventsInterface>(eventName: EventName, listener: EventListenerCallback<EventsInterface[EventName]>): this;
    /**
     * Attach an event listener to the passed event only if the passed
     * id matches the document id for the event being fired.
     * @param eventName The name of the event to listen for.
     * @param id The id to match against.
     * @param listener
     * @returns The emitter instance.
     */
    once<EventName extends keyof EventsInterface>(eventName: EventName, id: string, listener: EventListenerCallback<EventsInterface[EventName]>): this;
    once<EventName extends keyof EventsInterface>(eventName: EventName, listener: EventListenerCallback<EventsInterface[EventName]>): this;
    /**
     * Overwrites any previous event listeners so that if the event fires, only
     * the listener you pass will be called. If you pass an id along with the
     * listener, only listeners for the id will be overwritten. This is similar
     * to calling `.off(eventName)` then `on(eventName, listener)` since
     * `off(eventName)` will cancel any previous event listeners for the passed
     * event name.
     * @param eventName The name of the event to listen for.
     * @param id The id to match against.
     * @param listener The method to call when the event is fired.
     * @returns The emitter instance.
     */
    overwrite<EventName extends keyof EventsInterface>(eventName: EventName, id: string, listener: EventListenerCallback<EventsInterface[EventName]>): this;
    overwrite<EventName extends keyof EventsInterface>(eventName: EventName, listener: EventListenerCallback<EventsInterface[EventName]>): this;
    /**
     * Cancels an event listener based on an event name, id and listener function.
     * @param eventName The event to cancel listener for.
     * @param id The ID of the event to cancel listening for.
     * @param listener The event listener function used in the on()
     * or once() call to cancel.
     * @returns The emitter instance.
     */
    off<EventName extends keyof EventsInterface>(eventName: EventName, id: string, listener?: EventListenerCallback<EventsInterface[EventName]>): this;
    off<EventName extends keyof EventsInterface>(eventName: EventName, listener?: EventListenerCallback<EventsInterface[EventName]>): this;
    off<EventName extends keyof EventsInterface>(eventName: EventName): this;
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
    emit<EventName extends keyof EventsInterface>(eventName: EventName, ...data: Parameters<EventsInterface[EventName]>): Promise<EventReturnFlag>;
    emitId<EventName extends keyof EventsInterface>(eventName: EventName, id: string, ...data: Parameters<EventsInterface[EventName]>): EventReturnFlag;
    /**
     * Creates a persistent emitter record that will fire a listener if
     * one is added for this event after the emitStatic() call has been
     * made.
     * @param eventName The name of the event to emit.
     * @param {...any} data Optional arguments to emit with the event.
     * @returns The emitter instance.
     * @private
     */
    emitStatic<EventName extends keyof EventsInterface>(eventName: EventName, ...data: Parameters<EventsInterface[EventName]>): this;
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
    emitStaticId<EventName extends keyof EventsInterface>(eventName: EventName, id: string, ...data: Parameters<EventsInterface[EventName]>): this;
    /**
     * Handles removing emitters, is an internal method not called directly.
     * @param eventName The event to remove static emitter for.
     * @returns The emitter instance.
     * @private
     */
    cancelStatic<EventName extends keyof EventsInterface>(eventName: EventName): this;
    /**
     * Checks if an event has any event listeners or not.
     * @param eventName The name of the event to check for.
     * @returns True if one or more event listeners are registered for
     * the event. False if none are found.
     */
    willEmit<EventName extends keyof EventsInterface>(eventName: EventName): boolean;
    /**
     * Checks if an event has any event listeners or not based on the passed id.
     * @param eventName The name of the event to check for.
     * @param id The event ID to check for.
     * @returns True if one or more event listeners are registered for
     * the event. False if none are found.
     */
    willEmitId<EventName extends keyof EventsInterface>(eventName: EventName, id: string): boolean;
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
    deferEmit<EventName extends keyof EventsInterface>(eventName: EventName, ...data: Parameters<EventsInterface[EventName]>): this;
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
export declare function makeEmitter(obj: AnyConstructor, prototypeMode: boolean): Emitter;
export declare function makeEmitter(obj: boolean): Emitter;
export declare function makeEmitter(obj: Record<string, unknown>, prototypeMode: boolean): Emitter;
