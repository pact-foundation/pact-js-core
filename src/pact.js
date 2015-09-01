'use strict';

var check = require('check-types'),
	serverFactory = require('./server');

var servers = {};

function create(name, port) {
	if(servers[port]) {
		return new Error('Wow, much port conflict, many sads. '+port);
	}

	var server = serverFactory(name, port);
	servers[port] = server;

	return server;
}

function remove(port) {

}

function get(port) {
	return servers[port];
}

function exists(port) {
	return get(port) !== undefined;
}

function list() {
	return servers;
}

module.exports = {
	create: create,
	remove: remove,
	get: get,
	exists: exists,
	list: list
};