'use strict';

var check = require('check-types'),
	serverFactory = require('./server'),
	q = require('q');

var servers = [];

function create(options) {

	// TODO: iterate through servers, look for port conflicts
	var server = serverFactory(options);
	servers.push(server);

	// Listen to serverFactory events
	function deleteFunc(server) {
		for (var i = 0, len = servers.length; i < len; i++) {
			if (servers[i] === server) {
				servers.splice(i, 1);
				break;
			}
		}
		server.removeListener('delete', deleteFunc);
	}
	server.on('delete', deleteFunc);

	return server;
}

function list() {
	return servers;
}

function removeAll() {
	return q.all(servers.map(function (server) {
		return server.delete();
	}));
}

module.exports = {
	create: create,
	list: list,
	removeAll: removeAll
};
