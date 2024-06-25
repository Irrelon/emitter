import { jest } from "@jest/globals";
import assert from "assert";
import { Emitter, ListenerReturnFlag } from "../src/Emitter";
let expectedAssertions = 0;
let actualAssertions = 0;
function expectAssertionCount(val) {
    expectedAssertions = val;
}
function resetAssertionCount() {
    expectedAssertions = 0;
    actualAssertions = 0;
}
function countAssertion() {
    actualAssertions++;
}
function checkAssertionCount() {
    if (expectedAssertions === undefined || expectedAssertions === actualAssertions) {
        return;
    }
    throw new Error("expected " + expectedAssertions + " assertions, got " + actualAssertions);
}
beforeEach(resetAssertionCount);
afterEach(checkAssertionCount);
describe("Emitter", () => {
    describe("new Emitter()", () => {
        it("Creates emitter instance by instantiation", () => {
            const myClass = new Emitter();
            myClass.on("moo", () => { });
            assert.strictEqual(myClass._eventListeners?.moo["*"].length, 1, "Listener registered on event");
            myClass.off("moo");
            assert.strictEqual(!myClass._eventListeners?.moo ||
                !myClass._eventListeners.moo["*"] ||
                myClass._eventListeners.moo["*"].length, true, "Listeners all removed from event");
        });
        it("Supports extending Emitter as a base class", () => {
            // Test extending Emitter and modifying base functionality
            class MyClass extends Emitter {
                on(eventName, ...rest) {
                    const restTypes = rest.map((arg) => typeof arg);
                    if (restTypes[0] === "function") {
                        const listener = restTypes[0];
                        const id = "^^noId";
                        return super.on(eventName, id, listener);
                    }
                    return super.on(eventName, rest[0], rest[1]);
                }
                // @ts-ignore
                emit(eventName, ...rest) {
                    return super.emitId(eventName, "^^noId", ...rest);
                }
                off(eventName, ...rest) {
                    let id = rest[0];
                    let func = rest[1];
                    if (typeof rest[0] === "function") {
                        func = rest[0];
                        id = "^^noId";
                    }
                    else if (typeof id === "undefined") {
                        id = "^^noId";
                    }
                    return super.off(eventName, id, func);
                }
            }
            const myClass = new MyClass();
            let emitCount = 0;
            // Register id-based listener
            myClass.on("moo", "testId", () => {
                emitCount++;
            });
            // Register non-id-based listener
            myClass.on("moo", () => {
                emitCount++;
            });
            assert.strictEqual(myClass._eventListeners?.moo["testId"].length, 1, "Listener registered on event");
            myClass.emitId("moo", "testId", "foo");
            assert.strictEqual(emitCount, 1, "Event fired correctly");
            myClass.off("moo", "testId");
            assert.strictEqual(!myClass._eventListeners?.moo ||
                !myClass._eventListeners?.moo["testId"] ||
                myClass._eventListeners?.moo["testId"].length === 0, true, "Listeners all removed from event");
            assert.strictEqual(myClass._eventListeners?.moo &&
                myClass._eventListeners?.moo["^^noId"] &&
                myClass._eventListeners?.moo["^^noId"].length === 1, true, "Global listener still there");
            assert.strictEqual(!myClass._eventListeners?.moo ||
                !myClass._eventListeners?.moo["*"] ||
                myClass._eventListeners?.moo["*"].length === 0, true, "Global listener still there");
            myClass.off("moo");
            assert.strictEqual(!myClass._eventListeners?.moo ||
                !myClass._eventListeners?.moo["*"] ||
                myClass._eventListeners?.moo["*"].length === 0, true, "Listeners all removed from event");
        });
    });
    describe("emit()", () => {
        it("Supports type safe usage", async () => {
            const emitter = new Emitter();
            let listenerFiredCount = 0;
            emitter.on("person", (name) => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        listenerFiredCount++;
                        resolve(name);
                    }, 1000);
                });
            });
            emitter.on("post", () => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        listenerFiredCount++;
                        resolve();
                    }, 1000);
                });
            });
            emitter.on("post", () => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        listenerFiredCount++;
                        resolve();
                    }, 1000);
                });
            });
            const time = new Date().getTime();
            await Promise.all(emitter.emit("post"));
            const delta = new Date().getTime() - time;
            assert.ok(delta > 900, `Delta was not correct, await may not have paused? Delta was: ${delta}`);
            assert.ok(listenerFiredCount === 2, `listenerFiredCount was not correct, await may not have paused? listenerFiredCount was: ${listenerFiredCount}`);
        });
        it("Supports awaiting async listeners", async () => {
            const emitter = new Emitter();
            let listenerFiredCount = 0;
            emitter.on("foo", async () => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        listenerFiredCount++;
                        resolve();
                    }, 1000);
                });
            });
            emitter.on("foo", async () => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        listenerFiredCount++;
                        resolve();
                    }, 1000);
                });
            });
            const time = new Date().getTime();
            await Promise.all(emitter.emit("foo"));
            const delta = new Date().getTime() - time;
            assert.ok(delta > 900, "Delta was not correct, await may not have paused?");
            assert.strictEqual(listenerFiredCount, 2, "Listener fire count was incorect");
        });
        it("Supports awaiting async and non-async listener return data", async () => {
            const emitter = new Emitter();
            let listenerFiredCount = 0;
            emitter.on("foo", () => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        listenerFiredCount++;
                        resolve("Foo1 Return Value");
                    }, 1000);
                });
            });
            emitter.on("foo", () => {
                return "Foo2 Return Value";
            });
            const time = new Date().getTime();
            const results = await Promise.all(emitter.emit("foo"));
            const delta = new Date().getTime() - time;
            assert.ok(delta > 900, "Delta was not correct, await may not have paused?");
            assert.ok(listenerFiredCount === 1, "listenerFiredCount was not correct, await may not have been used?");
            assert.strictEqual(results[0], "Foo1 Return Value", "Return data for foo1 was not correct");
            assert.strictEqual(results[1], "Foo2 Return Value", "Return data for foo2 was not correct");
        });
        it("Supports awaiting async and non-async rpc listener return data", async () => {
            const emitter = new Emitter();
            let listenerFiredCount = 0;
            emitter.on("foo1", () => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        listenerFiredCount++;
                        resolve("Foo1 Return Value");
                    }, 1000);
                });
            });
            emitter.on("foo2", () => {
                return "Foo2 Return Value";
            });
            const time = new Date().getTime();
            const result1 = await emitter.rpc("foo1");
            const result2 = emitter.rpc("foo2");
            const delta = new Date().getTime() - time;
            assert.ok(delta > 900, "Delta was not correct, await may not have paused?");
            assert.ok(listenerFiredCount === 1, "listenerFiredCount was not correct, await may not have been used?");
            assert.strictEqual(result1, "Foo1 Return Value", "Return data for foo1 was not correct");
            assert.strictEqual(result2, "Foo2 Return Value", "Return data for foo2 was not correct");
        });
        it("Supports responding with a cancellation signal", async () => {
            const emitter = new Emitter();
            let listenerFiredCount = 0;
            emitter.on("foo", () => {
                listenerFiredCount++;
                return "Foo1 Return Value";
            });
            emitter.on("foo", () => {
                listenerFiredCount++;
                // This listener will respond with a cancellation, this should terminate further listener calls
                return ListenerReturnFlag.cancel;
            });
            emitter.on("foo", () => {
                listenerFiredCount++;
                return "Foo3 Return Value";
            });
            emitter.on("foo", () => {
                listenerFiredCount++;
                return "Foo4 Return Value";
            });
            const results = emitter.emit("foo");
            assert.ok(listenerFiredCount === 2, "listenerFiredCount was not correct, await may not have been used?");
            assert.strictEqual(results[0], "Foo1 Return Value", "Return data should be a cancel flag");
            assert.strictEqual(results[1], ListenerReturnFlag.cancel, "Return data should be a cancel flag");
            assert.ok(emitter.didCancel(results), "didCancel should detect a cancel flag");
        });
    });
    describe("off()", () => {
        it("Cancels all listeners (event)", () => {
            const myClass = new Emitter();
            const listener1 = () => { };
            const listener2 = () => { };
            myClass.on("moo", () => { });
            assert.strictEqual(myClass._eventListeners?.moo["*"].length, 1, "Listeners registered on event");
            myClass.on("moo", "testId", () => { });
            assert.strictEqual(myClass._eventListeners?.moo["testId"].length, 1, "Listeners registered on event");
            myClass.on("moo", listener1);
            assert.strictEqual(myClass._eventListeners?.moo["*"].length, 2, "Listeners registered on event");
            myClass.on("moo", "testId", listener2);
            assert.strictEqual(myClass._eventListeners?.moo["testId"].length, 2, "Listeners registered on event");
            myClass.off("moo");
            assert.strictEqual(!myClass._eventListeners?.moo ||
                (myClass._eventListeners?.moo["*"].length === 0 &&
                    myClass._eventListeners?.moo["testId"].length === 0), true, "Listeners all removed from event");
        });
        it("Cancels id-based listeners (event, id)", () => {
            const myClass = new Emitter();
            const listener1 = () => { };
            const listener2 = () => { };
            myClass.on("moo", () => { });
            assert.strictEqual(myClass._eventListeners?.moo["*"].length, 1, "Listeners registered on event");
            myClass.on("moo", "testId", () => { });
            assert.strictEqual(myClass._eventListeners?.moo["testId"].length, 1, "Listeners registered on event");
            myClass.on("moo", listener1);
            assert.strictEqual(myClass._eventListeners?.moo["*"].length, 2, "Listeners registered on event");
            myClass.on("moo", "testId", listener2);
            assert.strictEqual(myClass._eventListeners?.moo["testId"].length, 2, "Listeners registered on event");
            myClass.off("moo", "testId");
            assert.strictEqual(myClass._eventListeners?.moo["*"].length === 2, true, "Listeners all removed from event");
            assert.strictEqual(!myClass._eventListeners?.moo["testId"] || myClass._eventListeners?.moo["testId"].length === 0, true, "Listeners all removed from event");
        });
        it("Cancels listener-based listeners (event, listener)", () => {
            const myClass = new Emitter();
            const listener1 = () => { };
            const listener2 = () => { };
            myClass.on("moo", () => { });
            assert.strictEqual(myClass._eventListeners?.moo["*"].length, 1, "Listeners registered on event");
            myClass.on("moo", "testId", () => { });
            assert.strictEqual(myClass._eventListeners?.moo["testId"].length, 1, "Listeners registered on event");
            myClass.on("moo", listener1);
            assert.strictEqual(myClass._eventListeners?.moo["*"].length, 2, "Listeners registered on event");
            myClass.on("moo", "testId", listener2);
            assert.strictEqual(myClass._eventListeners?.moo["testId"].length, 2, "Listeners registered on event");
            myClass.off("moo", listener1);
            assert.strictEqual(myClass._eventListeners?.moo["*"].length === 1, true, "Listeners all removed from event");
            assert.strictEqual(myClass._eventListeners?.moo["testId"].length === 2, true, "Listeners all removed from event");
        });
        it("Cancels id-based + listener-based listeners (event, id, listener)", () => {
            const myClass = new Emitter();
            const listener1 = () => { };
            const listener2 = () => { };
            myClass.on("moo", () => { });
            assert.strictEqual(myClass._eventListeners?.moo["*"].length, 1, "Listeners registered on event");
            myClass.on("moo", "testId", () => { });
            assert.strictEqual(myClass._eventListeners?.moo["testId"].length, 1, "Listeners registered on event");
            myClass.on("moo", listener1);
            assert.strictEqual(myClass._eventListeners?.moo["*"].length, 2, "Listeners registered on event");
            myClass.on("moo", "testId", listener2);
            assert.strictEqual(myClass._eventListeners?.moo["testId"].length, 2, "Listeners registered on event");
            myClass.off("moo", "testId", listener2);
            assert.strictEqual(myClass._eventListeners?.moo["*"].length === 2, true, "Listeners all removed from event");
            assert.strictEqual(myClass._eventListeners?.moo["testId"].length === 1, true, "Listeners all removed from event");
        });
    });
    describe("emitStatic()", () => {
        it("Static emitter will emit when a new listener is added", (resolve) => {
            class MyClass extends Emitter {
            }
            expectAssertionCount(1);
            const myClass = new MyClass();
            myClass.emitStatic("moo");
            myClass.on("moo", () => {
                countAssertion();
                assert.ok(true, "Callback was fired");
                resolve();
            });
        });
    });
    describe("cancelStatic()", () => {
        it("Removes static emitter", (resolve) => {
            class MyClass extends Emitter {
            }
            expectAssertionCount(1);
            const myClass = new MyClass();
            myClass.emitStatic("moo");
            myClass.on("moo", () => {
                countAssertion();
                assert.ok(true, "Callback was fired");
            });
            myClass.cancelStatic("moo");
            myClass.on("moo", () => {
                countAssertion();
                assert.ok(false, "Callback was fired");
            });
            setTimeout(() => {
                resolve();
            }, 10);
        });
    });
    describe("overwrite()", () => {
        it("Only fires the last listener added, cancelling all other listeners before it", (resolve) => {
            class MyClass extends Emitter {
            }
            expectAssertionCount(1);
            const myClass = new MyClass();
            myClass.on("moo", () => {
                countAssertion();
                assert.ok(false, "Correct callback was fired");
            });
            myClass.on("moo", () => {
                countAssertion();
                assert.ok(false, "Correct callback was fired");
            });
            myClass.overwrite("moo", () => {
                countAssertion();
                assert.ok(true, "Correct callback was fired");
            });
            myClass.emit("moo");
            setTimeout(() => {
                resolve();
            }, 10);
        });
        it("Only fires the last listener added (with id), cancelling all other listeners before it", (resolve) => {
            class MyClass extends Emitter {
            }
            expectAssertionCount(2);
            const myClass = new MyClass();
            // Define a listener without an id, this should not be overwritten
            myClass.on("moo", () => {
                countAssertion();
                assert.ok(true, "Correct callback was fired");
            });
            // Define some listeners WITH ids, these should be overwritten
            myClass.on("moo", "1234", () => {
                countAssertion();
                assert.ok(false, "Correct callback was fired");
            });
            myClass.on("moo", "1234", () => {
                countAssertion();
                assert.ok(false, "Correct callback was fired");
            });
            // Overwrite the id listeners
            myClass.overwrite("moo", "1234", () => {
                countAssertion();
                assert.ok(true, "Correct callback was fired");
            });
            myClass.emitId("moo", "1234");
            setTimeout(() => {
                resolve();
            }, 50);
        });
    });
    describe("emitId()", () => {
        it("Fires an id-based event first followed by a global event", () => {
            const myClass = new Emitter();
            let emitCount = 0;
            // Register id-based listener
            myClass.on("moo", "testId", () => {
                emitCount++;
            });
            // Register non-id-based listener
            myClass.on("moo", () => {
                emitCount++;
            });
            assert.strictEqual(myClass._eventListeners?.moo["testId"].length, 1, "Listener registered on event");
            myClass.emitId("moo", "testId", "foo");
            assert.strictEqual(emitCount, 2, "Event fired correctly");
            myClass.off("moo", "testId");
            assert.strictEqual(!myClass._eventListeners?.moo ||
                !myClass._eventListeners?.moo["testId"] ||
                myClass._eventListeners?.moo["testId"].length, true, "Listeners all removed from event");
            assert.strictEqual(myClass._eventListeners?.moo &&
                myClass._eventListeners?.moo["*"] &&
                myClass._eventListeners?.moo["*"].length === 1, true, "Global listener still there");
            myClass.off("moo");
            assert.strictEqual(!myClass._eventListeners?.moo ||
                !myClass._eventListeners?.moo["*"] ||
                myClass._eventListeners?.moo["*"].length === 0, true, "Listeners all removed from event");
        });
    });
    describe("Global listener functionality", () => {
        it("Listens for any event emitted and fires the listener with the onAny() function", () => {
            const emitter = new Emitter();
            const spy = jest.fn();
            emitter.onAny(spy);
            emitter.emit("someEvent", "someArg1", true, false);
            expect(spy).toHaveBeenCalledWith("someEvent", "someArg1", true, false);
        });
        it(`Listens for any event emitted and fires the listener with the on("*") function`, () => {
            const emitter = new Emitter();
            const spy = jest.fn();
            emitter.on("*", spy);
            emitter.emit("someEvent", "someArg1", true, false);
            expect(spy).toHaveBeenCalledWith("someEvent", "someArg1", true, false);
        });
        it(`Cancels an event listener for any event emitted with the offAny() function`, () => {
            const emitter = new Emitter();
            const spy = jest.fn();
            emitter.on("*", spy);
            emitter.offAny(spy);
            emitter.emit("someEvent", "someArg1", true, false);
            expect(spy).toHaveBeenCalledTimes(0);
        });
        it(`Cancels an event listener for any event emitted with the off("*") function`, () => {
            const emitter = new Emitter();
            const spy = jest.fn();
            emitter.on("*", spy);
            emitter.off("*", spy);
            emitter.emit("someEvent", "someArg1", true, false);
            expect(spy).toHaveBeenCalledTimes(0);
        });
    });
});
