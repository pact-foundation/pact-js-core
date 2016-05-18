'use strict';

var logger = require('./logger'),
	_ = require('underscore'),
	serverFactory = require('./server'),
	verifierFactory = require('./verifier'),
	publisherFactory = require('./publisher'),
	q = require('q');

var servers = [];

function stringify(obj) {
	var arr = [];
	for(var k in obj) {
		if(obj[k] !== undefined) {
			arr.push(k + '=' + obj[k]);
		}
	}
	return arr.join(', ');
}

// Creates server with specified options
function createServer(options) {
	if (options && options.port && _.some(servers, function(s) { return s.options.port == options.port })) {
		var msg = 'Port `' + options.port + '` is already in use by another Pact server.';
		logger.error(msg);
		throw new Error(msg);
	}

	var server = serverFactory(options);
	servers.push(server);
	logger.info('Creating Pact Server with options: ' + stringify(server.options));

	// Listen to server delete events, to remove from server list
	server.once('delete', function (server) {
		logger.info('Deleting Pact Server with options: ' + stringify(server.options));
		servers = _.without(servers, server);
	});

	return server;
}

// Return arrays of all servers
function listServers() {
	return servers;
}

// Remove all the servers that's been created
// Return promise of all others
function removeAllServers() {
	logger.info('Removing all Pact servers.');
	return q.all(_.map(servers, function (server) {
		return server.delete();
	}));
}

// Run the Pact Verification process
function verifyPacts(options) {
	logger.info('Verifying Pacts.');
	return verifierFactory(options).verify();
}

// Publish Pacts to a Pact Broker
function publishPacts(options) {
	logger.info('Publishing Pacts to Broker');
	return publisherFactory(options).publish();
}

// Listen for Node exiting or someone killing the process
// Must remove all the instances of Pact mock service
process.once('exit', removeAllServers);
process.once('SIGINT', process.exit);

module.exports = {
	createServer: createServer,
	listServers: listServers,
	removeAllServers: removeAllServers,
	verifyPacts: verifyPacts,
	publishPacts: publishPacts,
};
