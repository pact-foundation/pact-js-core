#!/usr/bin/env node

import pact from "../src/pact";
import program = require("commander");

const pkg = require("../package.json");

function parseBoolean(b: string): boolean {
	switch (b) {
		case "true":
			return true;
		case "false":
			return false;
	}
	return null;
}

program
	.name("pact")
	.version(pkg.version)
	.usage("<command> [options]");

program
	.command("mock")
	.description("Creates a pact mock service to start contract testing")
	.option("-p, --port [n]", "Port on which to run the service. Default is port 1234.", parseInt)
	.option("-h, --host [hostname]", "Host on which to bind the service. Default is localhost.")
	.option("-l, --log [file]", "File to which to log output to. Default is none.")
	.option("-s, --ssl [boolean]", "Use a self-signed SSL cert to run the service over HTTPS. Default is false (HTTP).", parseBoolean)
	.option("-o, --cors [boolean]", "Support browser security in tests by responding to OPTIONS requests and adding CORS headers to mocked responses. Default is false.", parseBoolean)
	.option("-d, --pact-dir [directory]", "Directory to which the pacts will be written. Default is cwd.")
	.option("-i, --pact-version [n]", "The Pact specification version to use when writing the Pact files. Default is 1.", parseInt)
	.option("--consumer [consumerName]", "Specify consumer name for written Pact files. Default is none.")
	.option("--provider [providerName]", "Specify provider name for written Pact files. Default is none.")
	.action((cmd, options) => pact.createServer(options).start());

program
	.command("verify")
	.description("Verifies Pact Contracts on the current provider")
	.option("-b, --provider-base-url <URL>", "The Pact Provider base URL.")
	.option("-u, --pact-urls [URIs]", "Comma separated list of Pact files or URIs")
	.option("-f, --provider-states-url [URL]", "URL to fetch provider states from")
	.option("-s, --provider-states-setup-url [URL]", "URL to set a provider state")
	.option("-bu, --broker-username [user]", "Pact Broker username")
	.option("-bp, --broker-password [password]", "Pact Broker password")
	.action((cmd, options) => pact.verifyPacts(options));

program.parse(process.argv);
