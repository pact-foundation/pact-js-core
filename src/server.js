'use strict';

var check = require('check-types'),
	restify = require('restify');

module.exports = function (name, port) {
	check.assert.number(port);
	check.assert.integer(port);
	check.assert.positive(port);
	check.assert.inRange(port, 0, 65535);

	if (check.not.inRange(port, 1024, 49151)) {
		console.warn("Like a Boss, you used a port range outside of the registered range (1024 to 49151); I too like to live dangerously.");
	}

	return new Server(name, port);
};

function Server(_name, _port) {
	var name = _name,
		port = _port,
		instance = restify.createServer({name: _name});
}

Server.prototype.start = function () {
	this.instance.listen(this.port);
};

Server.prototype.stop = function () {
	this.instance.close();
};
