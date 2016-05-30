'use strict';

var checkTypes = require('check-types'),
	_ = require('underscore'),
	logger = require('./logger'),
	path = require('path'),
	fs = require('fs'),
	url = require('url'),
	Promise = require('bluebird'),
	request = require('superagent-bluebird-promise');

// Constructor
function Publisher(pactBroker, pactUrls, consumerVersion, pactBrokerUsername, pactBrokerPassword) {
	this.options = {};
	this.options.pactBroker = pactBroker;
	this.options.pactUrls = pactUrls;
	this.options.pactBrokerUsername = pactBrokerUsername;
	this.options.pactBrokerPassword = pactBrokerPassword;
	this.options.consumerVersion = consumerVersion;
}

Publisher.prototype.publish = function () {
	logger.info('Publishing pacts to broker at: ' + this.options.pactBroker);

	// Set of promises containing the requests to the Pact Broker
	var uploadRequests = [];

	// Stat all paths in pactUrls to make sure they exist
	// publish template $pactHost/pacts/provider/$provider/consumer/$client/$version
	var uris = [];

	_.each(this.options.pactUrls, function (uri) {
		if (fs.statSync(path.normalize(uri)).isDirectory()) {
			logger.debug('we are a dir: ' + uri);
			_.each(fs.readdirSync(uri, ''), function (file) {
				// Ends with .json
				if (file.indexOf('.json', file.length - 5) === file.length - 5) {
					uris.push(path.join(uri, file));
				}
			});
		} else {
			uris.push(uri);
		}
	});

	_.each(uris, function (uri) {
		try {
			var data = JSON.parse(fs.readFileSync(uri, 'utf8')),
			provider = data.provider.name,
			consumer = data.consumer.name;

			var putUrl = this.options.pactBroker + '/pacts/provider/' + provider + '/consumer/' + consumer + '/version/' + this.options.consumerVersion;
			var req = request
				.put(putUrl)
				.send(data)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json');

			// Authentication
			if (this.options.pactBrokerUsername && this.options.pactBrokerPassword) {
				req.auth(this.options.pactBrokerUsername, this.options.pactBrokerPassword)
			}

			uploadRequests.push(req.promise());
		} catch (e) {
			uploadRequests.push(Promise.reject("Invalid Pact file: " + uri));
		}
	}.bind(this));

	logger.debug(uploadRequests.length);

	// Return a merge of all promises...
	return Promise.all(uploadRequests)
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
	var url = require('url')
	_.each(options.pactUrls, function(uri) {
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
