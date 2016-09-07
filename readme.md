# Irrelon Emitter

## Version 2.0.2

## Usage

### Browser
Include the ./dist/index.min.js file in your HTML

```html
<script src="./dist/index.min.js"></script>
```

### Node.js
Install via NPM:

```bash
npm install irrelon-emitter
```

Include in your application:

```js
var Emitter = require('irrelon-emitter');
```

## Add Emitter Functionality to Existing Class
Given an example class:

```js
var MyClass = function () {
	this.emit('myEvent', myData, myOtherData);
};
```

Add emitter functionality:

```js
Emitter(MyClass);
```

Your class now inherits the emitter methods:

* on
* off
* once
* emit
* emitId
* emitStatic
* emitStaticId
* deferEmit
* willEmit