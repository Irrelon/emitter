# Irrelon Emitter

## Usage

### JavaScript
```javascript
import { Emitter } from "@irrelon/emitter";
const emitter = new Emitter();

// When the emit() call is made at the end of this
// example this listener will be called with
// `isEnabled = true` and `id = "1234"`. You can pass
// any number of arguments when calling emit() and
// they will be recieved in order by your listeners
emitter.on("someEvent", (isEnabled, id) => {
    return;
});

emitter.emit("someEvent", true, "1234");
```

### TypeScript Compatibility
> TypeScript based projects can benefit from type safety if you declare the event listener
> function signatures via an interface as shown below

```typescript
import { Emitter } from "@irrelon/emitter";

interface MyEvents {
    event1: (name: string) => number;
}

// Pass your interface to the Emitter instantiation
const emitter = new Emitter<MyEvents>();

// This will show a typescript error because the 
// first argument of the event1 listener should be
// a string, and the listener should return a number
// instead of void.
emitter.on("event1", (isEnabled: boolean) => {
    return;
});

// This will not error as it satisfies the
// MyEvents.event1 event listener signature
emitter.on("event1", (name: string) => {
    return 18;
});

// This will error because a string argument is
// expected and none is provided to the call
emitter.emit("event1");

// This will not error as you are passing the
// expected string argument
emitter.emit("event1", "John Smith");
```

### Extending The Emitter Class

```js
import { Emitter } from "@irrelon/emitter";

class MyClass extends Emitter {
    async someAsyncFunc () {
        await this.emit('myEvent', myData, myOtherData);
    }

    someFunc () {
        this.emit('myEvent', myData, myOtherData);
    }
};
```

Your class now inherits the emitter methods:

* on
* off
* once
* emit
* emitId
* emitStatic
* emitStaticId
* cancelStatic
* deferEmit
* willEmit

### EcmaScript Modules and CommonJS Modules
> The package includes both ESM and CJS modules for ease of use.
> Use `import` to get the ESM version, and `require()` to get
> the CJS version.

### Install via NPM / Yarn:

```bash
npm i @irrelon/emitter
```

```bash
yarn add @irrelon/emitter
```

### Include in Your Application

```js
import {Emitter} from "@irrelon/emitter";
```
or
```js
var Emitter = require("@irrelon/emitter");
```

### Browser

Include the Emitter.js file in your HTML (the path depends on where you've put the file)

```html
<script src="./dist/esm/src/Emitter.js" type="module"></script>
```
