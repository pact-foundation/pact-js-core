<img src="https://raw.githubusercontent.com/pact-foundation/pact-logo/master/media/logo-black.png" width="200">

[![Build Status](https://travis-ci.org/pact-foundation/pact-node.svg?branch=master)](https://travis-ci.org/pact-foundation/pact-node)
[![npm](https://img.shields.io/npm/v/@pact-foundation/pact-node.svg?maxAge=2592000)](https://www.npmjs.com/package/@pact-foundation/pact-node)
[![npm](https://img.shields.io/github/license/pact-foundation/pact-node.svg?maxAge=2592000)](https://github.com/pact-foundation/pact-node/blob/master/LICENSE)
[![npm](https://img.shields.io/david/pact-foundation/pact-node.svg?maxAge=2592000)](https://www.npmjs.com/package/@pact-foundation/pact-node)
<!---[![npm](https://img.shields.io/npm/dt/pact-foundation/pact-node.svg?maxAge=2592000)](https://www.npmjs.com/package/@pact-foundation/pact-node)-->

# Pact Node

An idiomatic Node interface for the [Pact](http://pact.io) mock service (Consumer) and Verification (Provider) process.

<!-- TOC -->

- [Pact Node](#pact-node)
    - [Installation](#installation)
    - [Usage](#usage)
    - [Documentation](#documentation)
        - [Set Log Level](#set-log-level)
        - [Mock Servers](#mock-servers)
            - [Create Mock Server](#create-mock-server)
            - [List Mock Servers](#list-mock-servers)
            - [Remove All Mock Servers](#remove-all-mock-servers)
            - [Start a Mock Server](#start-a-mock-server)
            - [Stop a Mock server](#stop-a-mock-server)
            - [Delete a Mock server](#delete-a-mock-server)
            - [Check if a Mock server is running](#check-if-a-mock-server-is-running)
            - [Mock Server Events](#mock-server-events)
        - [Provider Verification](#provider-verification)
        - [Pact Broker Publishing](#pact-broker-publishing)
        - [Stub Servers](#stub-servers)
            - [Create Stub Server](#create-stub-server)
        - [Message Pacts](#message-pacts)
            - [Create Message Pacts](#create-message-pacts)
                - [Example](#example)
                - [Example CLI invocation:](#example-cli-invocation)
    - [Contributing](#contributing)
    - [Testing](#testing)
    - [Questions?](#questions)

<!-- /TOC -->

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
### Mock Servers

Mock servers are used by Pact to record interactions and create pact contracts.

#### Create Mock Server

```js
var pact = require('@pact-foundation/pact-node');
var server = pact.createServer({
	...
});
```

**Options:**

|Parameter | Required?  | Type        | Description |
|----------|------------|-------------|-------------|
| `port`   | false |  number          | Port number that the server runs on, defaults to random available port |
| `host`   | false |  string          | Host on which to bind the server on, defaults to 'localhost'. Supports '0.0.0.0' to bind on all IPv4 addresses on the local machine. |
| `log`    | false |  string          | File to log output on relative to current working directory, defaults to none |
| `ssl`    | false |  boolean         | Create a self-signed SSL cert to run the server over HTTPS , defaults to `false` |
| `sslcert`| false |  string          | Path to a custom self-signed SSL cert file, 'ssl' option must be set to true to use this option, defaults to none |
| `sslkey` | false |  string          | Path a custom key and self-signed SSL cert key file, 'ssl' option must be set to true to use this, defaults to none |
| `cors`   | false |  boolean         | Allow CORS OPTION requests to be accepted, defaults to 'false' |
| `dir`    | false |  string          | Directory to write the pact contracts relative to the current working directory, defaults to none  |
| `spec`   | false | number           | The pact specification version to use when writing pact contracts, defaults to '1' |
| `consumer`          | false  | string  | The name of the consumer to be written to the pact contracts, defaults to none |
| `provider`          | false  | string  |  The name of the provider to be written to the pact contracts, defaults to none |
| `pactFileWriteMode` | false  | `"overwrite" | "update" | "merge"`  | Control how the pact file is created. Defaults to "overwrite" |

#### List Mock Servers

If you ever need to see which servers are currently created.

```js
var pact = require('@pact-foundation/pact-node');
var servers = pact.listServers();
console.log(JSON.stringify(servers));
```

#### Remove All Mock Servers

Remove all servers once you're done with them in one fell swoop.

```js
var pact = require('@pact-foundation/pact-node');
pact.removeAllServers();
```

#### Start a Mock Server

Start the current server.

```js
var pact = require('@pact-foundation/pact-node');
pact.createServer().start().then(function(){
	// Do something after it started
});
```

#### Stop a Mock server

Stop the current server.

```js
var pact = require('@pact-foundation/pact-node');
pact.createServer().stop().then(function(){
	// Do something after it stopped
});
```

#### Delete a Mock server

Stop the current server and deletes it from the list.

```js
var pact = require('@pact-foundation/pact-node');
pact.createServer().delete().then(function(){
	// Do something after it was killed
});
```

#### Check if a Mock server is running

```js
var pact = require('@pact-foundation/pact-node');
pact.createServer().running;
```

#### Mock Server Events

There's 3 different events available, 'start', 'stop' and 'delete'.  They can be listened to the same way as an [EventEmitter](https://nodejs.org/api/events.html).

```js
var pact = require('@pact-foundation/pact-node');
var server = pact.createServer();
server.on('start', function() { console.log('started'); });
server.on('stop', function() { console.log('stopped'); });
server.on('delete', function() { console.log('deleted'); });
```

### Provider Verification

Read more about [Verify Pacts](https://github.com/realestate-com-au/pact/wiki/Verifying-pacts).

```js
var pact = require('@pact-foundation/pact-node');

pact.verifyPacts({
	...
});
```

**Options**:

|Parameter | Required?  | Type        | Description |
|----------|------------|-------------|-------------|
| `providerBaseUrl` | true | string |  Running API provider host endpoint. |
| `pactBrokerUrl` | false | string |  URL to fetch the pacts if pactUrls not supplied|
| `provider` | false | string |  Name of the provider if fetching from a Broker|
| `tags` | false | array |  Array of tags, used to filter pacts from the Broker|
| `pactUrls` | false | array |  Array of local Pact file paths or HTTP-based URLs (e.g. from a broker). Required if not using a Broker. |
| `providerStatesSetupUrl` | false | string |  URL to send PUT requests to setup a given provider state|
| `pactBrokerUsername` | false | string |  Username for Pact Broker basic authentication|
| `pactBrokerPassword` | false | string |  Password for Pact Broker basic authentication |
| `publishVerificationResult` | false | boolean |  Publish verification result to Broker |
| `customProviderHeaders` | false | array |  Header(s) to add to provider state set up and pact verification|  |`requests`. eg 'Authorization: Basic cGFjdDpwYWN0'.
| `providerVersion` | false | boolean |  Provider version, required to publish verification result to Broker. Optional otherwise.
| `timeout` | false | number |  The duration in ms we should wait to confirm verification process was successful. Defaults to 30000.


### Pact Broker Publishing


```js
var pact = require('@pact-foundation/pact-node');
var opts = {
	...
};

pact.publishPacts(opts).then(function () {
	// do something
});
```

**Options**:

|Parameter              | Required?  | Type        | Description |
|-----------------------|------------|-------------|-------------|
| `pactFilesOrDirs` 	| true  | array  | Array of local Pact files or directories containing them. Required. |
| `pactBroker` 			| true  | string | URL of the Pact Broker to publish pacts to. Required. |
| `consumerVersion` 	| true  | string | A string containing a semver-style version e.g. 1.0.0. Required. |
| `pactBrokerUsername`	| false | string | Username for Pact Broker basic authentication. Optional |
| `pactBrokerPassword` 	| false | string | Password for Pact Broker basic authentication. Optional, |
| `tags` 				| false | array  | An array of Strings to tag the Pacts being published. Optional |


### Stub Servers

Stub servers create runnable APIs from existing pact files.

The interface is comparable to the Mock Server API.

#### Create Stub Server

```js
var pact = require('@pact-foundation/pact-node');
var server = pact.createStub({
	...
});
```
**Options**:

|Parameter  | Required?  | Type        | Description |
|-----------|------------|-------------|-------------|
| pactUrls 	| true  |  array |  List of local Pact files to create the stub service from|
| port 		| false |  number |  Port number that the server runs on, defaults to random available port|
| host 		| false |  string |  Host on which to bind the server on, defaults to 'localhost'. Supports '0.0.0.0' to bind on all IPv4  addresses on the local machine.|
| log 		| false |  string |  File to log output on relative to current working directory, defaults to none|
| ssl 		| false |  boolean |  Create a self-signed SSL cert to run the server over HTTPS , defaults to 'false'|
| sslcert 	| false |  string |  Path to a custom self-signed SSL cert file, 'ssl' option must be set to true to use this option. Defaults false | to none|
| sslkey 	| false |  string |  Path a custom key and self-signed SSL cert key file, 'ssl' option must be set to true to use this option false. Defaults to none|
| cors 		| false |  boolean |  Allow CORS OPTION requests to be accepted, defaults to 'false'|


### Message Pacts
#### Create Message Pacts

```js
var pact = require('@pact-foundation/pact-node');
var server = pact.createMessage({
	...
});
```
**Options**:

|Parameter            | Required? | Type         | Description |
|---------------------|-----------|--------------|-------------|
| `dir`               | true      |  string      | Directory to write the pact contracts relative to the current working directory, defaults to none  |
| `consumer`          | true      | string       | The name of the consumer to be written to the pact contracts, defaults to none |
| `provider`          | false     | string       |  The name of the provider to be written to the pact contracts, defaults to none |
| `pactFileWriteMode` | false     | `"overwrite" | "update" | "merge"`  | Control how the pact file is created. Defaults to "overwrite" |

##### Example

```js
const messageFactory = messageFactory({
	consumer: "consumer",
	provider: "provider",
	dir: dirname(`${__filename}/pacts`),
	content: `{
		"description": "a test mesage",
		"content": {
			"name": "Mary"
		}
	}`
});

messageFactory.createMessage()
```

##### Example CLI invocation:

```sh
node ./bin/pact-cli.js message --pact-file-write-mode update --consumer foo --provider bar -d /tmp/pacts -c '{
  "description": "a test mesage",
  "content": {
    "name": "Mary"
  }
}'
```

## Contributing

To develop this project, simply install the dependencies and run `npm run watch` to for continual development, linting and testing when a source file changes.

## Testing

Running `npm test` will execute the tests that has the `*.spec.js` pattern.

## Questions?

Please search for potential answers or post question on our [official Pact StackOverflow](https://stackoverflow.com/questions/tagged/pact).
