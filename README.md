<img src="https://raw.githubusercontent.com/pact-foundation/pact-logo/master/media/logo-black.png" width="200">

| :information_source: Usage notice  |
|:-----------------------------------------|
| This is a core library, designed for use in the bowels of another package. Unless you are wanting to develop tools for the pact ecosystem, you almost certainly want to install [`@pact-foundation/pact`](https://github.com/pact-foundation/pact-js/) instead|

![Build and test](https://github.com/pact-foundation/pact-js-core/workflows/Build%20and%20test/badge.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/pact-foundation/pact-js-core/badge.svg?targetFile=package.json)](https://snyk.io/test/github/pact-foundation/pact-js-core?targetFile=package.json)
[![GitHub release](https://img.shields.io/github/release/pact-foundation/pact-js-core)](https://github.com/pact-foundation/pact-js-core)
[![npm](https://img.shields.io/npm/v/@pact-foundation/pact-core.svg)](https://www.npmjs.com/package/@pact-foundation/pact-core)
[![license](https://img.shields.io/github/license/pact-foundation/pact-js-core.svg)](https://github.com/pact-foundation/pact-js-core/blob/master/LICENSE)
[![slack](http://slack.pact.io/badge.svg)](http://slack.pact.io)


[![Npm package license](https://badgen.net/npm/license/@pact-foundation/pact-core)](https://npmjs.com/package/@pact-foundation/pact-core)
[![Npm package version](https://badgen.net/npm/v/@pact-foundation/pact-core)](https://npmjs.com/package/@pact-foundation/pact-core)
[![Minimum node.js version](https://badgen.net/npm/node/@pact-foundation/pact-core)](https://npmjs.com/package/@pact-foundation/pact-core)

[![Npm package total downloads](https://badgen.net/npm/dt/@pact-foundation/pact-core)](https://npmjs.com/package/@pact-foundation/pact-core)

[![Npm package yearly downloads](https://badgen.net/npm/dy/@pact-foundation/pact-core)](https://npmjs.com/package/@pact-foundation/pact-core)
[![Npm package monthly downloads](https://badgen.net/npm/dm/@pact-foundation/pact-core)](https://npmjs.com/package/@pact-foundation/pact-core)
[![Npm package daily downloads](https://badgen.net/npm/dd/@pact-foundation/pact-core)](https://npmjs.com/package/@pact-foundation/pact-core)

[![Npm package dependents](https://badgen.net/npm/dependents/@pact-foundation/pact-core)](https://npmjs.com/package/@pact-foundation/pact-core)

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/pact-foundation/pact-js-core/graphs/commit-activity)

[![Build and test](https://github.com/pact-foundation/pact-js-core/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/pact-foundation/pact-js-core/actions/workflows/build-and-test.yml)
[![Publish and release](https://github.com/pact-foundation/pact-js-core/actions/workflows/publish.yml/badge.svg)](https://github.com/pact-foundation/pact-js-core/actions/workflows/publish.yml)

# Pact-JS Core

A wrapper for the [Pact](http://pact.io) [Reference Core Library](https://github.com/pact-foundation/pact-reference).

<!-- TOC -->

- [Pact-JS Core](#pact-js-core)
  - [Installation](#installation)
    - [Do Not Track](#do-not-track)
  - [Which Library/Package should I use?](#which-librarypackage-should-i-use)
  - [Documentation](#documentation)
    - [Set Log Level](#set-log-level)
    - [Provider Verification](#provider-verification)
  - [Contributing](#contributing)
  - [Testing](#testing)
  - [Questions?](#questions)

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
| Publishing to Pact Broker | Pact CLI  |                                                                                     |

\* The "I need to run it in the browser" question comes up occasionally. The question is this - for your JS code to be able to make a call to another API, is this dependent on browser-specific code? In most cases, people use tools like React/Angular which have libraries that work on the server and client side, in which case, these tests don't need to run in a browser and could instead be executed in a Node.js environment.

## Documentation

### Set Log Level

```js
var pact = require("@pact-foundation/pact-core");
pact.logLevel("debug");
```

### Provider Verification

Read more about [Verify Pacts](https://docs.pact.io/implementation_guides/ruby/verifying_pacts).

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
| `logLevel`    | false     | LogLevel (string)          | Log level. One of "TRACE", "DEBUG", "ERROR", "WARN", "INFO", can be set by LOG_LEVEL env var |

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

## Contributing

To develop this project, simply install the dependencies with `npm install --ignore-scripts`, and run `npm run watch` to for continual development, linting and testing when a source file changes.

## Testing

Running `npm test` will execute the tests that has the `*.spec.js` pattern.

## Questions?

Please search for potential answers or post question on our [official Pact StackOverflow](https://stackoverflow.com/questions/tagged/pact).
