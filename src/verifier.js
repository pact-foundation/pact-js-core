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
	pactUtil = require('./pact-util'),
	isWindows = process.platform === 'win32';

// Constructor
function Verifier(providerBaseUrl, pactUrls, providerStatesUrl, providerStatesSetupUrl, pactBrokerUsername, pactBrokerPassword, publishVerificationResult, providerVersion, pactBrokerUrl, tags, provider, timeout, retrievePactsPromise) {
	this._options = {};
	this._options.providerBaseUrl = providerBaseUrl;
	this._options.pactUrls = pactUrls;
	this._options.providerStatesUrl = providerStatesUrl;
	this._options.providerStatesSetupUrl = providerStatesSetupUrl;
	this._options.pactBrokerUsername = pactBrokerUsername;
	this._options.pactBrokerPassword = pactBrokerPassword;
	this._options.publishVerificationResult = publishVerificationResult;
	this._options.providerVersion = providerVersion;
	this._options.pactBrokerUrl = pactBrokerUrl;
	this._options.tags = tags;
	this._options.provider = provider;
	this._options.timeout = timeout;
	this._options.retrievePactsPromise = retrievePactsPromise;
}

Verifier.prototype.verify = function () {
	logger.info("Verifier verify()");
	var self = this;

	return self._options.retrievePactsPromise.then(function (data) {
		self._options.pactUrls = data;

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
			opts = {
				cwd: verifierPath.cwd,
				detached: !isWindows,
				env: envVars
			},
			args = pactUtil.createArguments(self._options, {
				'providerBaseUrl': '--provider-base-url',
				'pactUrls': '--pact-urls',
				'providerStatesUrl': '--provider-states-url',
				'providerStatesSetupUrl': '--provider-states-setup-url',
				'pactBrokerUsername': '--broker-username',
				'pactBrokerPassword': '--broker-password',
				'publishVerificationResult': '--publish-verification-results',
				'providerVersion': '--provider-app-version'
			});

		var cmd = [verifierPath.file].concat(args).join(' ');

		if (isWindows) {
			file = 'cmd.exe';
			args = ['/s', '/c', cmd];
			opts.windowsVerbatimArguments = true;
		} else {
			cmd = './' + cmd;
			file = '/bin/sh';
			args = ['-c', cmd];
		}

		self._instance = cp.spawn(file, args, opts);

		self._instance.stdout.setEncoding('utf8');
		self._instance.stdout.on('data', outputHandler);
		self._instance.stderr.setEncoding('utf8');
		self._instance.stderr.on('data', outputHandler);
		self._instance.on('error', logger.error.bind(logger));

		self._instance.once('close', function (code) {
			code == 0 ? deferred.resolve(output) : deferred.reject(new Error(output));
		});

		logger.info('Created Pact Verifier process with PID: ' + self._instance.pid);
		return deferred.promise.timeout(self._options.timeout, "Timeout waiting for verification process to complete (PID: " + self._instance.pid + ")")
			.tap(function (data) {
				logger.info('Pact Verification succeeded.');
			});
	});
};

// Creates a new instance of the pact server with the specified option
module.exports = function (options) {
	options = options || {};
	options.providerBaseUrl = options.providerBaseUrl || '';
	options.pactBrokerUrl = options.pactBrokerUrl || '';
	options.tags = options.tags || [];
	options.provider = options.provider || '';
	options.pactUrls = options.pactUrls || [];
	options.providerStatesUrl = options.providerStatesUrl || '';
	options.providerStatesSetupUrl = options.providerStatesSetupUrl || '';
	options.timeout = options.timeout || 30000;
	var retrievePactsPromise;

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

	if (checkTypes.emptyArray(options.pactUrls) && !options.pactBrokerUrl) {
		throw new Error('Must provide the --pact-urls argument if no --broker-url provided');
	}

	if ((!options.pactBrokerUrl || !options.provider) && checkTypes.emptyArray(options.pactUrls)) {
		throw new Error('Must provide both --provider and --broker-url or if --pact-urls not provided.');
	}

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

	if (options.pactUrls && !checkTypes.emptyArray(options.pactUrls)) {
		checkTypes.assert.array.of.string(options.pactUrls);
		retrievePactsPromise = new Promise(function (resolve) {
			resolve(options.pactUrls);
		});
	} else {
		// If no pactUrls provided, we must fetch them from the broker!
		var broker = require('./broker')({
			brokerUrl: options.pactBrokerUrl,
			provider: options.provider,
			username: options.pactBrokerUsername,
			password: options.pactBrokerPassword,
			tags: options.tags
		});
		retrievePactsPromise = broker
			.findConsumers()
			.then(function (pactUrls) {
				return pactUrls
			});
	}
	if (options.tags) {
		checkTypes.assert.array.of.string(options.tags);
	}

	if (options.providerBaseUrl) {
		checkTypes.assert.string(options.providerBaseUrl);
	}

	if (options.publishVerificationResult) {
		checkTypes.assert.boolean(options.publishVerificationResult);
	}

	if (options.publishVerificationResult && !options.providerVersion) {
		throw new Error('Must provide both or none of --publish-verification-results and --provider-app-version.');
	}

	if (options.providerVersion) {
		checkTypes.assert.string(options.providerVersion);
	}

	checkTypes.assert.positive(options.timeout);

	return new Verifier(options.providerBaseUrl, options.pactUrls, options.providerStatesUrl, options.providerStatesSetupUrl, options.pactBrokerUsername, options.pactBrokerPassword, options.publishVerificationResult, options.providerVersion, options.pactBrokerUrl, options.tags, options.provider, options.timeout, retrievePactsPromise);
};
