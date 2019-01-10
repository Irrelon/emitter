QUnit.module('Emitter');

QUnit.test("new Emitter() - Create emitter instance by instantiation", function () {
	var myClass;
	
	myClass = new Emitter();
	myClass.on('moo', function () {});
	
	strictEqual(myClass._listeners.moo['*'].length, 1, 'Listener registered on event');
	
	myClass.off('moo');
	
	strictEqual(!myClass._listeners.moo || myClass._listeners.moo['*'].length, true, 'Listeners all removed from event');
});

QUnit.test("Emitter.off() - Remove all listeners from an event", function () {
	var MyClass = function () {},
		myClass;

	Emitter(MyClass);

	myClass = new MyClass();

	myClass.on('moo', function () {});

	strictEqual(myClass._listeners.moo['*'].length, 1, 'Listener registered on event');

	myClass.off('moo');

	strictEqual(!myClass._listeners.moo || myClass._listeners.moo['*'].length, true, true, 'Listeners all removed from event');
});

QUnit.asyncTest("Emitter.emitStatic() - Check static emitter works", function () {
	var MyClass = function () {},
		myClass;
	
	expect(1);
	
	Emitter(MyClass);
	
	myClass = new MyClass();
	myClass.emitStatic('moo');
	myClass.on('moo', function () {
		ok(true, "Callback was fired");
		start();
	});
});

QUnit.asyncTest("Emitter.cancelStatic() - Check static emitter can be removed works", function () {
	var MyClass = function () {},
		myClass;
	
	expect(1);
	
	Emitter(MyClass);
	
	myClass = new MyClass();
	myClass.emitStatic('moo');
	myClass.on('moo', function () {
		ok(true, "Callback was fired");
	});
	myClass.cancelStatic('moo');
	myClass.on('moo', function () {
		ok(true, "Callback was fired");
	});
	
	setTimeout(() => {
		start();
	}, 1000);
});