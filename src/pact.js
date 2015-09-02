'use strict';

var check = require('check-types'),
	serverFactory = require('./server');

var servers = [];

function create(options) {

	var server = serverFactory(options);
	servers.push(server);

	// Listen to server events
	server.once("delete", function(server) {
		remove(server);
	});

	return server;
}

function list() {
	return servers;
}

function remove(server) {
	for (var i = 0, len = servers.length; i < len; i++) {
		if (servers[i] === server) {
			server.splice(i, 1);
			server.removeAllListeners();
			break;
		}
	}
}

module.exports = {
	create: create,
	list: list
};
