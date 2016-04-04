'use strict';

var logger = require('./logger'),
	_ = require('underscore'),
	serverFactory = require('./server'),
	q = require('q');

var servers = [];

// Creates server with specified options
function create(options) {
	if (options && options.port && _.some(servers, function(s) { return s.options.port == options.port })) {
		var msg = 'Port `' + options.port + '` is already in use by another Pact server.';
		logger.error(msg);
		throw new Error(msg);
	}

	var server = serverFactory(options);
	servers.push(server);
	logger.info('Creating Pact Server with options: ' + JSON.stringify(server.options));

	// Listen to server delete events, to remove from server list
	server.once('delete', function (server) {
		logger.info('Deleting Pact Server with options: ' + JSON.stringify(server.options));
		servers = _.without(servers, server);
	});

	return server;
}

// Return arrays of all servers
function list() {
	return servers;
}

// Remove all the servers that's been created
// Return promise of all others
function removeAll() {
	logger.info('Removing all Pact servers.');
	return q.all(_.map(servers, function (server) {
		return server.delete();
	}));
}


// Listen for Node exiting or someone killing the process
// Must remove all the instances of Pact mock service
process.once('exit', removeAll);
process.once('SIGINT', process.exit);

module.exports = {
	create: create,
	list: list,
	removeAll: removeAll
};
