#!/usr/bin/env node

import pact from "../src/pact";
const cli = require("caporal");
const pkg = require("../package.json");

cli
	.name("pact")
	.bin("pact")
	.description("Pact CLI tool")
	.version(pkg.version);

// TODO: add 'arguments' for required information on commands instead of using 'option' to be more consistent with standalone

cli
	.command("mock")
	.description("Creates a pact mock service to start contract testing")
	.option("-p, --port <n>", "Port on which to run the service. Default is random.", cli.INT)
	.option("-h, --host <hostname>", "Host on which to bind the service. Default is localhost.")
	.option("-l, --log <file>", "File to which to log output to.")
	.option("-s, --ssl <boolean>", "Use a self-signed SSL cert to run the service over HTTPS. Default is false (HTTP).", cli.BOOL)
	.option("-o, --cors <boolean>", "Support browser security in tests by responding to OPTIONS requests and adding CORS headers to mocked responses. Default is false.", cli.BOOL)
	.option("-d, --pact-dir <directory>", "Directory to which the pacts will be written. Default is cwd.")
	.option("-i, --pact-version <n>", "The Pact specification version to use when writing the Pact files. Default is 1.", cli.INT)
	.option("-w, --pact-file-write-mode <m>", "Controls how pact files are written to disk. One of 'overwrite', 'update', 'merge'", /^overwrite|update|merge$/)
	.option("--consumer <consumerName>", "Specify consumer name for written Pact files.")
	.option("--provider <providerName>", "Specify provider name for written Pact files.")
	.action((args: any, options: any) => pact.createServer(options).start());

cli
	.command("verify")
	.description("Verifies Pact Contracts on the current provider")
	.option("-b, --provider-base-url <URL>", "The Pact Provider base URL.")
	.option("-u, --pact-urls <URLs>", "Comma separated list of Pact files or URIs.", cli.LIST)
	.option("-p, --provider <name>", "Name of the Provider to verify. Required if not using --pact-urls.")
	.option("-bu, --pact-broker-url <URL>", "URL of the Pact Broker to retrieve pacts from. Required if not using --pact-urls.")
	.option("-ps, --provider-states-setup-url <URL>", "URL to set a provider state.")
	.option("-username, --pact-broker-username <user>", "Pact Broker username.")
	.option("-password, --pact-broker-password <password>", "Pact Broker password.")
	.option("-v, --provider-version <version>", "Provider version, required to publish verification result to Broker.")
	.option("-t, --timeout <milliseconds>", "The duration in ms we should wait to confirm verification process was successful. Defaults to 30000.", cli.INT)
	.option("-pub, --publish-verification-result", "Publish verification result to Broker.")
	.option("-c, --custom-provider-header", "Header to add to provider state set up and pact verification requests. eg 'Authorization: Basic cGFjdDpwYWN0'.", cli.LIST)
	.action((args: any, options: any) => pact.verifyPacts(options));

cli
	.command("publish")
	.description("Publishes Pact Contracts to the broker")
	.option("-p, --pact-files-or-dirs <paths>", "Comma separated list of Pact file or directory paths", cli.LIST, null, true)
	.option("-c, --consumer-version <version>", "Semver-style version of the consumer e.g. 1.0.0.", /^\d+\.\d+\.\d+$/, null, true)
	.option("-b, --pact-broker <URL>", "URL of the Pact Broker to publish pacts to.")
	.option("-username, --pact-broker-username <user>", "Pact Broker username.")
	.option("-password, --pact-broker-password <password>", "Pact Broker password.")
	.option("-t, --tags <tags>", "Comma separated list of tags to attach to the Pact Contracts being published", cli.LIST)
	.action((args: any, options: any) => pact.publishPacts(options));

cli.parse(process.argv);
