'use strict';

var checkTypes = require('check-types'),
	_ = require('underscore'),
	logger = require('./logger'),
	path = require('path'),
	fs = require('fs'),
	cp = require('child_process'),
	eventEmitter = require('events').EventEmitter,
	http = require('request'),
	q = require('q'),
	util = require('util'),
	pactPath = require('@pact-foundation/pact-mock-service'),
	mkdirp = require('mkdirp'),
	isWindows = process.platform === 'win32';

var CHECKTIME = 500;

// Constructor
function Server(port, host, dir, ssl, cors, log, spec, consumer, provider) {
	this.options = {};
	this.options.port = port;
	this.options.host = host;
	this.options.dir = dir;
	this.options.ssl = ssl;
	this.options.cors = cors;
	this.options.log = log;
	this.options.spec = spec;
	this.options.consumer = consumer;
	this.options.provider = provider;
	this.$running = false;
}

util.inherits(Server, eventEmitter);

// Let the mocking begin!
Server.prototype.start = function () {
	if (this.instance && this.instance.connected) {
		logger.warn('You already have a process running with PID: ' + this.instance.pid);
		return;
	}
	
	var envVars = JSON.parse(JSON.stringify(process.env)); // Create copy of environment variables
	// Remove environment variable if there
	// This is a hack to prevent some weird Travelling Ruby behaviour with Gems
	// https://github.com/pact-foundation/pact-mock-service-npm/issues/16
	delete envVars['RUBYGEMS_GEMDEPS'];
	var file,
		opts = {
			cwd: pactPath.cwd,
			detached: !isWindows,
			env: envVars
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
	
	var args = _.compact(_.map(mapping, (function (value, key) {
		return this.options[key] ? value + ' ' + this.options[key] : null;
	}).bind(this)));
	
	var cmd = [pactPath.file].concat(args).join(' ');
	
	if (isWindows) {
		file = 'cmd.exe';
		args = ['/s', '/c', cmd];
		opts.windowsVerbatimArguments = true;
	} else {
		cmd = './' + cmd;
		file = '/bin/sh';
		args = ['-c', cmd];
	}
	
	this.instance = cp.spawn(file, args, opts);
	
	this.instance.stdout.setEncoding('utf8');
	this.instance.stdout.on('data', logger.debug.bind(logger));
	this.instance.stderr.setEncoding('utf8');
	this.instance.stderr.on('data', logger.debug.bind(logger));
	this.instance.on('error', logger.error.bind(logger));
	
	// if port isn't specified, listen for it when pact runs
	function catchPort(data) {
		var match = data.match(/port=([0-9]+)/);
		if (match && match[1]) {
			this.options.port = parseInt(match[1]);
			this.instance.stdout.removeListener('data', catchPort.bind(this));
			this.instance.stderr.removeListener('data', catchPort.bind(this));
		}
	}
	
	if (!this.options.port) {
		this.instance.stdout.on('data', catchPort.bind(this));
		this.instance.stderr.on('data', catchPort.bind(this));
	}
	
	logger.info('Creating Pact with PID: ' + this.instance.pid);
	
	this.instance.once('close', (function (code) {
		if (code !== 0) {
			logger.warn('Pact exited with code ' + code + '.');
		}
		this.stop();
	}).bind(this));
	
	// check service is available
	return waitForServerUp(this.options)
		.timeout(10000, "Couldn't start Pact with PID: " + this.instance.pid)
		.then((function () {
			this.$running = true;
			this.emit('start', this);
			return this;
		}).bind(this));
};

// Stop the server instance, no more mocking
Server.prototype.stop = function () {
	var pid = -1;
	if (this.instance) {
		pid = this.instance.pid;
		logger.info('Removing Pact with PID: ' + pid);
		this.instance.removeAllListeners();
		// Killing instance, since windows can't send signals, must kill process forcefully
		if (isWindows) {
			cp.execSync('taskkill /f /t /pid ' + pid);
		} else {
			process.kill(-pid, 'SIGINT');
		}
		this.instance = undefined;
	}
	
	return waitForServerDown(this.options)
		.timeout(10000, "Couldn't stop Pact with PID: " + pid)
		.then((function () {
			this.$running = false;
			this.emit('stop', this);
			return this;
		}).bind(this));
};

// Deletes this server instance and emit an event
Server.prototype.delete = function () {
	return this.stop().then((function () {
		this.emit('delete', this);
		return this;
	}).bind(this));
};

// Wait for pact-mock-service to be initialized and ready
function waitForServerUp(options) {
	var amount = 0, deferred = q.defer();
	
	function retry() {
		if (amount >= 10) {
			deferred.reject(new Error("Pact startup failed; tried calling service 10 times with no result."));
		}
		setTimeout(check.bind(this), CHECKTIME);
	}
	
	function check() {
		amount++;
		if (options.port) {
			call(options).then(function () {
				deferred.resolve();
			}, retry);
		} else {
			retry();
		}
	}
	
	check(); // Check first time, start polling
	return deferred.promise;
}

function waitForServerDown(options) {
	var amount = 0, deferred = q.defer();
	
	function check() {
		amount++;
		if (options.port) {
			call(options).then(function () {
				if (amount >= 10) {
					deferred.reject(new Error("Pact stop failed; tried calling service 10 times with no result."));
					return;
				}
				setTimeout(check, CHECKTIME);
			}, function () {
				deferred.resolve();
			});
		} else {
			deferred.resolve();
		}
	}
	
	check(); // Check first time, start polling
	return deferred.promise;
}

function call(options) {
	var deferred = q.defer();
	var config = {
		uri: (options.ssl ? 'https' : 'http') + '://' + options.host + ':' + options.port,
		method: 'GET',
		headers: {
			'X-Pact-Mock-Service': true,
			'Content-Type': 'application/json'
		}
	};
	
	if (options.ssl) {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		config.agentOptions = {};
		config.agentOptions.rejectUnauthorized = false;
		config.agentOptions.requestCert = false;
		config.agentOptions.agent = false;
	}
	
	http(config, function (err, res) {
		if (!err && res.statusCode == 200) {
			deferred.resolve();
		} else {
			deferred.reject();
		}
	});
	
	return deferred.promise;
}

// Creates a new instance of the pact server with the specified option
module.exports = function (options) {
	options = options || {};
	
	// defaults
	//options.port = options.port;
	options.ssl = options.ssl || false;
	options.cors = options.cors || false;
	// options.spec = options.spec || 1;
	options.dir = options.dir ? path.resolve(options.dir) : process.cwd(); // Use directory relative to cwd
	// options.log = options.log || process.cwd();
	options.host = options.host || 'localhost';
	// options.consumer = options.consumer || 'consumer name';
	// options.provider = options.provider || 'provider name';
	
	// port checking
	if (options.port) {
		checkTypes.assert.number(options.port);
		checkTypes.assert.integer(options.port);
		checkTypes.assert.positive(options.port);
		checkTypes.assert.inRange(options.port, 0, 65535);
		
		if (checkTypes.not.inRange(options.port, 1024, 49151)) {
			logger.warn("Like a Boss, you used a port outside of the recommended range (1024 to 49151); I too like to live dangerously.");
		}
	}
	
	// ssl check
	checkTypes.assert.boolean(options.ssl);
	
	// cors check'
	checkTypes.assert.boolean(options.cors);
	
	// spec checking
	if (options.spec) {
		checkTypes.assert.number(options.spec);
		checkTypes.assert.integer(options.spec);
		checkTypes.assert.positive(options.spec);
	}
	
	// dir check
	if (options.dir) {
		try {
			fs.statSync(path.normalize(options.dir)).isDirectory();
		} catch (e) {
			mkdirp.sync(path.normalize(options.dir));
		}
	}
	
	// log check
	if (options.log) {
		var fileObj = path.parse(path.normalize(options.log));
		try {
			fs.statSync(fileObj.dir).isDirectory();
		} catch (e) {
			// If log path doesn't exist, create it
			mkdirp.sync(fileObj.dir);
		}
	}
	
	// host check
	if (options.host) {
		checkTypes.assert.string(options.host);
	}
	
	// consumer name check
	if (options.consumer) {
		checkTypes.assert.string(options.consumer);
	}
	
	// provider name check
	if (options.provider) {
		checkTypes.assert.string(options.provider);
	}
	
	return new Server(options.port, options.host, options.dir, options.ssl, options.cors, options.log, options.spec, options.consumer, options.provider);
};
