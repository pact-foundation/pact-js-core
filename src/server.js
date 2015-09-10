'use strict';

var check = require('check-types'),
	path = require('path'),
	fs = require('fs'),
	cp = require('child_process'),
	events = require('events'),
	http = require('http'),
	https = require('https'),
	q = require('q');

events.EventEmitter.prototype._maxListeners = 10000;

var CHECKTIME = 500;

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
	var deferred = q.defer();

	// Wait for pact-mock-service to be initialized and ready
	var amount = 0;

	var done = function () {
		amount = 0;
		console.info('Pact started');
		deferred.resolve(this);
	}.bind(this);

	var check = function () {
		amount++;

		function retry() {
			if (amount >= 10) {
				deferred.reject(new Error("Pact startup failed; tried calling service 10 times with no result."));
			}
			setTimeout(check, CHECKTIME);
		}

		if (this.port) {
			(this.ssl ? https : http).request({
				host: this.host,
				port: this.port,
				path: '/',
				method: 'GET',
				headers: {
					'X-Pact-Mock-Service': true,
					'Content-Type': 'application/json'
				}
			}, done).on('error', retry).end();
		} else {
			retry();
		}
	}.bind(this);

	if (this.instance && this.instance.connected) {
		console.warn('You already have a process running with PID: ' + this.instance.pid);
		check();
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

	this.instance = cp.spawn(file, args, opts);

	this.instance.stdout.setEncoding('utf8');
	this.instance.stdout.on('data', console.log);
	this.instance.stderr.setEncoding('utf8');
	this.instance.stderr.on('data', console.log);
	this.instance.on('error', console.error);

	// if port isn't specified, listen for it when pact runs
	function catchPort(data) {
		var match = data.match(/port=([0-9]+)/);
		if (match[1]) {
			this.port = parseInt(match[1]);
			this.instance.stdout.removeListener('data', catchPort);
			this.instance.stderr.removeListener('data', catchPort);
		}
	}

	if (!this.port) {
		this.instance.stdout.on('data', catchPort.bind(this));
		this.instance.stderr.on('data', catchPort.bind(this));
	}

	console.info('Creating Pact with PID: ' + this.instance.pid);

	this.instance.on('close', function (code) {
		if (code !== 0) {
			console.warn('Pact exited with code ' + code + '.');
		}
		this.stop();
	}.bind(this));

	// Kill process on node exit
	process.once('exit', this.delete.bind(this));
	process.once('SIGINT', function () {
		process.exit();
	});

	// check service is available
	check();
	return deferred.promise;
};

Server.prototype.stop = function () {
	var deferred = q.defer();

	var amount = 0;
	var done = function () {
		amount = 0;
		deferred.resolve(this);
	}.bind(this);

	var check = function () {
		amount++;
		(this.ssl ? https : http).request({
			host: this.host,
			port: this.port,
			path: '/',
			method: 'GET',
			headers: {
				'X-Pact-Mock-Service': true,
				'Content-Type': 'application/json'
			}
		}, function () {
			if (amount >= 10) {
				deferred.reject(new Error("Pact stop failed; tried calling service 10 times with no result."));
			}
			setTimeout(check, CHECKTIME);
		}).on('error', done).end();
	}.bind(this);

	if (this.instance) {
		this.instance.removeAllListeners();
		if (process.platform === 'win32') {
			cp.execSync('taskkill /f /t /pid ' + this.instance.pid);
		} else {
			process.kill(-this.instance.pid, 'SIGKILL');
		}
		this.instance = undefined;
	}

	check();
	return deferred.promise;
};

Server.prototype.delete = function () {
	return this.stop().then(function () {
		this.emit('delete', this);
	}.bind(this));
};

module.exports = function (options) {
	options = options || {};

	// defaults
	options.port = options.port;
	options.ssl = options.ssl || false;
	options.cors = options.cors || false;
	// options.spec = options.spec || 1;
	options.dir = options.dir || process.cwd();
	// options.log = options.log || process.cwd();
	options.host = options.host || 'localhost';
	// options.consumer = options.consumer || 'consumer name';
	// options.provider = options.provider || 'provider name';

	// port checking
	if (options.port) {
		check.assert.number(options.port);
		check.assert.integer(options.port);
		check.assert.positive(options.port);
		check.assert.inRange(options.port, 0, 65535);

		if (check.not.inRange(options.port, 1024, 49151)) {
			console.warn("Like a Boss, you used a port range outside of the registered range (1024 to 49151); I too like to live dangerously.");
		}
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
		check.assert(fs.statSync(path.dirname(path.normalize(options.log))).isDirectory(), "Error on log, not a valid path");
	}

	// host check
	if (options.host) {
		check.assert.string(options.host);
	}

	// consumer name check
	if (options.consumer) {
		check.assert.string(options.consumer);
	}

	// provider name check
	if (options.provider) {
		check.assert.string(options.provider);
	}

	return new Server(options.port, options.host, options.dir, options.ssl, options.cors, options.log, options.spec, options.consumer, options.provider);
};
