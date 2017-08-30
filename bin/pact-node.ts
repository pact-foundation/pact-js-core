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
	.version(pkg.version)
	.option("-p, --port <n>", "Port on which to run the service. Default is port 1234.", parseInt)
	.option("-h, --host <hostname>", "Host on which to bind the service. Default is localhost.")
	.option("-l, --log <file>", "File to which to log output to. Default is none.")
	.option("-s, --ssl [boolean]", "Use a self-signed SSL cert to run the service over HTTPS. Default uses HTTP.", parseBoolean)
	.option("-o, --cors [boolean]", "Support browser security in tests by responding to OPTIONS requests and adding CORS headers to mocked responses. Default is false.", parseBoolean)
	.option("-d, --pact-dir <directory>", "Directory to which the pacts will be written.")
	.option("-i, --pact-version <n>", "The Pact specification version to use when writing the Pact files. Default is 1.", parseInt)
	.option("--consumer <consumerName>", "Specify consumer name for written Pact files. Default is none.")
	.option("--provider <providerName>", "Specify provider name for written Pact files. Default is none.")
	.parse(process.argv);

pact.createServer(program).start();
