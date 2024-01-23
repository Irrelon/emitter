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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const Emitter_1 = require("../src/Emitter");
let expectedAssertions = 0;
let actualAssertions = 0;
function expect(val) {
    expectedAssertions = val;
}
function reset() {
    expectedAssertions = 0;
    actualAssertions = 0;
}
function countAssertion() {
    actualAssertions++;
}
function check() {
    if (expectedAssertions === undefined || expectedAssertions === actualAssertions) {
        return;
    }
    throw new Error("expected " + expectedAssertions + " assertions, got " + actualAssertions);
}
beforeEach(reset);
afterEach(check);
describe("Emitter", () => {
    describe("new Emitter()", () => {
        it("Creates emitter instance by instantiation", () => {
            var _a, _b;
            const myClass = new Emitter_1.Emitter();
            myClass.on("moo", () => { });
            assert_1.default.strictEqual((_a = myClass._eventListeners) === null || _a === void 0 ? void 0 : _a.moo["*"].length, 1, "Listener registered on event");
            myClass.off("moo");
            assert_1.default.strictEqual(!((_b = myClass._eventListeners) === null || _b === void 0 ? void 0 : _b.moo) ||
                !myClass._eventListeners.moo["*"] ||
                myClass._eventListeners.moo["*"].length, true, "Listeners all removed from event");
        });
        it("Supports extending Emitter as a base class", () => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            let testFuncCount = 0;
            // Test extending Emitter and modifying base functionality
            class MyClass extends Emitter_1.Emitter {
                testFunc() {
                    testFuncCount++;
                }
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
            assert_1.default.strictEqual((_a = myClass._eventListeners) === null || _a === void 0 ? void 0 : _a.moo["testId"].length, 1, "Listener registered on event");
            myClass.emitId("moo", "testId", "foo");
            assert_1.default.strictEqual(emitCount, 1, "Event fired correctly");
            myClass.off("moo", "testId");
            assert_1.default.strictEqual(!((_b = myClass._eventListeners) === null || _b === void 0 ? void 0 : _b.moo) ||
                !((_c = myClass._eventListeners) === null || _c === void 0 ? void 0 : _c.moo["testId"]) ||
                ((_d = myClass._eventListeners) === null || _d === void 0 ? void 0 : _d.moo["testId"].length) === 0, true, "Listeners all removed from event");
            assert_1.default.strictEqual(((_e = myClass._eventListeners) === null || _e === void 0 ? void 0 : _e.moo) &&
                ((_f = myClass._eventListeners) === null || _f === void 0 ? void 0 : _f.moo["^^noId"]) &&
                ((_g = myClass._eventListeners) === null || _g === void 0 ? void 0 : _g.moo["^^noId"].length) === 1, true, "Global listener still there");
            assert_1.default.strictEqual(!((_h = myClass._eventListeners) === null || _h === void 0 ? void 0 : _h.moo) ||
                !((_j = myClass._eventListeners) === null || _j === void 0 ? void 0 : _j.moo["*"]) ||
                ((_k = myClass._eventListeners) === null || _k === void 0 ? void 0 : _k.moo["*"].length) === 0, true, "Global listener still there");
            myClass.off("moo");
            assert_1.default.strictEqual(!((_l = myClass._eventListeners) === null || _l === void 0 ? void 0 : _l.moo) ||
                !((_m = myClass._eventListeners) === null || _m === void 0 ? void 0 : _m.moo["*"]) ||
                ((_o = myClass._eventListeners) === null || _o === void 0 ? void 0 : _o.moo["*"].length) === 0, true, "Listeners all removed from event");
        });
    });
    describe("emit()", () => {
        it("Supports type safe usage", () => __awaiter(void 0, void 0, void 0, function* () {
            const emitter = new Emitter_1.Emitter();
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
            yield Promise.all(emitter.emit("post"));
            const delta = new Date().getTime() - time;
            assert_1.default.ok(delta > 900, `Delta was not correct, await may not have paused? Delta was: ${delta}`);
            assert_1.default.ok(listenerFiredCount === 2, `listenerFiredCount was not correct, await may not have paused? listenerFiredCount was: ${listenerFiredCount}`);
        }));
        it("Supports awaiting async listeners", () => __awaiter(void 0, void 0, void 0, function* () {
            const emitter = new Emitter_1.Emitter();
            let listenerFiredCount = 0;
            emitter.on("foo", () => __awaiter(void 0, void 0, void 0, function* () {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        listenerFiredCount++;
                        resolve();
                    }, 1000);
                });
            }));
            emitter.on("foo", () => __awaiter(void 0, void 0, void 0, function* () {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        listenerFiredCount++;
                        resolve();
                    }, 1000);
                });
            }));
            const time = new Date().getTime();
            yield Promise.all(emitter.emit("foo"));
            const delta = new Date().getTime() - time;
            assert_1.default.ok(delta > 900, "Delta was not correct, await may not have paused?");
        }));
        it("Supports awaiting async and non-async listener return data", () => __awaiter(void 0, void 0, void 0, function* () {
            const emitter = new Emitter_1.Emitter();
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
            const results = yield Promise.all(emitter.emit("foo"));
            const delta = new Date().getTime() - time;
            assert_1.default.ok(delta > 900, "Delta was not correct, await may not have paused?");
            assert_1.default.ok(listenerFiredCount === 1, "listenerFiredCount was not correct, await may not have been used?");
            assert_1.default.strictEqual(results[0], "Foo1 Return Value", "Return data for foo1 was not correct");
            assert_1.default.strictEqual(results[1], "Foo2 Return Value", "Return data for foo2 was not correct");
        }));
        it("Supports awaiting async and non-async rpc listener return data", () => __awaiter(void 0, void 0, void 0, function* () {
            const emitter = new Emitter_1.Emitter();
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
            const result1 = yield emitter.rpc("foo1");
            const result2 = emitter.rpc("foo2");
            const delta = new Date().getTime() - time;
            assert_1.default.ok(delta > 900, "Delta was not correct, await may not have paused?");
            assert_1.default.ok(listenerFiredCount === 1, "listenerFiredCount was not correct, await may not have been used?");
            assert_1.default.strictEqual(result1, "Foo1 Return Value", "Return data for foo1 was not correct");
            assert_1.default.strictEqual(result2, "Foo2 Return Value", "Return data for foo2 was not correct");
        }));
        it("Supports responding with a cancellation signal", () => __awaiter(void 0, void 0, void 0, function* () {
            const emitter = new Emitter_1.Emitter();
            let listenerFiredCount = 0;
            emitter.on("foo", () => {
                listenerFiredCount++;
                return "Foo1 Return Value";
            });
            emitter.on("foo", () => {
                listenerFiredCount++;
                // This listener will respond with a cancellation, this should terminate further listener calls
                return Emitter_1.ListenerReturnFlag.cancel;
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
            assert_1.default.ok(listenerFiredCount === 2, "listenerFiredCount was not correct, await may not have been used?");
            assert_1.default.strictEqual(results[0], "Foo1 Return Value", "Return data should be a cancel flag");
            assert_1.default.strictEqual(results[1], Emitter_1.ListenerReturnFlag.cancel, "Return data should be a cancel flag");
            assert_1.default.ok(emitter.didCancel(results), "didCancel should detect a cancel flag");
        }));
    });
    describe("off()", () => {
        it("Cancels all listeners (event)", () => {
            var _a, _b, _c, _d, _e, _f, _g;
            const myClass = new Emitter_1.Emitter();
            const listener1 = () => { };
            const listener2 = () => { };
            myClass.on("moo", () => { });
            assert_1.default.strictEqual((_a = myClass._eventListeners) === null || _a === void 0 ? void 0 : _a.moo["*"].length, 1, "Listeners registered on event");
            myClass.on("moo", "testId", () => { });
            assert_1.default.strictEqual((_b = myClass._eventListeners) === null || _b === void 0 ? void 0 : _b.moo["testId"].length, 1, "Listeners registered on event");
            myClass.on("moo", listener1);
            assert_1.default.strictEqual((_c = myClass._eventListeners) === null || _c === void 0 ? void 0 : _c.moo["*"].length, 2, "Listeners registered on event");
            myClass.on("moo", "testId", listener2);
            assert_1.default.strictEqual((_d = myClass._eventListeners) === null || _d === void 0 ? void 0 : _d.moo["testId"].length, 2, "Listeners registered on event");
            myClass.off("moo");
            assert_1.default.strictEqual(!((_e = myClass._eventListeners) === null || _e === void 0 ? void 0 : _e.moo) ||
                (((_f = myClass._eventListeners) === null || _f === void 0 ? void 0 : _f.moo["*"].length) === 0 &&
                    ((_g = myClass._eventListeners) === null || _g === void 0 ? void 0 : _g.moo["testId"].length) === 0), true, "Listeners all removed from event");
        });
        it("Cancels id-based listeners (event, id)", () => {
            var _a, _b, _c, _d, _e, _f, _g;
            const myClass = new Emitter_1.Emitter();
            const listener1 = () => { };
            const listener2 = () => { };
            myClass.on("moo", () => { });
            assert_1.default.strictEqual((_a = myClass._eventListeners) === null || _a === void 0 ? void 0 : _a.moo["*"].length, 1, "Listeners registered on event");
            myClass.on("moo", "testId", () => { });
            assert_1.default.strictEqual((_b = myClass._eventListeners) === null || _b === void 0 ? void 0 : _b.moo["testId"].length, 1, "Listeners registered on event");
            myClass.on("moo", listener1);
            assert_1.default.strictEqual((_c = myClass._eventListeners) === null || _c === void 0 ? void 0 : _c.moo["*"].length, 2, "Listeners registered on event");
            myClass.on("moo", "testId", listener2);
            assert_1.default.strictEqual((_d = myClass._eventListeners) === null || _d === void 0 ? void 0 : _d.moo["testId"].length, 2, "Listeners registered on event");
            myClass.off("moo", "testId");
            assert_1.default.strictEqual(((_e = myClass._eventListeners) === null || _e === void 0 ? void 0 : _e.moo["*"].length) === 2, true, "Listeners all removed from event");
            assert_1.default.strictEqual(!((_f = myClass._eventListeners) === null || _f === void 0 ? void 0 : _f.moo["testId"]) || ((_g = myClass._eventListeners) === null || _g === void 0 ? void 0 : _g.moo["testId"].length) === 0, true, "Listeners all removed from event");
        });
        it("Cancels listener-based listeners (event, listener)", () => {
            var _a, _b, _c, _d, _e, _f;
            const myClass = new Emitter_1.Emitter();
            const listener1 = () => { };
            const listener2 = () => { };
            myClass.on("moo", () => { });
            assert_1.default.strictEqual((_a = myClass._eventListeners) === null || _a === void 0 ? void 0 : _a.moo["*"].length, 1, "Listeners registered on event");
            myClass.on("moo", "testId", () => { });
            assert_1.default.strictEqual((_b = myClass._eventListeners) === null || _b === void 0 ? void 0 : _b.moo["testId"].length, 1, "Listeners registered on event");
            myClass.on("moo", listener1);
            assert_1.default.strictEqual((_c = myClass._eventListeners) === null || _c === void 0 ? void 0 : _c.moo["*"].length, 2, "Listeners registered on event");
            myClass.on("moo", "testId", listener2);
            assert_1.default.strictEqual((_d = myClass._eventListeners) === null || _d === void 0 ? void 0 : _d.moo["testId"].length, 2, "Listeners registered on event");
            myClass.off("moo", listener1);
            assert_1.default.strictEqual(((_e = myClass._eventListeners) === null || _e === void 0 ? void 0 : _e.moo["*"].length) === 1, true, "Listeners all removed from event");
            assert_1.default.strictEqual(((_f = myClass._eventListeners) === null || _f === void 0 ? void 0 : _f.moo["testId"].length) === 2, true, "Listeners all removed from event");
        });
        it("Cancels id-based + listener-based listeners (event, id, listener)", () => {
            var _a, _b, _c, _d, _e, _f;
            const myClass = new Emitter_1.Emitter();
            const listener1 = () => { };
            const listener2 = () => { };
            myClass.on("moo", () => { });
            assert_1.default.strictEqual((_a = myClass._eventListeners) === null || _a === void 0 ? void 0 : _a.moo["*"].length, 1, "Listeners registered on event");
            myClass.on("moo", "testId", () => { });
            assert_1.default.strictEqual((_b = myClass._eventListeners) === null || _b === void 0 ? void 0 : _b.moo["testId"].length, 1, "Listeners registered on event");
            myClass.on("moo", listener1);
            assert_1.default.strictEqual((_c = myClass._eventListeners) === null || _c === void 0 ? void 0 : _c.moo["*"].length, 2, "Listeners registered on event");
            myClass.on("moo", "testId", listener2);
            assert_1.default.strictEqual((_d = myClass._eventListeners) === null || _d === void 0 ? void 0 : _d.moo["testId"].length, 2, "Listeners registered on event");
            myClass.off("moo", "testId", listener2);
            assert_1.default.strictEqual(((_e = myClass._eventListeners) === null || _e === void 0 ? void 0 : _e.moo["*"].length) === 2, true, "Listeners all removed from event");
            assert_1.default.strictEqual(((_f = myClass._eventListeners) === null || _f === void 0 ? void 0 : _f.moo["testId"].length) === 1, true, "Listeners all removed from event");
        });
    });
    describe("emitStatic()", () => {
        it("Static emitter will emit when a new listener is added", (resolve) => {
            class MyClass extends Emitter_1.Emitter {
            }
            expect(1);
            const myClass = new MyClass();
            myClass.emitStatic("moo");
            myClass.on("moo", () => {
                countAssertion();
                assert_1.default.ok(true, "Callback was fired");
                resolve();
            });
        });
    });
    describe("cancelStatic()", () => {
        it("Removes static emitter", (resolve) => {
            class MyClass extends Emitter_1.Emitter {
            }
            expect(1);
            const myClass = new MyClass();
            myClass.emitStatic("moo");
            myClass.on("moo", () => {
                countAssertion();
                assert_1.default.ok(true, "Callback was fired");
            });
            myClass.cancelStatic("moo");
            myClass.on("moo", () => {
                countAssertion();
                assert_1.default.ok(false, "Callback was fired");
            });
            setTimeout(() => {
                resolve();
            }, 10);
        });
    });
    describe("overwrite()", () => {
        it("Only fires the last listener added, cancelling all other listeners before it", (resolve) => {
            class MyClass extends Emitter_1.Emitter {
            }
            expect(1);
            const myClass = new MyClass();
            myClass.on("moo", () => {
                countAssertion();
                assert_1.default.ok(false, "Correct callback was fired");
            });
            myClass.on("moo", () => {
                countAssertion();
                assert_1.default.ok(false, "Correct callback was fired");
            });
            myClass.overwrite("moo", () => {
                countAssertion();
                assert_1.default.ok(true, "Correct callback was fired");
            });
            myClass.emit("moo");
            setTimeout(() => {
                resolve();
            }, 10);
        });
        it("Only fires the last listener added (with id), cancelling all other listeners before it", (resolve) => {
            class MyClass extends Emitter_1.Emitter {
            }
            expect(2);
            const myClass = new MyClass();
            // Define a listener without an id, this should not be overwritten
            myClass.on("moo", () => {
                countAssertion();
                assert_1.default.ok(true, "Correct callback was fired");
            });
            // Define some listeners WITH ids, these should be overwritten
            myClass.on("moo", "1234", () => {
                countAssertion();
                assert_1.default.ok(false, "Correct callback was fired");
            });
            myClass.on("moo", "1234", () => {
                countAssertion();
                assert_1.default.ok(false, "Correct callback was fired");
            });
            // Overwrite the id listeners
            myClass.overwrite("moo", "1234", () => {
                countAssertion();
                assert_1.default.ok(true, "Correct callback was fired");
            });
            myClass.emitId("moo", "1234");
            setTimeout(() => {
                resolve();
            }, 50);
        });
    });
    describe("emitId()", () => {
        it("Fires an id-based event first followed by a global event", () => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            const myClass = new Emitter_1.Emitter();
            let emitCount = 0;
            // Register id-based listener
            myClass.on("moo", "testId", () => {
                emitCount++;
            });
            // Register non-id-based listener
            myClass.on("moo", () => {
                emitCount++;
            });
            assert_1.default.strictEqual((_a = myClass._eventListeners) === null || _a === void 0 ? void 0 : _a.moo["testId"].length, 1, "Listener registered on event");
            myClass.emitId("moo", "testId", "foo");
            assert_1.default.strictEqual(emitCount, 2, "Event fired correctly");
            myClass.off("moo", "testId");
            assert_1.default.strictEqual(!((_b = myClass._eventListeners) === null || _b === void 0 ? void 0 : _b.moo) ||
                !((_c = myClass._eventListeners) === null || _c === void 0 ? void 0 : _c.moo["testId"]) ||
                ((_d = myClass._eventListeners) === null || _d === void 0 ? void 0 : _d.moo["testId"].length), true, "Listeners all removed from event");
            assert_1.default.strictEqual(((_e = myClass._eventListeners) === null || _e === void 0 ? void 0 : _e.moo) &&
                ((_f = myClass._eventListeners) === null || _f === void 0 ? void 0 : _f.moo["*"]) &&
                ((_g = myClass._eventListeners) === null || _g === void 0 ? void 0 : _g.moo["*"].length) === 1, true, "Global listener still there");
            myClass.off("moo");
            assert_1.default.strictEqual(!((_h = myClass._eventListeners) === null || _h === void 0 ? void 0 : _h.moo) ||
                !((_j = myClass._eventListeners) === null || _j === void 0 ? void 0 : _j.moo["*"]) ||
                ((_k = myClass._eventListeners) === null || _k === void 0 ? void 0 : _k.moo["*"].length) === 0, true, "Listeners all removed from event");
        });
    });
});
