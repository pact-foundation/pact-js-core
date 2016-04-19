<img src="https://raw.githubusercontent.com/pact-foundation/pact-logo/master/media/logo-black.png" width="200">

[![Build Status](https://travis-ci.org/pact-foundation/pact-node.svg?branch=master)](https://travis-ci.org/pact-foundation/pact-node)
[![npm](https://img.shields.io/npm/v/@pact-foundation/pact-node.svg?maxAge=2592000)](https://www.npmjs.com/package/@pact-foundation/pact-node)
[![npm](https://img.shields.io/npm/dt/pact-foundation/pact-node.svg?maxAge=2592000)](https://www.npmjs.com/package/@pact-foundation/pact-node)
[![npm](https://img.shields.io/github/license/pact-foundation/pact-node.svg?maxAge=2592000)](https://github.com/pact-foundation/pact-node/blob/master/LICENSE)
[![npm](https://img.shields.io/david/pact-foundation/pact-node.svg?maxAge=2592000)](https://www.npmjs.com/package/@pact-foundation/pact-node)

# Pact Node

A wrapper for the Pact mock service for it to work with node in an easy to manage way.

## Installation

`npm install @pact-foundation/pact-node --save`

## Usage

Simply require the library and call the create function.

```js
var pact = require('@pact-foundation/pact-node');
var server = pact.create({port: 9999});
server.start().then(function() {
	// Do your testing/development here
});
```

## Documentation

### Create Server

```js
var pact = require('@pact-foundation/pact-node');
var server = pact.create({
	port: <Number>, // Port number that the server runs on, defaults to 1234
	host: <String>, // Host on which to bind the server on, defaults to 'localhost'
	log: <String>, // File to log output on relative to current working directory, defaults to none
	ssl: <Boolean>, // Create a self-signed SSL cert to run the server over HTTPS , defaults to 'false'
	cors: <Boolean>, // Allow CORS OPTION requests to be accepted, defaults to 'false'
	dir: <String>, // Directory to write the pact contracts relative to the current working directory, defaults to none
	spec: <Number>, // The pact specification version to use when writing pact contracts, defaults to '1'
	consumer: <String>, // The name of the consumer to be written to the pact contracts, defaults to none
	provider: <String> // The name of the provider to be written to the pact contracts, defaults to none
});
```

### List Servers

If you ever need to see which servers are currently created.

```js
var pact = require('@pact-foundation/pact-node');
var servers = pact.list();
console.log(JSON.stringify(servers));
```

### Remove All Servers

Remove all servers once you're done with them in one fell swoop.

```js
var pact = require('@pact-foundation/pact-node');
pact.removeAll();
```

### Start a server

Start the current server.

```js
var pact = require('@pact-foundation/pact-node');
pact.create().start().then(function(){
	// Do something after it started
});
```

### Stop a server

Stop the current server.

```js
var pact = require('@pact-foundation/pact-node');
pact.create().stop().then(function(){
	// Do something after it stopped
});
```

### Delete a server

Stop the current server and deletes it from the list.

```js
var pact = require('@pact-foundation/pact-node');
pact.create().delete().then(function(){
	// Do something after it was killed
});
```

### Check if server is running

```js
var pact = require('@pact-foundation/pact-node');
pact.create().running;
```

### Events

There's 3 different events available, 'start', 'stop' and 'delete'.  They can be listened to the same way as an [EventEmitter](https://nodejs.org/api/events.html).

```js
var pact = require('@pact-foundation/pact-node');
var server = pact.create();
server.on('start', function() { console.log('started'); });
server.on('stop', function() { console.log('stopped'); });
server.on('delete', function() { console.log('deleted'); });
```

## Contributing

To develop this project, simply install the dependencies and run `npm run watch` to for continual development, linting and testing when a source file changes.

## Testing

Running `npm test` will execute the tests that has the `*.spec.js` pattern.
