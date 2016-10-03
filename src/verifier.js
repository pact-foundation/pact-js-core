'use strict';

var checkTypes = require('check-types'),
	_ = require('underscore'),
	logger = require('./logger'),
	path = require('path'),
	fs = require('fs'),
	cp = require('child_process'),
	q = require('q'),
	unixify = require('unixify'),
	url = require('url'),
	verifierPath = require('@pact-foundation/pact-provider-verifier'),
	isWindows = process.platform === 'win32';

// Constructor
function Verifier(providerBaseUrl, pactUrls, providerStatesUrl, providerStatesSetupUrl, pactBrokerUsername, pactBrokerPassword) {
	this.options = {};
	this.options.providerBaseUrl = providerBaseUrl;
	this.options.pactUrls = pactUrls;
	this.options.providerStatesUrl = providerStatesUrl;
	this.options.providerStatesSetupUrl = providerStatesSetupUrl;
	this.options.pactBrokerUsername = pactBrokerUsername;
	this.options.pactBrokerPassword = pactBrokerPassword;
	this.options.args = [];
}

Verifier.prototype.verify = function () {
	logger.info("Verifier verify()");
	var deferred = q.defer();

	var output = ''; // Store output here in case of error
	function outputHandler(data) {
		logger.info(data);
		output += data;
	}

	var envVars = JSON.parse(JSON.stringify(process.env)); // Create copy of environment variables
	// Remove environment variable if there
	// This is a hack to prevent some weird Travelling Ruby behaviour with Gems
	// https://github.com/pact-foundation/pact-mock-service-npm/issues/16
	delete envVars['RUBYGEMS_GEMDEPS'];

	var file,
		args,
		opts = {
			cwd: verifierPath.cwd,
			detached: !isWindows,
			env: envVars
		},
		mapping = {
			'providerBaseUrl': '--provider-base-url',
			'pactUrls': '--pact-urls',
			'providerStatesUrl': '--provider-states-url',
			'providerStatesSetupUrl': '--provider-states-setup-url',
			'pactBrokerUsername': '--broker-username',
			'pactBrokerPassword': '--broker-password'
		};


	this.options.args = _.compact(_.flatten(_.map(mapping, (function (value, key) {
		if (this.options[key]) {
			return [value, (checkTypes.array(this.options[key]) ? this.options[key].join(',') : this.options[key])]
		}
	}).bind(this))));

	// Quote args
	this.options.args = _.map(this.options.args, function(v) {
		return '"' + v + '"';
	});

	var cmd = [verifierPath.file].concat(this.options.args).join(' ');

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
	this.instance.stdout.on('data', outputHandler);
	this.instance.stderr.setEncoding('utf8');
	this.instance.stderr.on('data', outputHandler);
	this.instance.on('error', logger.error.bind(logger));

	this.instance.once('close', function (code) {
		code == 0 ? deferred.resolve(output) : deferred.reject(new Error(output));
	});

	logger.info('Created Pact Verifier process with PID: ' + this.instance.pid);
	return deferred.promise.timeout(10000, "Couldn't start Pact Verifier process with PID: " + this.instance.pid)
		.then(function (data) {
			logger.info('Pact Verification succeeded.');
			return data;
		});
};

// Creates a new instance of the pact server with the specified option
module.exports = function (options) {
	options = options || {};
	options.providerBaseUrl = options.providerBaseUrl || '';
	options.pactUrls = options.pactUrls || [];
	options.providerStatesUrl = options.providerStatesUrl || '';
	options.providerStatesSetupUrl = options.providerStatesSetupUrl || '';

	options.pactUrls = _.chain(options.pactUrls)
		.map(function (uri) {
			// only check local files
			if (!/https?:/.test(url.parse(uri).protocol)) { // If it's not a URL, check if file is available
				try {
					fs.statSync(path.normalize(uri)).isFile();

					// Unixify the paths. Pact in multiple places uses URI and matching and
					// hasn't really taken Windows into account. This is much easier, albeit
					// might be a problem on non root-drives
					// options.pactUrls.push(uri);
					return unixify(uri);
				} catch (e) {
					throw new Error('Pact file: "' + uri + '" doesn\'t exist');
				}
			}
			// HTTP paths are OK
			return uri;
		})
		.compact()
		.value();

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

	if ((options.providerStatesUrl && !options.providerStatesSetupUrl) || (options.providerStatesSetupUrl && !options.providerStatesUrl)) {
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
