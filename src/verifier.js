'use strict';

var checkTypes = require('check-types'),
	_ = require('underscore'),
	logger = require('./logger'),
	path = require('path'),
	fs = require('fs'),
	cp = require('child_process'),
	q = require('q'),
	eventEmitter = require('events').EventEmitter,
	util = require('util');
var isWindows = process.platform === 'win32';

var arch = "";
if (process.platform === 'linux') {
	arch = '-' + process.arch;
}
var packageName = 'pact-provider-verifier-' + process.platform + arch;
var packagePath = require.resolve(packageName);

// Constructor
function Verifier(providerBaseUrl, pactUrls, providerStatesUrl, providerStatesSetupUrl, pactBrokerUsername, pactBrokerPassword) {
	this.options = {};
	this.options.providerBaseUrl = providerBaseUrl;
	this.options.pactUrls = pactUrls;
	this.options.providerStatesUrl = providerStatesUrl;
	this.options.providerStatesSetupUrl = providerStatesSetupUrl;
	this.options.pactBrokerUsername = pactBrokerUsername;
	this.options.pactBrokerPassword = pactBrokerPassword;
}

util.inherits(Verifier, eventEmitter);

Verifier.prototype.verify = function () {
	logger.info("Verifier verify()");
	var deferred = q.defer();
	this.emit('start', this);

	var file,
		opts = {
			cwd: path.resolve(packagePath, '..'),
			detached: !isWindows
		},
		mapping = {
			'providerBaseUrl': '--provider-base-url',
			'pactUrls': '--pact-urls',
			'providerStatesUrl': '--provider-states-url',
			'providerStatesSetupUrl': '--provider-states-setup-url',
			'pactBrokerUsername': '--broker-username',
			'pactBrokerPassword': '--broker-password'
		},
		exitCode = 0;

	var args = _.compact(_.map(mapping, (function (value, key) {
		return this.options[key] ? value + ' ' + this.options[key] : null;
	}).bind(this)));

	var cmd = [packagePath.split(path.sep).pop()].concat(args).join(' ');

	if (isWindows) {
		file = 'cmd.exe';
		args = ['/s', '/c', cmd];
		opts.windowsVerbatimArguments = true;
	} else {
		cmd = "./" + cmd;
		file = '/bin/sh';
		args = ['-c', cmd];
	}

	this.instance = cp.exec(cmd, opts, function (err, stdOut, stdErr) {
		if (err) {
			console.error(err);
		}
		if (stdErr) {
			console.error(stdErr);
		}
		if (stdOut) {
			console.log(stdOut);
		}
		if (exitCode == 0) {
			logger.info('Pact Verification failed.');
			deferred.resolve();
		} else {
			logger.info('Pact Verification succeeded.');
			deferred.reject();
		}
	});

	this.instance.on('error', console.error);
	this.instance.on('exit', function (code, signal) {
		exitCode = code;
	});

	logger.info('Created Pact Verifier process with PID: ' + this.instance.pid);
	return deferred.promise;
};

// Creates a new instance of the pact server with the specified option
module.exports = function (options) {
	options = options || {};
	options.providerBaseUrl = options.providerBaseUrl || '';
	options.pactUrls = options.pactUrls || [];
	options.providerStatesUrl = options.providerStatesUrl || '';
	options.providerStatesSetupUrl = options.providerStatesSetupUrl || '';

	var url = require('url')
	_.each(options.pactUrls, function(uri) {
	  // only check local files
		var proto = url.parse(uri).protocol;
		if (proto == 'file://' || proto === null) {
			try {
				fs.statSync(path.normalize(uri))
			} catch(e) {
				throw new Error('Pact file: "' + uri + '" doesn\'t exist');
			}
		}
	});

	checkTypes.assert.nonEmptyString(options.providerBaseUrl, 'Must provide the --provider-base-url argument');
	checkTypes.assert.not.emptyArray(options.pactUrls, 'Must provide the --pact-urls argument');

	if (options.providerStatesSetupUrl) {
		checkTypes.assert.string(options.providerStatesSetupUrl);
	}

	if (options.providerStatesUrl) {
		checkTypes.assert.string(options.providerStatesUrl);
	}

	if (options.pactBrokerUsername) {
		checkTypes.assert.string(options.pactBrokerUsername);
	}

	if (options.pactBrokerPassword) {
		checkTypes.assert.string(options.pactBrokerPassword);
	}

	if ( (options.providerStatesUrl && !options.providerStatesSetupUrl) || (options.providerStatesSetupUrl && !options.providerStatesUrl)) {
		throw new Error('Must provide both or none of --provider-states-url and --provider-states-setup-url.');
	}

	if (options.pactUrls) {
		checkTypes.assert.array.of.string(options.pactUrls);
	}

	if (options.providerBaseUrl) {
		checkTypes.assert.string(options.providerBaseUrl);
	}

	return new Verifier(options.providerBaseUrl, options.pactUrls, options.providerStatesUrl, options.providerStatesSetupUrl, options.pactBrokerUsername, options.pactBrokerPassword);
};
