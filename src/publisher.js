'use strict';

var checkTypes = require('check-types'),
	_ = require('underscore'),
	logger = require('./logger'),
	path = require('path'),
	fs = require('fs'),
	url = require('url'),
	q = require('q'),
	http = require('request'),
	urlJoin = require('url-join');

function Publisher(pactBroker, pactUrls, consumerVersion, pactBrokerUsername, pactBrokerPassword) {
	this.options = {};
	this.options.pactBroker = pactBroker;
	this.options.pactUrls = pactUrls;
	this.options.pactBrokerUsername = pactBrokerUsername;
	this.options.pactBrokerPassword = pactBrokerPassword;
	this.options.consumerVersion = consumerVersion;
}

Publisher.prototype.publish = function () {
	var options = this.options;
	logger.info('Publishing pacts to broker at: ' + options.pactBroker);

	// Stat all paths in pactUrls to make sure they exist
	// publish template $pactHost/pacts/provider/$provider/consumer/$client/$version
	var uris = _.chain(options.pactUrls)
		.map(function (uri) {
			uri = path.normalize(uri);
			if (fs.statSync(uri).isDirectory()) {
				logger.debug('we are a dir: ' + uri);
				return _.map(fs.readdirSync(uri, ''), function (file) {
					// Ends with .json
					if (/.json$/.test(file)) {
						return path.join(uri, file);
					}
				});
			} else {
				return uri;
			}
		})
		.flatten(true)
		.compact()
		.value();

	// Return a merge of all promises...
	return q.all(_.map(uris, function (uri) {
		// try {
		var data = JSON.parse(fs.readFileSync(uri, 'utf8')),
			provider = data.provider.name,
			consumer = data.consumer.name,
			deferred = q.defer();

		var config = {
			uri: urlJoin(options.pactBroker, 'pacts/provider', provider, 'consumer', consumer, 'version', options.consumerVersion),
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			body: data,
			json: true
		};

		// Authentication
		if (options.pactBrokerUsername && options.pactBrokerPassword) {
			config.auth = {
				user: options.pactBrokerUsername,
				pass: options.pactBrokerPassword
			}
		}

		http(config, function (error, response) {
			if (!error && response.statusCode == 200) {
				deferred.resolve();
			} else {
				deferred.reject();
			}
		});

		return deferred.promise;
		/*} catch (e) {
		 return q.reject("Invalid Pact file: " + uri);
		 }*/
	}))
};

// Creates a new instance of the pact server with the specified option
module.exports = function (options) {
	options = options || {};
	options.pactBroker = options.pactBroker || '';
	options.pactUrls = options.pactUrls || [];

	if (options.pactUrls) {
		checkTypes.assert.array.of.string(options.pactUrls);
	}

	// Stat all paths in pactUrls to make sure they exist
	var url = require('url');
	_.each(options.pactUrls, function (uri) {
		// only check local files
		var proto = url.parse(uri).protocol;
		if (proto == 'file://' || proto === null) {
			try {
				fs.statSync(path.normalize(uri))
			} catch (e) {
				throw new Error('Pact file or directory: "' + uri + '" doesn\'t exist');
			}
		}
	});

	checkTypes.assert.nonEmptyString(options.pactBroker, 'Must provide the pactBroker argument');
	checkTypes.assert.nonEmptyString(options.consumerVersion, 'Must provide the consumerVersion argument');
	checkTypes.assert.not.emptyArray(options.pactUrls, 'Must provide the pactUrls argument');

	if (options.pactBrokerUsername) {
		checkTypes.assert.string(options.pactBrokerUsername);
	}

	if (options.pactBrokerPassword) {
		checkTypes.assert.string(options.pactBrokerPassword);
	}

	if ((options.pactBrokerUsername && !options.pactBrokerPassword) || (options.pactBrokerPassword && !options.pactBrokerUsername)) {
		throw new Error('Must provide both or none of --provider-states-url and --provider-states-setup-url.');
	}

	if (options.pactBroker) {
		checkTypes.assert.string(options.pactBroker);
	}

	return new Publisher(options.pactBroker, options.pactUrls, options.consumerVersion, options.pactBrokerUsername, options.pactBrokerPassword);
};
