const {beforeEach, afterEach, describe, it} = require("mocha");
const Emitter = require("../dist/Emitter");
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
	it("Creates emitter instance by instantiation", () => {
		const myClass = new Emitter();
		
		myClass.on("moo", () => {
		});
		
		assert.strictEqual(myClass._listeners.moo["*"].length, 1, "Listener registered on event");
		
		myClass.off("moo");
		
		assert.strictEqual(!myClass._listeners.moo || myClass._listeners.moo["*"].length, true, "Listeners all removed from event");
	});
	
	it("Emitter.off() removes all listeners from an event", () => {
		const MyClass = function () {
		};
		
		Emitter(MyClass);
		
		const myClass = new MyClass();
		
		myClass.on("moo", () => {
		});
		
		assert.strictEqual(myClass._listeners.moo["*"].length, 1, "Listener registered on event");
		
		myClass.off("moo");
		
		assert.strictEqual(!myClass._listeners.moo || myClass._listeners.moo["*"].length, true, true, "Listeners all removed from event");
	});
	
	it("Emitter.emitStatic() static emitter works", (resolve) => {
		const MyClass = function () {
		};
		
		expect(1);
		
		Emitter(MyClass);
		
		const myClass = new MyClass();
		myClass.emitStatic("moo");
		myClass.on("moo", () => {
			countAssertion();
			assert.ok(true, "Callback was fired");
			resolve();
		});
	});
	
	it("Emitter.cancelStatic() removes static emitter", (resolve) => {
		const MyClass = function () {
		};
		
		expect(1);
		
		Emitter(MyClass);
		
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
	
	it("Emitter.one() only fires the last listener added, cancelling all other listeners before it", (resolve) => {
		const MyClass = function () {
		};
		expect(1);
		
		Emitter(MyClass);
		
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
	
	it("Fires an event correctly using emitId()", () => {
		const myClass = new Emitter();
		let emitCount = 0;
		
		myClass.on("moo", "testId", () => {
			emitCount++;
		});
		
		assert.strictEqual(myClass._listeners.moo["testId"].length, 1, "Listener registered on event");
		
		myClass.emitId("moo", "testId", "foo");
		
		assert.strictEqual(emitCount, 1, "Event fired correctly");
		
		myClass.off("moo", "testId");
		
		assert.strictEqual(!myClass._listeners.moo["testId"] || myClass._listeners.moo["testId"].length, true, "Listeners all removed from event");
	});
});
