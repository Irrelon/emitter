var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import assert from "assert";
import { Emitter } from "../src/Emitter.js";
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
    const err = new Error("expected " + expectedAssertions + " assertions, got " + actualAssertions);
    // @ts-ignore
    this.currentTest.emit("error", err);
}
beforeEach(reset);
afterEach(check);
describe("Emitter", () => {
    describe("new Emitter()", () => {
        it("Creates emitter instance by instantiation", () => {
            var _a, _b;
            const myClass = new Emitter();
            myClass.on("moo", () => {
            });
            assert.strictEqual((_a = myClass._eventListeners) === null || _a === void 0 ? void 0 : _a.moo["*"].length, 1, "Listener registered on event");
            myClass.off("moo");
            assert.strictEqual(!((_b = myClass._eventListeners) === null || _b === void 0 ? void 0 : _b.moo) || !myClass._eventListeners.moo["*"] || myClass._eventListeners.moo["*"].length, true, "Listeners all removed from event");
        });
        it("Supports extending Emitter as a base class", () => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            let testFuncCount = 0;
            // Test extending Emitter and modifying base functionality
            class MyClass extends Emitter {
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
            assert.strictEqual((_a = myClass._eventListeners) === null || _a === void 0 ? void 0 : _a.moo["testId"].length, 1, "Listener registered on event");
            myClass.emitId("moo", "testId", "foo");
            assert.strictEqual(emitCount, 1, "Event fired correctly");
            myClass.off("moo", "testId");
            assert.strictEqual(!((_b = myClass._eventListeners) === null || _b === void 0 ? void 0 : _b.moo) || !((_c = myClass._eventListeners) === null || _c === void 0 ? void 0 : _c.moo["testId"]) || ((_d = myClass._eventListeners) === null || _d === void 0 ? void 0 : _d.moo["testId"].length) === 0, true, "Listeners all removed from event");
            assert.strictEqual(((_e = myClass._eventListeners) === null || _e === void 0 ? void 0 : _e.moo) && ((_f = myClass._eventListeners) === null || _f === void 0 ? void 0 : _f.moo["^^noId"]) && ((_g = myClass._eventListeners) === null || _g === void 0 ? void 0 : _g.moo["^^noId"].length) === 1, true, "Global listener still there");
            assert.strictEqual(!((_h = myClass._eventListeners) === null || _h === void 0 ? void 0 : _h.moo) || !((_j = myClass._eventListeners) === null || _j === void 0 ? void 0 : _j.moo["*"]) || ((_k = myClass._eventListeners) === null || _k === void 0 ? void 0 : _k.moo["*"].length) === 0, true, "Global listener still there");
            myClass.off("moo");
            assert.strictEqual(!((_l = myClass._eventListeners) === null || _l === void 0 ? void 0 : _l.moo) || !((_m = myClass._eventListeners) === null || _m === void 0 ? void 0 : _m.moo["*"]) || ((_o = myClass._eventListeners) === null || _o === void 0 ? void 0 : _o.moo["*"].length) === 0, true, "Listeners all removed from event");
        });
    });
    describe("emit()", () => {
        it("Supports awaiting async listeners", () => __awaiter(void 0, void 0, void 0, function* () {
            const emitter = new Emitter();
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
            yield emitter.emit("foo");
            const delta = new Date().getTime() - time;
            assert.ok(delta > 900, "Delta was not correct, await may not have paused?");
        }));
    });
    describe("off()", () => {
        it("Cancels all listeners (event)", () => {
            var _a, _b, _c, _d, _e, _f, _g;
            const myClass = new Emitter();
            const listener1 = () => { };
            const listener2 = () => { };
            myClass.on("moo", () => { });
            assert.strictEqual((_a = myClass._eventListeners) === null || _a === void 0 ? void 0 : _a.moo["*"].length, 1, "Listeners registered on event");
            myClass.on("moo", "testId", () => { });
            assert.strictEqual((_b = myClass._eventListeners) === null || _b === void 0 ? void 0 : _b.moo["testId"].length, 1, "Listeners registered on event");
            myClass.on("moo", listener1);
            assert.strictEqual((_c = myClass._eventListeners) === null || _c === void 0 ? void 0 : _c.moo["*"].length, 2, "Listeners registered on event");
            myClass.on("moo", "testId", listener2);
            assert.strictEqual((_d = myClass._eventListeners) === null || _d === void 0 ? void 0 : _d.moo["testId"].length, 2, "Listeners registered on event");
            myClass.off("moo");
            assert.strictEqual(!((_e = myClass._eventListeners) === null || _e === void 0 ? void 0 : _e.moo) || (((_f = myClass._eventListeners) === null || _f === void 0 ? void 0 : _f.moo["*"].length) === 0 && ((_g = myClass._eventListeners) === null || _g === void 0 ? void 0 : _g.moo["testId"].length) === 0), true, "Listeners all removed from event");
        });
        it("Cancels id-based listeners (event, id)", () => {
            var _a, _b, _c, _d, _e, _f, _g;
            const myClass = new Emitter();
            const listener1 = () => { };
            const listener2 = () => { };
            myClass.on("moo", () => { });
            assert.strictEqual((_a = myClass._eventListeners) === null || _a === void 0 ? void 0 : _a.moo["*"].length, 1, "Listeners registered on event");
            myClass.on("moo", "testId", () => { });
            assert.strictEqual((_b = myClass._eventListeners) === null || _b === void 0 ? void 0 : _b.moo["testId"].length, 1, "Listeners registered on event");
            myClass.on("moo", listener1);
            assert.strictEqual((_c = myClass._eventListeners) === null || _c === void 0 ? void 0 : _c.moo["*"].length, 2, "Listeners registered on event");
            myClass.on("moo", "testId", listener2);
            assert.strictEqual((_d = myClass._eventListeners) === null || _d === void 0 ? void 0 : _d.moo["testId"].length, 2, "Listeners registered on event");
            myClass.off("moo", "testId");
            assert.strictEqual(((_e = myClass._eventListeners) === null || _e === void 0 ? void 0 : _e.moo["*"].length) === 2, true, "Listeners all removed from event");
            assert.strictEqual(!((_f = myClass._eventListeners) === null || _f === void 0 ? void 0 : _f.moo["testId"]) || ((_g = myClass._eventListeners) === null || _g === void 0 ? void 0 : _g.moo["testId"].length) === 0, true, "Listeners all removed from event");
        });
        it("Cancels listener-based listeners (event, listener)", () => {
            var _a, _b, _c, _d, _e, _f;
            const myClass = new Emitter();
            const listener1 = () => { };
            const listener2 = () => { };
            myClass.on("moo", () => { });
            assert.strictEqual((_a = myClass._eventListeners) === null || _a === void 0 ? void 0 : _a.moo["*"].length, 1, "Listeners registered on event");
            myClass.on("moo", "testId", () => { });
            assert.strictEqual((_b = myClass._eventListeners) === null || _b === void 0 ? void 0 : _b.moo["testId"].length, 1, "Listeners registered on event");
            myClass.on("moo", listener1);
            assert.strictEqual((_c = myClass._eventListeners) === null || _c === void 0 ? void 0 : _c.moo["*"].length, 2, "Listeners registered on event");
            myClass.on("moo", "testId", listener2);
            assert.strictEqual((_d = myClass._eventListeners) === null || _d === void 0 ? void 0 : _d.moo["testId"].length, 2, "Listeners registered on event");
            myClass.off("moo", listener1);
            assert.strictEqual(((_e = myClass._eventListeners) === null || _e === void 0 ? void 0 : _e.moo["*"].length) === 1, true, "Listeners all removed from event");
            assert.strictEqual(((_f = myClass._eventListeners) === null || _f === void 0 ? void 0 : _f.moo["testId"].length) === 2, true, "Listeners all removed from event");
        });
        it("Cancels id-based + listener-based listeners (event, id, listener)", () => {
            var _a, _b, _c, _d, _e, _f;
            const myClass = new Emitter();
            const listener1 = () => { };
            const listener2 = () => { };
            myClass.on("moo", () => { });
            assert.strictEqual((_a = myClass._eventListeners) === null || _a === void 0 ? void 0 : _a.moo["*"].length, 1, "Listeners registered on event");
            myClass.on("moo", "testId", () => { });
            assert.strictEqual((_b = myClass._eventListeners) === null || _b === void 0 ? void 0 : _b.moo["testId"].length, 1, "Listeners registered on event");
            myClass.on("moo", listener1);
            assert.strictEqual((_c = myClass._eventListeners) === null || _c === void 0 ? void 0 : _c.moo["*"].length, 2, "Listeners registered on event");
            myClass.on("moo", "testId", listener2);
            assert.strictEqual((_d = myClass._eventListeners) === null || _d === void 0 ? void 0 : _d.moo["testId"].length, 2, "Listeners registered on event");
            myClass.off("moo", "testId", listener2);
            assert.strictEqual(((_e = myClass._eventListeners) === null || _e === void 0 ? void 0 : _e.moo["*"].length) === 2, true, "Listeners all removed from event");
            assert.strictEqual(((_f = myClass._eventListeners) === null || _f === void 0 ? void 0 : _f.moo["testId"].length) === 1, true, "Listeners all removed from event");
        });
    });
    describe("emitStatic()", () => {
        it("Static emitter will emit when a new listener is added", (resolve) => {
            class MyClass extends Emitter {
            }
            expect(1);
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
            expect(1);
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
            expect(1);
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
    });
    describe("emitId()", () => {
        it("Fires an id-based event first followed by a global event", () => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
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
            assert.strictEqual((_a = myClass._eventListeners) === null || _a === void 0 ? void 0 : _a.moo["testId"].length, 1, "Listener registered on event");
            myClass.emitId("moo", "testId", "foo");
            assert.strictEqual(emitCount, 2, "Event fired correctly");
            myClass.off("moo", "testId");
            assert.strictEqual(!((_b = myClass._eventListeners) === null || _b === void 0 ? void 0 : _b.moo) || !((_c = myClass._eventListeners) === null || _c === void 0 ? void 0 : _c.moo["testId"]) || ((_d = myClass._eventListeners) === null || _d === void 0 ? void 0 : _d.moo["testId"].length), true, "Listeners all removed from event");
            assert.strictEqual(((_e = myClass._eventListeners) === null || _e === void 0 ? void 0 : _e.moo) && ((_f = myClass._eventListeners) === null || _f === void 0 ? void 0 : _f.moo["*"]) && ((_g = myClass._eventListeners) === null || _g === void 0 ? void 0 : _g.moo["*"].length) === 1, true, "Global listener still there");
            myClass.off("moo");
            assert.strictEqual(!((_h = myClass._eventListeners) === null || _h === void 0 ? void 0 : _h.moo) || !((_j = myClass._eventListeners) === null || _j === void 0 ? void 0 : _j.moo["*"]) || ((_k = myClass._eventListeners) === null || _k === void 0 ? void 0 : _k.moo["*"].length) === 0, true, "Listeners all removed from event");
        });
    });
});
