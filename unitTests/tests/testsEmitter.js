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