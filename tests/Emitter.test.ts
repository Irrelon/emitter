import assert from "assert";
import {ConvertInterfaceToDict, Emitter, EventListenerCallback, EventReturnFlag} from "../src/Emitter";

let expectedAssertions = 0;
let actualAssertions = 0;

function expect (val: number) {
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

	throw new Error("expected " + expectedAssertions + " assertions, got " + actualAssertions);
}

beforeEach(reset);
afterEach(check);

describe("Emitter", () => {
	describe("new Emitter()", () => {
		it("Creates emitter instance by instantiation", () => {
			const myClass = new Emitter();

			myClass.on("moo", () => {
			});

			assert.strictEqual(myClass._eventListeners?.moo!["*"].length, 1, "Listener registered on event");

			myClass.off("moo");

			assert.strictEqual(!myClass._eventListeners?.moo || !myClass._eventListeners.moo["*"] || myClass._eventListeners.moo["*"].length, true, "Listeners all removed from event");
		});

		it("Supports extending Emitter as a base class", () => {
			let testFuncCount = 0;

			// Test extending Emitter and modifying base functionality
			class MyClass extends Emitter {
				testFunc () {
					testFuncCount++;
				}

				on (eventName: string, id: string, listener: EventListenerCallback): this;
				on (eventName: string, listener: EventListenerCallback): this;
				on (eventName: string, ...rest: any[]): this {
					const restTypes = rest.map((arg) => typeof arg);

					if (restTypes[0] === "function") {
						const listener = restTypes[0] as unknown as EventListenerCallback;
						const id = "^^noId";

						return super.on(eventName, id, listener);
					}

					return super.on(eventName, rest[0], rest[1]);
				}

				// @ts-ignore
				emit (eventName: string, ...rest: any[]): EventReturnFlag {
					return super.emitId(eventName, "^^noId", ...rest);
				}

				off (eventName: string, id: string, listener?: EventListenerCallback): this;
				off (eventName: string, listener?: EventListenerCallback): this;
				off (eventName: string): this;
				off (eventName: string, ...rest: any[]) {
					let id = rest[0];
					let func = rest[1];

					if (typeof rest[0] === "function") {
						func = rest[0];
						id = "^^noId";
					} else if (typeof id === "undefined") {
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

			assert.strictEqual(myClass._eventListeners?.moo!["testId"].length, 1, "Listener registered on event");

			myClass.emitId("moo", "testId", "foo");

			assert.strictEqual(emitCount, 1, "Event fired correctly");

			myClass.off("moo", "testId");

			assert.strictEqual(!myClass._eventListeners?.moo || !myClass._eventListeners?.moo["testId"] || myClass._eventListeners?.moo["testId"].length === 0, true, "Listeners all removed from event");
			assert.strictEqual(myClass._eventListeners?.moo && myClass._eventListeners?.moo["^^noId"] && myClass._eventListeners?.moo["^^noId"].length === 1, true, "Global listener still there");
			assert.strictEqual(!myClass._eventListeners?.moo || !myClass._eventListeners?.moo["*"] || myClass._eventListeners?.moo["*"].length === 0, true, "Global listener still there");

			myClass.off("moo");

			assert.strictEqual(!myClass._eventListeners?.moo || !myClass._eventListeners?.moo["*"] || myClass._eventListeners?.moo["*"].length === 0, true, "Listeners all removed from event");
		});
	});

	describe("emit()", () => {
		it("Supports type safe usage", async () => {
			interface MyEventsResponses {
				post: () => void;
				person: (name: string, age: number, enabled: boolean) => void;
				house: (no: number, street: string, postcode: string, enabled: boolean) => void;
			}

			const emitter = new Emitter<ConvertInterfaceToDict<MyEventsResponses>>();
			let listenerFiredCount = 0;

			emitter.on("person", async (name, age, enabled) => {
				return new Promise<void>((resolve) => {
					setTimeout(() => {
						listenerFiredCount++;
						resolve();
					}, 1000);
				});
			});

			emitter.on("post", async () => {
				return new Promise<void>((resolve) => {
					setTimeout(() => {
						listenerFiredCount++;
						resolve();
					}, 1000);
				});
			});

			emitter.on("post", async () => {
				return new Promise<void>((resolve) => {
					setTimeout(() => {
						listenerFiredCount++;
						resolve();
					}, 1000);
				});
			});

			const time = new Date().getTime();
			await emitter.emit("post");
			const delta = new Date().getTime() - time;

			assert.ok(delta > 900, `Delta was not correct, await may not have paused? Delta was: ${delta}`);
		});

		it("Supports awaiting async listeners", async () => {
			const emitter = new Emitter();
			let listenerFiredCount = 0;

			emitter.on("foo", async () => {
				return new Promise<void>((resolve) => {
					setTimeout(() => {
						listenerFiredCount++;
						resolve();
					}, 1000);
				});
			});

			emitter.on("foo", async () => {
				return new Promise<void>((resolve) => {
					setTimeout(() => {
						listenerFiredCount++;
						resolve();
					}, 1000);
				});
			});

			const time = new Date().getTime();
			await emitter.emit("foo");
			const delta = new Date().getTime() - time;

			assert.ok(delta > 900, "Delta was not correct, await may not have paused?");
		});
	});

	describe("off()", () => {
		it("Cancels all listeners (event)", () => {
			const myClass = new Emitter();
			const listener1 = () => {
			};
			const listener2 = () => {
			};

			myClass.on("moo", () => {
			});
			assert.strictEqual(myClass._eventListeners?.moo!["*"].length, 1, "Listeners registered on event");
			myClass.on("moo", "testId", () => {
			});
			assert.strictEqual(myClass._eventListeners?.moo["testId"].length, 1, "Listeners registered on event");
			myClass.on("moo", listener1);
			assert.strictEqual(myClass._eventListeners?.moo["*"].length, 2, "Listeners registered on event");
			myClass.on("moo", "testId", listener2);
			assert.strictEqual(myClass._eventListeners?.moo["testId"].length, 2, "Listeners registered on event");

			myClass.off("moo");

			assert.strictEqual(!myClass._eventListeners?.moo || (myClass._eventListeners?.moo["*"].length === 0 && myClass._eventListeners?.moo["testId"].length === 0), true, "Listeners all removed from event");
		});

		it("Cancels id-based listeners (event, id)", () => {
			const myClass = new Emitter();
			const listener1 = () => {
			};
			const listener2 = () => {
			};

			myClass.on("moo", () => {
			});
			assert.strictEqual(myClass._eventListeners?.moo!["*"].length, 1, "Listeners registered on event");
			myClass.on("moo", "testId", () => {
			});
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
			const listener1 = () => {
			};
			const listener2 = () => {
			};

			myClass.on("moo", () => {
			});
			assert.strictEqual(myClass._eventListeners?.moo!["*"].length, 1, "Listeners registered on event");
			myClass.on("moo", "testId", () => {
			});
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
			const listener1 = () => {
			};
			const listener2 = () => {
			};

			myClass.on("moo", () => {
			});
			assert.strictEqual(myClass._eventListeners?.moo!["*"].length, 1, "Listeners registered on event");
			myClass.on("moo", "testId", () => {
			});
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

		it("Only fires the last listener added (with id), cancelling all other listeners before it", (resolve) => {
			class MyClass extends Emitter {
			}

			expect(2);

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

			assert.strictEqual(myClass._eventListeners?.moo!["testId"].length, 1, "Listener registered on event");

			myClass.emitId("moo", "testId", "foo");

			assert.strictEqual(emitCount, 2, "Event fired correctly");

			myClass.off("moo", "testId");

			assert.strictEqual(!myClass._eventListeners?.moo || !myClass._eventListeners?.moo["testId"] || myClass._eventListeners?.moo["testId"].length, true, "Listeners all removed from event");
			assert.strictEqual(myClass._eventListeners?.moo && myClass._eventListeners?.moo["*"] && myClass._eventListeners?.moo["*"].length === 1, true, "Global listener still there");

			myClass.off("moo");

			assert.strictEqual(!myClass._eventListeners?.moo || !myClass._eventListeners?.moo["*"] || myClass._eventListeners?.moo["*"].length === 0, true, "Listeners all removed from event");
		});
	});
});
