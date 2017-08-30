#!/usr/bin/env node

import pact from "../src/pact";
import program = require("commander");

const pkg = require("./../package.json");

program
	.version(pkg.version)
	.option("-b, --provider-base-url <URL>", "The Pact Provider base URL.")
	.option("-u, --pact-urls <URIs>", "Comma separated list of Pact files or URIs")
	.option("-f, --provider-states-url <URL>", "URL to fetch provider states from")
	.option("-s, --provider-states-setup-url <URL>", "URL to set a provider state")
	.option("-n, --broker-username <user>", "Pact Broker username")
	.option("-p, --broker-password <password>", "Pact Broker password")
	.parse(process.argv);

pact.verifyPacts(program);
