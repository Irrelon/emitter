# Irrelon Emitter

## Usage

### Node.js and Packaging Systems Like Webpack
Install via NPM / Yarn:

```bash
npm install @irrelon/emitter
```

```bash
yarn add @irrelon/emitter
```

Include in your application:

```js
var Emitter = require('@irrelon/emitter');
```

## Extend The Emitter Class

```js
import {Emitter} from "@irrelon/emitter";
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

### Browser
Include the Emitter.js file in your HTML (the path depends on where you've put the file)

```html
<script src="./src/Emitter.js" type="module"></script>
```