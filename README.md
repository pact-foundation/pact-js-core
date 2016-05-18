<img src="https://raw.githubusercontent.com/pact-foundation/pact-logo/master/media/logo-black.png" width="200">

[![Build Status](https://travis-ci.org/pact-foundation/pact-node.svg?branch=master)](https://travis-ci.org/pact-foundation/pact-node)
[![npm](https://img.shields.io/npm/v/@pact-foundation/pact-node.svg?maxAge=2592000)](https://www.npmjs.com/package/@pact-foundation/pact-node)
[![npm](https://img.shields.io/github/license/pact-foundation/pact-node.svg?maxAge=2592000)](https://github.com/pact-foundation/pact-node/blob/master/LICENSE)
[![npm](https://img.shields.io/david/pact-foundation/pact-node.svg?maxAge=2592000)](https://www.npmjs.com/package/@pact-foundation/pact-node)
<!---[![npm](https://img.shields.io/npm/dt/pact-foundation/pact-node.svg?maxAge=2592000)](https://www.npmjs.com/package/@pact-foundation/pact-node)-->

# Pact Node

An idiomatic Node interface for the [Pact](http://pact.io) mock service (Consumer) and Verification (Provider) process.

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

### Create Pact Mock Server

```js
var pact = require('@pact-foundation/pact-node');
var server = pact.createServer({
	port: <Number>,     // Port number that the server runs on, defaults to 1234
	host: <String>,     // Host on which to bind the server on, defaults to 'localhost'
	log: <String>,      // File to log output on relative to current working directory, defaults to none
	ssl: <Boolean>,     // Create a self-signed SSL cert to run the server over HTTPS , defaults to 'false'
	cors: <Boolean>,    // Allow CORS OPTION requests to be accepted, defaults to 'false'
	dir: <String>,      // Directory to write the pact contracts relative to the current working directory, defaults to none
	spec: <Number>,     // The pact specification version to use when writing pact contracts, defaults to '1'
	consumer: <String>, // The name of the consumer to be written to the pact contracts, defaults to none
	provider: <String>  // The name of the provider to be written to the pact contracts, defaults to none
});
```

### Run Provider Verification

Read more about [Verify Pacts](https://github.com/realestate-com-au/pact/wiki/Verifying-pacts).

```js
var pact = require('@pact-foundation/pact-node');
var opts = {
	providerBaseUrl: <String>,       // Running API provider host endpoint. Required.
	pactUrls: <Array>,               // Array of local Pact file paths or Pact Broker URLs (http based). Required.
	providerStatesUrl: <String>,     // URL to fetch the provider states for the given provider API. Optional.
	providerStatesSetupUrl <String>, // URL to send PUT requests to setup a given provider state. Optional.
	pactBrokerUsername: <String>,    // Username for Pact Broker basic authentication. Optional
	pactBrokerPassword: <String>,    // Password for Pact Broker basic authentication. Optional
};

pact.verifyPacts(opts)).then(function () {
	// do something
});
```

### List Mock Servers

If you ever need to see which servers are currently created.

```js
var pact = require('@pact-foundation/pact-node');
var servers = pact.listServers();
console.log(JSON.stringify(servers));
```

### Remove All Mock Servers

Remove all servers once you're done with them in one fell swoop.

```js
var pact = require('@pact-foundation/pact-node');
pact.removeAllServers();
```

### Start a Mock Server server

Start the current server.

```js
var pact = require('@pact-foundation/pact-node');
pact.createServer().start().then(function(){
	// Do something after it started
});
```

### Stop a Mock server

Stop the current server.

```js
var pact = require('@pact-foundation/pact-node');
pact.createServer().stop().then(function(){
	// Do something after it stopped
});
```

### Delete a Mock server

Stop the current server and deletes it from the list.

```js
var pact = require('@pact-foundation/pact-node');
pact.createServer().delete().then(function(){
	// Do something after it was killed
});
```

### Check if a Mock server is running

```js
var pact = require('@pact-foundation/pact-node');
pact.createServer().running;
```

### Mock Server Events

There's 3 different events available, 'start', 'stop' and 'delete'.  They can be listened to the same way as an [EventEmitter](https://nodejs.org/api/events.html).

```js
var pact = require('@pact-foundation/pact-node');
var server = pact.createServer();
server.on('start', function() { console.log('started'); });
server.on('stop', function() { console.log('stopped'); });
server.on('delete', function() { console.log('deleted'); });
```

## Contributing

To develop this project, simply install the dependencies and run `npm run watch` to for continual development, linting and testing when a source file changes.

## Testing

Running `npm test` will execute the tests that has the `*.spec.js` pattern.
