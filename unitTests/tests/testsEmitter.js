QUnit.module('Emitter');
QUnit.test("Emitter.off() - Remove all listeners from an event", function () {
	var MyClass = function () {},
		myClass;

	Emitter(MyClass);

	myClass = new MyClass();

	myClass.on('moo', function () {});

	strictEqual(myClass._listeners.moo['*'].length, 1, 'Listener registered on event');

	myClass.off('moo');

	strictEqual(myClass._listeners.moo['*'].length, 0, 'Listeners all removed from event');
});