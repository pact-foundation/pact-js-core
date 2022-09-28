<img src="https://raw.githubusercontent.com/pact-foundation/pact-logo/master/media/logo-black.png" width="200">

| :information_source: Usage notice  |
|:-----------------------------------------|
| This is a core library, designed for use in the bowels of another package. Unless you are wanting to develop tools for the pact ecosystem, you almost certainly want to install [`@pact-foundation/pact`](https://github.com/pact-foundation/pact-js/) instead|

![Build and test](https://github.com/pact-foundation/pact-js-core/workflows/Build%20and%20test/badge.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/pact-foundation/pact-js-core/badge.svg?targetFile=package.json)](https://snyk.io/test/github/pact-foundation/pact-js-core?targetFile=package.json)
[![npm](https://img.shields.io/npm/v/@pact-foundation/pact-core.svg)](https://www.npmjs.com/package/@pact-foundation/pact-core)
[![license](https://img.shields.io/github/license/pact-foundation/pact-js-core.svg)](https://github.com/pact-foundation/pact-js-core/blob/master/LICENSE)
[![dependencies](https://img.shields.io/david/pact-foundation/pact-js-core.svg)](https://www.npmjs.com/package/@pact-foundation/pact-core)
[![slack](http://slack.pact.io/badge.svg)](http://slack.pact.io)

# Pact-JS Core

A wrapper for the [Pact](http://pact.io) [CLI Tools](https://github.com/pact-foundation/pact-ruby-standalone).

<!-- TOC -->

- [Pact-JS Core](#pact-js-core)
  - [Installation](#installation)
    - [Do Not Track](#do-not-track)
  - [Which Library/Package should I use?](#which-librarypackage-should-i-use)
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
    - [Pact Broker Deployment Check](#pact-broker-deployment-check)
    - [Stub Servers](#stub-servers)
      - [Create Stub Server](#create-stub-server)
    - [Message Pacts](#message-pacts)
      - [Create Message Pacts](#create-message-pacts)
        - [Example](#example)
  - [CLI Tools](#cli-tools)

<!-- /TOC -->

## Installation

`npm install @pact-foundation/pact-core --save-dev`

### Do Not Track

In order to get better statistics as to who is using Pact, we have an anonymous tracking event that triggers when Pact installs for the first time. To respect your privacy, anyone can turn it off by simply adding a 'do not track' flag within their package.json file:

```json
{
 "name": "some-project",
 ...
 "config": {
  "pact_do_not_track": true
 },
 ...
}
```

## Which Library/Package should I use?

TL;DR - you almost always want Pact JS.

| Purpose                   | Library   | Comments                                                                                                            |
| ------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------- |
| Synchronous / HTTP APIs   | Pact JS   |                                                                                                                     |
| Asynchronous APIs         | Pact JS   |                                                                                                                     |
| Node.js                   | Pact JS   |                                                                                                                     |
| Browser testing           | Pact Web  | You probably still want Pact JS. See [Using Pact in non-Node environments](https://github.com/pact-foundation/pact-js#using-pact-in-non-node-environments) \* |
| Isomorphic testing        | Pact Web  | You probably still want Pact JS. See [Using Pact in non-Node environments](https://github.com/pact-foundation/pact-js#using-pact-in-non-node-environments) \* |
| Publishing to Pact Broker | Pact Node | Included in Pact JS distribution                                                                                    |

\* The "I need to run it in the browser" question comes up occasionally. The question is this - for your JS code to be able to make a call to another API, is this dependent on browser-specific code? In most cases, people use tools like React/Angular which have libraries that work on the server and client side, in which case, these tests don't need to run in a browser and could instead be executed in a Node.js environment.

## Usage

Simply require the library and call the create function to start the mock service

```js
var pact = require("@pact-foundation/pact-core");
var server = pact.createServer({ port: 9999 });
server.start().then(function() {
 // Do your testing/development here
});
```

Or if you're using Typescript instead of plain old Javascript

```ts
import pact from "@pact-foundation/pact-core";
const server = pact.createServer({ port: 9999 });
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
var pact = require("@pact-foundation/pact-core");
pact.logLevel("debug");
```

### Mock Servers

Mock servers are used by Pact to record interactions and create pact contracts.

#### Create Mock Server

```js
var pact = require('@pact-foundation/pact-core');
var server = pact.createServer({
 ...
});
```

**Options:**

| Parameter           | Required? | Type                               | Description                                                                                                                          |
| ------------------- | --------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `port`              | false     | number                             | Port number that the server runs on, defaults to random available port                                                               |
| `host`              | false     | string                             | Host on which to bind the server on, defaults to 'localhost'. Supports '0.0.0.0' to bind on all IPv4 addresses on the local machine. |
| `log`               | false     | string                             | File to log output on relative to current working directory, defaults to none                                                        |
| `logLevel`    | false     | LogLevel (string)       | Log level to pass to the pact core. One of "DEBUG", "ERROR", "WARN", "INFO" |
| `ssl`               | false     | boolean                            | Create a self-signed SSL cert to run the server over HTTPS , defaults to `false`                                                     |
| `sslcert`           | false     | string                             | Path to a custom self-signed SSL cert file, 'ssl' option must be set to true to use this option, defaults to none                    |
| `sslkey`            | false     | string                             | Path a custom key and self-signed SSL cert key file, 'ssl' option must be set to true to use this, defaults to none                  |
| `cors`              | false     | boolean                            | Allow CORS OPTION requests to be accepted, defaults to 'false'                                                                       |
| `dir`               | false     | string                             | Directory to write the pact contracts relative to the current working directory, defaults to none                                    |
| `spec`              | false     | number                             | The pact specification version to use when writing pact contracts, defaults to '1'                                                   |
| `consumer`          | false     | string                             | The name of the consumer to be written to the pact contracts, defaults to none                                                       |
| `provider`          | false     | string                             | The name of the provider to be written to the pact contracts, defaults to none                                                       |
| `pactFileWriteMode` | false     | `overwrite` OR `update` OR `merge` | Control how the pact file is created. Defaults to "overwrite"                                                                        |
| `format`            | false     | `json` OR `xml`                    | Format to write the results as, either in JSON or XML, defaults to JSON                                                              |
| `out`               | false     | string                             | Write output to a file instead of returning it in the promise, defaults to none                                                      |
| `timeout`               | false     | number                             | How long to wait for the mock server to start up (in milliseconds). Defaults to 30000 (30 seconds)                                                      |

#### List Mock Servers

If you ever need to see which servers are currently created.

```js
var pact = require("@pact-foundation/pact-core");
var servers = pact.listServers();
console.log(JSON.stringify(servers));
```

#### Remove All Mock Servers

Remove all servers once you're done with them in one fell swoop.

```js
var pact = require("@pact-foundation/pact-core");
pact.removeAllServers();
```

#### Start a Mock Server

Start the current server.

```js
var pact = require("@pact-foundation/pact-core");
pact.createServer()
 .start()
 .then(function() {
  // Do something after it started
 });
```

#### Stop a Mock server

Stop the current server.

```js
var pact = require("@pact-foundation/pact-core");
pact.createServer()
 .stop()
 .then(function() {
  // Do something after it stopped
 });
```

#### Delete a Mock server

Stop the current server and deletes it from the list.

```js
var pact = require("@pact-foundation/pact-core");
pact.createServer()
 .delete()
 .then(function() {
  // Do something after it was killed
 });
```

#### Check if a Mock server is running

```js
var pact = require("@pact-foundation/pact-core");
pact.createServer().running;
```

#### Mock Server Events

There's 3 different events available, 'start', 'stop' and 'delete'. They can be listened to the same way as an [EventEmitter](https://nodejs.org/api/events.html).

```js
var pact = require("@pact-foundation/pact-core");
var server = pact.createServer();
server.on("start", function() {
 console.log("started");
});
server.on("stop", function() {
 console.log("stopped");
});
server.on("delete", function() {
 console.log("deleted");
});
```

### Provider Verification

Read more about [Verify Pacts](https://github.com/realestate-com-au/pact/wiki/Verifying-pacts).

```js
var pact = require('@pact-foundation/pact-core');

pact.verifyPacts({
 ...
});
```

**Options**:

| Parameter                   | Required? | Type    | Description                                                                                                |
| --------------------------- | --------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `providerBaseUrl`           | true      | string  | Running API provider host endpoint.                                                                        |
| `pactBrokerUrl`         | false     | string  | Base URL of the Pact Broker from which to retrieve the pacts. Required if `pactUrls` not given.                                                                        |
| `provider`                  | false     | string  | Name of the provider if fetching from a Broker                                                             |
| `consumerVersionSelectors`        | false     | ConsumerVersionSelector\|array  | Use [Selectors](https://docs.pact.io/pact_broker/advanced_topics/consumer_version_selectors) to is a way we specify which pacticipants and versions we want to use when configuring verifications.                                                         |
| `consumerVersionTags`        | false     | string\|array  | Retrieve the latest pacts with given tag(s)                                                        |
| `providerVersionTags`        | false     | string\|array  |  Tag(s) to apply to the provider application |
| `includeWipPactsSince`      | false     | string  | Includes pact marked as WIP since this date. String in the format %Y-%m-%d or %Y-%m-%dT%H:%M:%S.000%:z |
| `pactUrls`                  | false     | array   | Array of local pact file paths or HTTP-based URLs. Required if _not_ using a Pact Broker.                  |
| `providerStatesSetupUrl`    | false     | string  | URL to send PUT requests to setup a given provider state                                                   |
| `pactBrokerUsername`        | false     | string  | Username for Pact Broker basic authentication                                                              |
| `pactBrokerPassword`        | false     | string  | Password for Pact Broker basic authentication                                                              |
| `pactBrokerToken`           | false     | string  | Bearer token for Pact Broker authentication                                                              |
| `publishVerificationResult` | false     | boolean | Publish verification result to Broker (_NOTE_: you should only enable this during CI builds)               |
| `providerVersion`           | false     | string  | Provider version, required to publish verification result to Broker. Optional otherwise.                   |
| `enablePending`                   | false     | boolean  | Enable the [pending pacts](https://docs.pact.io/pending) feature.       |
| `timeout`                   | false     | number  | The duration in ms we should wait to confirm verification process was successful. Defaults to 30000.       |
| `logLevel`    | false     | LogLevel (string)          | Log level. One of "TRACE", "DEBUG", "ERROR", "WARN", "INFO" |

The consumer version selector looks like this:

```
ConsumerVersionSelector {
  tag?: string;
  latest?: boolean;
  consumer?: string;
  deployedOrReleased?: boolean;
  deployed?: boolean; 
  released?: boolean; 
  environment?: string;
  fallbackTag?: string;
  branch?: string;
  mainBranch?: boolean;
  matchingBranch?: boolean;
}
```

See the [Pact Broker documentation on selectors](https://docs.pact.io/pact_broker/advanced_topics/consumer_version_selectors) for more information.

### Pact Broker Publishing

```js
var pact = require('@pact-foundation/pact-core');
var opts = {
 ...
};

pact.publishPacts(opts).then(function () {
 // do something
});
```

**Options**:

| Parameter            | Required? | Type   | Description                                                         |
| -------------------- | --------- | ------ | ------------------------------------------------------------------- |
| `pactFilesOrDirs`    | true      | array  | Array of local Pact files or directories containing them. Required. |
| `pactBroker`         | true      | string | URL of the Pact Broker to publish pacts to. Required.               |
| `consumerVersion`    | true      | string | A string containing a semver-style version e.g. 1.0.0. Required.    |
| `pactBrokerUsername` | false     | string | Username for Pact Broker basic authentication. Optional             |
| `pactBrokerPassword` | false     | string | Password for Pact Broker basic authentication. Optional             |
| `pactBrokerToken`    | false     | string | Bearer token for Pact Broker authentication. Optional               |
| `tags`               | false     | array  | An array of Strings to tag the Pacts being published. Optional      |
| `branch`               | false     | string  | The branch to associate with the published pacts. Optional but recommended      |
| `autoDetectVersionProperties`               | false     | boolean  | Automatically detect the repository branch from known CI environment variables or git CLI. Supports Buildkite, Circle CI, Travis CI, GitHub Actions, Jenkins, Hudson, AppVeyor, GitLab, CodeShip, Bitbucket and Azure DevOps. Optional      |
| `buildUrl`           | false     | string | The build URL that created the pact. Optional                       |
| `verbose`           |  false  | boolean | Enables verbose output for underlying pact binary. |

### Pact Broker Deployment Check

```js
var pact = require('@pact-foundation/pact-core');
var opts = {
 ...
};

pact.canDeploy(opts)
 .then(function (result) {
  // You can deploy this
    // If output is not specified or is json, result describes the result of the check.
    // If outout is 'table', it is the human readable string returned by the check
 })
 .catch(function(error) {
  // You can't deploy this
    // if output is not specified, or is json, error will be an object describing
    // the result of the check (if the check failed),
    // if output is 'table', then the error will be a string describing the output from the binary,

    // In both cases, `error` will be an Error object if something went wrong during the check.
 });
```

**Options**:

| Parameter            | Required? | Type        | Description                                                                         |
| -------------------- | --------- | ----------- | ----------------------------------------------------------------------------------- |
| `pacticipants`       | true      | []objects      | An array of version [selectors](docs.pact.io/selectors) in the form `{ name: String, latest?: string | boolean, version?: string }` |
|                      |           |             | specify a tag, use the tagname with latest. Specify one of these per pacticipant    |
|                      |           |             | that you want to deploy                                                             |
| `pactBroker`         | true      | string      | URL of the Pact Broker to query about deployment. Required.                         |
| `pactBrokerUsername` | false     | string      | Username for Pact Broker basic authentication. Optional                             |
| `pactBrokerPassword` | false     | string      | Password for Pact Broker basic authentication. Optional                             |
| `pactBrokerToken`    | false     | string      | Bearer token for Pact Broker authentication. Optional                               |
| `output`             | false     | json,table  | Specify output to show, json or table. Optional, Defaults to json.                  |
| `verbose`            | false     | boolean | Enables verbose output for underlying pact binary.                                          |
| `retryWhileUnknown`  | false     | number      | The number of times to retry while there is an unknown verification result. Optional|
| `retryInterval`      | false     | number      | The time between retries in seconds, use with retryWhileUnknown. Optional           |
| `to`                 | false     | string      | The tag that you want to deploy to (eg, 'prod')                                     |

### Stub Servers

Stub servers create runnable APIs from existing pact files.

The interface is comparable to the Mock Server API.

#### Create Stub Server

```js
var pact = require('@pact-foundation/pact-core');
var server = pact.createStub({
 ...
});
```

**Options**:

| Parameter | Required? | Type    | Description                                                                                                                          |
| --------- | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| pactUrls  | true      | array   | List of local Pact files to create the stub service from                                                                             |
| port      | false     | number  | Port number that the server runs on, defaults to random available port                                                               |
| host      | false     | string  | Host on which to bind the server on, defaults to 'localhost'. Supports '0.0.0.0' to bind on all IPv4 addresses on the local machine. |
| log       | false     | string  | File to log output on relative to current working directory, defaults to none                                                        |
| logLevel    | false     | LogLevel (string)       | Log level to pass to the pact core. One of "DEBUG", "ERROR", "WARN", "INFO" |
| ssl       | false     | boolean | Create a self-signed SSL cert to run the server over HTTPS , defaults to 'false'                                                     |
| sslcert   | false     | string  | Path to a custom self-signed SSL cert file, 'ssl' option must be set to true to use this option. Defaults false                      | to none |
| sslkey    | false     | string  | Path a custom key and self-signed SSL cert key file, 'ssl' option must be set to true to use this option false. Defaults to none     |
| cors      | false     | boolean | Allow CORS OPTION requests to be accepted, defaults to 'false'                                                                       |
| timeout               | false     | number                             | How long to wait for the stub server to start up (in milliseconds). Defaults to 30000 (30 seconds)                                                      |

### Message Pacts

#### Create Message Pacts

```js
var pact = require('@pact-foundation/pact-core');
var message = pact.createMessage({
 ...
});
```

**Options**:

| Parameter           | Required? | Type                               | Description                                                                                       |
| ------------------- | --------- | ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| `dir`               | true      | string                             | Directory to write the pact contracts relative to the current working directory, defaults to none |
| `consumer`          | true      | string                             | The name of the consumer to be written to the pact contracts, defaults to none                    |
| `provider`          | true      | string                             | The name of the provider to be written to the pact contracts, defaults to none                    |
| `pactFileWriteMode` | false     | `"overwrite" | "update" | "merge"` | Control how the pact file is created. Defaults to "update"                                        |

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

messageFactory.createMessage();
```

## CLI Tools

This package also comes with the [Pact Standalone Tools](https://github.com/pact-foundation/pact-ruby-standalone/releases) available as linked binaries in the [standard](https://docs.npmjs.com/files/folders#executables) NPM installation directory (e..g. `./node_modules/.bin`).

This means you may call them direct from scripts in your package json, for example:

```
"scripts": {
  "pactPublish": "pact-broker publish ./pacts --consumer-app-version=$\(git describe\) --broker-base-url=$BROKER_BASE_URL --broker-username=$BROKER_USERNAME --broker-password=BROKER_PASSWORD"`
}
These are available in circumstances where `pact-core` has not yet implemented a feature or access via JavaScript APIs is not desirable. To run the binaries is as simple as the following:

*Example can-i-deploy check*:
```sh
./node_modules/.bin/pact-broker can-i-deploy --pacticipant "Banana Service" --broker-base-url https://test.pact.dius.com.au --latest --broker-username dXfltyFMgNOFZAxr8io9wJ37iUpY42M --broker-password O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1

Computer says no ¯\_(ツ)_/¯

CONSUMER       | C.VERSION | PROVIDER       | P.VERSION | SUCCESS?
---------------|-----------|----------------|-----------|---------
Banana Service | 1.0.0     | Fofana Service | 1.0.0     | false

The verification between the latest version of Banana Service (1.0.0) and version 1.0.0 of Fofana Service failed
```

The following are the binaries currently made available:

- `pact-mock-service`
- `pact-broker`
- `pact-stub-service`
- `pact-message`
- `pact-provider-verifier`
- `pact`

## Windows Issues

### Enable Long Paths

[Windows has a default path length limit of 260](https://docs.microsoft.com/en-us/windows/desktop/fileio/naming-a-file#maximum-path-length-limitation) causing issues with projects that are nested deep inside several directory and with how npm handles node_modules directory structures.  To fix this issue, please enable Windows Long Paths in the registry by running `regedit.exe`, find the key `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem\LongPathsEnabled` and change the value from `0` to `1`, then reboot your computer.  Pact should now work as it should, if not, please [raise an issue on github](https://github.com/pact-foundation/pact-js-core/issues).

## Contributing

To develop this project, simply install the dependencies with `npm install --ignore-scripts`, and run `npm run watch` to for continual development, linting and testing when a source file changes.

## Testing

Running `npm test` will execute the tests that has the `*.spec.js` pattern.

## Questions?

Please search for potential answers or post question on our [official Pact StackOverflow](https://stackoverflow.com/questions/tagged/pact).
