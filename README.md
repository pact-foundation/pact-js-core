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

Simply require the library and call the create function to start the mock service

```js
var pact = require('@pact-foundation/pact-node');
var server = pact.createServer({port: 9999});
server.start().then(function() {
	// Do your testing/development here
});
```

Or if you're using Typescript instead of plain old Javascript

```ts
import pact from "@pact-foundation/pact-node";
const server = pact.createServer({port: 9999});
server.start().then(() => {
	// Do your testing/development here
});
```

Or you can also use the CLI

```
$# pact mock --port 9999
```

To see the list commands possible with the CLI, simply ask for help `$# pact --help`

## Documentation

### Set Log Level

```js
var pact = require('@pact-foundation/pact-node');
pact.logLevel('debug');
```

### Create Pact Mock Server

```js
var pact = require('@pact-foundation/pact-node');
var server = pact.createServer({
	port: <Number>,     // Port number that the server runs on, defaults to random available port
	host: <String>,     // Host on which to bind the server on, defaults to 'localhost'. Supports '0.0.0.0' to bind on all IPv4 addresses on the local machine.
	log: <String>,      // File to log output on relative to current working directory, defaults to none
	ssl: <Boolean>,     // Create a self-signed SSL cert to run the server over HTTPS , defaults to 'false'
	sslcert: <String>,  // Path to a custom self-signed SSL cert file, 'ssl' option must be set to true to use this option. Defaults to none
	sslkey: <String>,   // Path a custom key and self-signed SSL cert key file, 'ssl' option must be set to true to use this option. Defaults to none
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

pact.verifyPacts({
	providerBaseUrl: <String>,           // Running API provider host endpoint. Required.
	pactBrokerUrl: <String>              // URL to fetch the pacts if pactUrls not supplied. Optional.
	provider: <String>                   // Name of the provider if fetching from a Broker. Optional.
	tags: <Array>                        // Array of tags, used to filter pacts from the Broker. Optional.
	pactUrls: <Array>,                   // Array of local Pact file paths or HTTP-based URLs (e.g. from a broker). Required if not using a Broker.
	providerStatesSetupUrl: <String>,    // URL to send PUT requests to setup a given provider state. Optional.
	pactBrokerUsername: <String>,        // Username for Pact Broker basic authentication. Optional.
	pactBrokerPassword: <String>,        // Password for Pact Broker basic authentication. Optional
	publishVerificationResult: <Boolean> // Publish verification result to Broker. Optional
	providerVersion: <Boolean>           // Provider version, required to publish verification result to Broker. Optional otherwise.
	timeout: <Number>                    // The duration in ms we should wait to confirm verification process was successful. Defaults to 30000, Optional.
});
```

### Publish Pacts to a Broker

```js
var pact = require('@pact-foundation/pact-node');
var opts = {
	pactFilesOrDirs: <Array>,        // Array of local Pact files or directories containing them. Required.
	pactBroker: <String>,            // URL to fetch the provider states for the given provider API. Optional.
	pactBrokerUsername: <String>,    // Username for Pact Broker basic authentication. Optional
	pactBrokerPassword: <String>,    // Password for Pact Broker basic authentication. Optional,
	tags: <Array>,                   // An array of Strings to tag the Pacts being published. Optional
	consumerVersion: <String>        // A string containing a semver-style version e.g. 1.0.0. Required.
};

pact.publishPacts(opts).then(function () {
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

## Questions?

Please search for potential answers or post question on our [official Pact StackOverflow](https://stackoverflow.com/questions/tagged/pact).
