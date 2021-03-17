const {beforeEach, afterEach, describe, it} = require("mocha");
const {Emitter, makeEmitter} = require("../dist/Emitter");
const assert = require("assert");

let expectedAssertions = 0;
let actualAssertions = 0;

function expect (val) {
	expectedAssertions = val;
}

function reset () {
	expectedAssertions = 0;
	actualAssertions = 0;
}

function countAssertion () {
	actualAssertions++;
}

function check () {
	if (expectedAssertions === undefined || expectedAssertions === actualAssertions) {
		return;
	}
	const err = new Error("expected " + expectedAssertions + " assertions, got " + actualAssertions);
	this.currentTest.emit("error", err);
}

beforeEach(reset);
afterEach(check);

describe("Emitter", () => {
	describe("new Emitter()", () => {
		it("Creates emitter instance by instantiation", () => {
			const myClass = new Emitter();

			myClass.on("moo", () => {
			});

			assert.strictEqual(myClass._listeners.moo["*"].length, 1, "Listener registered on event");

			myClass.off("moo");

			assert.strictEqual(!myClass._listeners.moo || !myClass._listeners.moo["*"] || myClass._listeners.moo["*"].length, true, "Listeners all removed from event");
		});

		it("Supports extending Emitter as a base class", () => {
			let testFuncCount = 0;

			// Test extending Emitter and modifying base functionality
			class MyClass extends Emitter {
				testFunc () {
					testFuncCount++;
				}

				on (event, id, listener) {
					if (typeof id === "function") {
						listener = id;
						id = "^^noId";
					}

					super.on(event, id, listener);
				}

				emit (event, ...rest) {
					super.emitId(event, "^^noId", ...rest);
				}

				off (event, id, func) {
					if (typeof id === "function") {
						func = id;
						id = "^^noId";
					} else if (typeof id === "undefined") {
						id = "^^noId";
					}

					super.off(event, id, func);
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

			assert.strictEqual(myClass._listeners.moo["testId"].length, 1, "Listener registered on event");

			myClass.emitId("moo", "testId", "foo");

			assert.strictEqual(emitCount, 1, "Event fired correctly");

			myClass.off("moo", "testId");

			assert.strictEqual(!myClass._listeners.moo || !myClass._listeners.moo["testId"] || myClass._listeners.moo["testId"].length === 0, true, "Listeners all removed from event");
			assert.strictEqual(myClass._listeners.moo && myClass._listeners.moo["^^noId"] && myClass._listeners.moo["^^noId"].length === 1, true, "Global listener still there");
			assert.strictEqual(!myClass._listeners.moo || !myClass._listeners.moo["*"] || myClass._listeners.moo["*"].length === 0, true, "Global listener still there");

			myClass.off("moo");

			assert.strictEqual(!myClass._listeners.moo || !myClass._listeners.moo["*"] || myClass._listeners.moo["*"].length === 0, true, "Listeners all removed from event");
		});
	});

	describe("off()", () => {
		it("Cancels all listeners (event)", () => {
			const myClass = new Emitter();
			const listener1 = () => {};
			const listener2 = () => {};

			myClass.on("moo", () => {});
			assert.strictEqual(myClass._listeners.moo["*"].length, 1, "Listeners registered on event");
			myClass.on("moo", "testId", () => {});
			assert.strictEqual(myClass._listeners.moo["testId"].length, 1, "Listeners registered on event");
			myClass.on("moo", listener1);
			assert.strictEqual(myClass._listeners.moo["*"].length, 2, "Listeners registered on event");
			myClass.on("moo", "testId", listener2);
			assert.strictEqual(myClass._listeners.moo["testId"].length, 2, "Listeners registered on event");

			myClass.off("moo");

			assert.strictEqual(!myClass._listeners.moo || (myClass._listeners.moo["*"].length === 0 && myClass._listeners.moo["testId"].length === 0), true, "Listeners all removed from event");
		});

		it("Cancels id-based listeners (event, id)", () => {
			const myClass = new Emitter();
			const listener1 = () => {};
			const listener2 = () => {};

			myClass.on("moo", () => {});
			assert.strictEqual(myClass._listeners.moo["*"].length, 1, "Listeners registered on event");
			myClass.on("moo", "testId", () => {});
			assert.strictEqual(myClass._listeners.moo["testId"].length, 1, "Listeners registered on event");
			myClass.on("moo", listener1);
			assert.strictEqual(myClass._listeners.moo["*"].length, 2, "Listeners registered on event");
			myClass.on("moo", "testId", listener2);
			assert.strictEqual(myClass._listeners.moo["testId"].length, 2, "Listeners registered on event");

			myClass.off("moo", "testId");

			assert.strictEqual(myClass._listeners.moo["*"].length === 2, true, "Listeners all removed from event");
			assert.strictEqual(!myClass._listeners.moo["testId"] || myClass._listeners.moo["testId"].length === 0, true, "Listeners all removed from event");
		});

		it("Cancels listener-based listeners (event, listener)", () => {
			const myClass = new Emitter();
			const listener1 = () => {};
			const listener2 = () => {};

			myClass.on("moo", () => {});
			assert.strictEqual(myClass._listeners.moo["*"].length, 1, "Listeners registered on event");
			myClass.on("moo", "testId", () => {});
			assert.strictEqual(myClass._listeners.moo["testId"].length, 1, "Listeners registered on event");
			myClass.on("moo", listener1);
			assert.strictEqual(myClass._listeners.moo["*"].length, 2, "Listeners registered on event");
			myClass.on("moo", "testId", listener2);
			assert.strictEqual(myClass._listeners.moo["testId"].length, 2, "Listeners registered on event");

			myClass.off("moo", listener1);

			assert.strictEqual(myClass._listeners.moo["*"].length === 1, true, "Listeners all removed from event");
			assert.strictEqual(myClass._listeners.moo["testId"].length === 2, true, "Listeners all removed from event");
		});

		it("Cancels id-based + listener-based listeners (event, id, listener)", () => {
			const myClass = new Emitter();
			const listener1 = () => {};
			const listener2 = () => {};

			myClass.on("moo", () => {});
			assert.strictEqual(myClass._listeners.moo["*"].length, 1, "Listeners registered on event");
			myClass.on("moo", "testId", () => {});
			assert.strictEqual(myClass._listeners.moo["testId"].length, 1, "Listeners registered on event");
			myClass.on("moo", listener1);
			assert.strictEqual(myClass._listeners.moo["*"].length, 2, "Listeners registered on event");
			myClass.on("moo", "testId", listener2);
			assert.strictEqual(myClass._listeners.moo["testId"].length, 2, "Listeners registered on event");

			myClass.off("moo", "testId", listener2);

			assert.strictEqual(myClass._listeners.moo["*"].length === 2, true, "Listeners all removed from event");
			assert.strictEqual(myClass._listeners.moo["testId"].length === 1, true, "Listeners all removed from event");
		});
	});

	describe("emitStatic()", () => {
		it("Static emitter will emit when a new listener is added", (resolve) => {
			const MyClass = function () {};

			expect(1);

			makeEmitter(MyClass);

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
			const MyClass = function () {
			};

			expect(1);

			makeEmitter(MyClass);

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

	describe("one()", () => {
		it("Only fires the last listener added, cancelling all other listeners before it", (resolve) => {
			const MyClass = function () {
			};
			expect(1);

			makeEmitter(MyClass);

			const myClass = new MyClass();
			myClass.on("moo", () => {
				countAssertion();
				assert.ok(false, "Correct callback was fired");
			});
			myClass.on("moo", () => {
				countAssertion();
				assert.ok(false, "Correct callback was fired");
			});
			myClass.one("moo", () => {
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

			assert.strictEqual(myClass._listeners.moo["testId"].length, 1, "Listener registered on event");

			myClass.emitId("moo", "testId", "foo");

			assert.strictEqual(emitCount, 2, "Event fired correctly");

			myClass.off("moo", "testId");

			assert.strictEqual(!myClass._listeners.moo || !myClass._listeners.moo["testId"] || myClass._listeners.moo["testId"].length, true, "Listeners all removed from event");
			assert.strictEqual(myClass._listeners.moo && myClass._listeners.moo["*"] && myClass._listeners.moo["*"].length === 1, true, "Global listener still there");

			myClass.off("moo");

			assert.strictEqual(!myClass._listeners.moo || !myClass._listeners.moo["*"] || myClass._listeners.moo["*"].length === 0, true, "Listeners all removed from event");
		});
	});
});
