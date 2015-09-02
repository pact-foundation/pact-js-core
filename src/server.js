'use strict';

var check = require('check-types'),
	path = require('path'),
	fs = require('fs'),
	cp = require('child_process'),
	events = require('events');

module.exports = function (options) {
	options = options || {};

	// defaults
	options.port = options.port || 9700;
	options.ssl = options.ssl || false;
	options.cors = options.cors || false;
	// options.spec = options.spec || 1;
	options.dir = options.dir || process.cwd();
	// options.log = options.log || process.cwd();
	options.host = options.host || 'localhost';
	// options.consumer = options.consumer || 'consumer name';
	// options.provider = options.provider || 'provider name';

	// port checking
	check.assert.number(options.port);
	check.assert.integer(options.port);
	check.assert.positive(options.port);
	check.assert.inRange(options.port, 0, 65535);

	if (check.not.inRange(options.port, 1024, 49151)) {
		console.warn("Like a Boss, you used a port range outside of the registered range (1024 to 49151); I too like to live dangerously.");
	}

	// ssl check
	check.assert.boolean(options.ssl);

	// cors check
	check.assert.boolean(options.cors);

	// spec checking
	if (options.spec) {
		check.assert.number(options.spec);
		check.assert.integer(options.spec);
		check.assert.positive(options.spec);
	}

	// dir check
	check.assert(fs.statSync(path.normalize(options.dir)).isDirectory(), "Error on directory, not a valid directory");

	// log check
	if (options.log) {
		check.assert(fs.statSync(path.normalize(options.log)).isFile(), "Error on log file, not a valid file");
	}

	return new Server(options.port, options.host, options.dir, options.ssl, options.cors, options.log, options.spec, options.consumer, options.provider);
};

function Server(port, host, dir, ssl, cors, log, spec, consumer, provider) {
	this.port = port;
	this.host = host;
	this.dir = dir;
	this.ssl = ssl;
	this.cors = cors;
	this.log = log;
	this.spec = spec;
	this.consumer = consumer;
	this.provider = provider;
}

Server.prototype = new events.EventEmitter;

Server.prototype.start = function () {
	if (this.process && this.process.connected) {
		console.warn('You already have a process running with PID: ' + this.process.pid);
		return;
	}
	var file,
		args = [],
		opts = {
			cwd: path.join(__dirname, '..', 'node_modules/.bin/'),
			detached: (process.platform !== 'win32')
		},
		mapping = {
			'port': '--port',
			'host': '--host',
			'log': '--log',
			'ssl': '--ssl',
			'cors': '--cors',
			'dir': '--pact_dir',
			'spec': '--pact_specification_version',
			'consumer': '--consumer',
			'provider': '--provider'
		};

	for (var key in mapping) {
		if (this[key]) {
			args.push(mapping[key] + ' ' + this[key]);
		}
	}

	var cmd = (process.platform !== 'win32' ? "./" : "") + "pact-mock-service " + args.join(' ');

	if (process.platform === 'win32') {
		file = 'cmd.exe';
		args = ['/s', '/c', cmd];
		opts.windowsVerbatimArguments = true;
	} else {
		file = '/bin/sh';
		args = ['-c', cmd];
	}


	this.process = cp.spawn(file, args, opts);

	this.process.stdout.setEncoding('utf8');
	this.process.stdout.on('data', console.log);
	this.process.stderr.setEncoding('utf8');
	this.process.stderr.on('data', console.error);
	this.process.on('error', console.error);


	this.process.on('close', function (code) {
		if (code !== 0) {
			console.warn('Pact exited with code ' + code + '.');
		}
		this.stop();
	}.bind(this));

	// Kill process on node exit
	process.once('exit', function () {
		this.delete();
	}.bind(this));

	return this;
};

Server.prototype.stop = function () {
	if (this.process) {
		if (process.platform === 'win32') {
			cp.execSync('taskkill /f /t /pid ' + this.process.pid);
		} else {
			process.kill(-this.process.pid, 'SIGKILL');
		}
	}
	this.process = undefined;
	return this;
};

Server.prototype.delete = function () {
	this.stop();
	this.emit('delete', this);
	return this;
};
