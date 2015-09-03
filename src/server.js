'use strict';

var check = require('check-types'),
	path = require('path'),
	fs = require('fs'),
	cp = require('child_process'),
	events = require('events'),
	http = require('http'),
	https = require('https'),
	noop = function(){};

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

Server.prototype.start = function (callback) {
	callback = callback || noop;

	// Wait for pact-mock-service to be initialized and ready
	var amount = 0;

	var done = function () {
		amount = 0;
		console.info('Pact started');
		callback(this);
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
		}, done).on('error', function () {
			if (amount >= 10) {
				throw "Pact setup failed; tried calling service 10 times with no result.";
			}
			setTimeout(check, 1000);
		}).end();
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
	this.instance.stderr.on('data', console.error);
	this.instance.on('error', console.error);

	console.info('Creating Pact with PID: ' + this.instance.pid);

	this.instance.on('close', function (code) {
		if (code !== 0) {
			console.warn('Pact exited with code ' + code + '.');
		}
		this.stop();
	}.bind(this));

	// Kill process on node exit
	process.once('exit', this.delete);
	process.once('SIGINT', function() {
		process.exit();
	});

	// check service is available
	check();
};

Server.prototype.stop = function (callback) {
	callback = callback || noop;
	if (this.instance) {
		console.info('Node exiting, killing Pact');
		this.instance.removeAllListeners();
		if (process.platform === 'win32') {
			cp.execSync('taskkill /f /t /pid ' + this.instance.pid);
		} else {
			process.kill(-this.instance.pid, 'SIGKILL');
		}
		this.instance = undefined;
	}
	// TODO: add check here to make sure service is down before calling callback
	callback(this);
};

Server.prototype.delete = function (callback) {
	callback = callback || noop;
	this.stop(function(){
		this.emit('delete', this);
		callback(this);
	}.bind(this));
};
