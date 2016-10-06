'use strict';

var checkTypes = require('check-types'),
	_ = require('underscore'),
	logger = require('./logger'),
	path = require('path'),
	fs = require('fs'),
	url = require('url'),
	q = require('q'),
	request = q.denodeify(require('request')),
	urlJoin = require('url-join');

function Publisher(pactBroker, pactUrls, consumerVersion, pactBrokerUsername, pactBrokerPassword, tags) {
	this._options = {};
	this._options.pactBroker = pactBroker;
	this._options.pactUrls = pactUrls;
	this._options.pactBrokerUsername = pactBrokerUsername;
	this._options.pactBrokerPassword = pactBrokerPassword;
	this._options.consumerVersion = consumerVersion;
	this._options.tags = tags;
}

Publisher.prototype.publish = function () {
	var options = this._options;
	logger.info('Publishing pacts to broker at: ' + options.pactBroker);

	// Stat all paths in pactUrls to make sure they exist
	// publish template $pactHost/pacts/provider/$provider/consumer/$client/$version
	var uris = _.chain(options.pactUrls)
		.map(function (uri) {
			var localFileOrDir = path.normalize(uri);
			if (!(/^http/.test(uri)) && fs.statSync(localFileOrDir) && fs.statSync(localFileOrDir).isDirectory()) {
				uri = localFileOrDir;
				return _.map(fs.readdirSync(uri, ''), function (file) {
					if (/\.json$/.test(file)) {
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
	return q.allSettled(
		_.map(uris, function (uri) {
			return getPactFile(options, uri)
				.then(function (data) {
					return callPact(options, {
						uri: constructPutUrl(options, data),
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							'Accept': 'application/json'
						},
						json: true,
						body: data
					}).fail(function (err) {
						return q.reject(new Error('Unable to publish Pact to Broker. ' + err.message));
					});
				})
				.tap(function (data) {
					if (!options.tags.length) {
						return;
					}
					return q.allSettled(_.map(options.tags, function (tag) {
						return callPact(options, {
							uri: constructTagUrl(options, tag, data),
							method: 'PUT',
							headers: {
								'Content-Type': 'application/json'
							}
						}).fail(function () {
							return q.reject(new Error('Could not tag Pact with tag "' + tag + '"'));
						});
					})).tap(function (results) {
						_.each(results, function (result) {
							if (result.state !== "fulfilled") {
								logger.warn(result.reason);
							}
						});
					});
				});
		})
	).then(function (results) {
		var reject = false;
		results = _.map(results, function (result) {
			if (result.state === "fulfilled") {
				return result.value;
			} else {
				reject = true;
				return result.reason;
			}
		});
		return reject ? q.reject(results) : results;
	});
};

function callPact(options, config) {
	config = _.extend({
		uri: options.pactBroker ? options.pactBroker : 'http://localhost',
		method: 'GET',
		headers: {
			'Accept': 'application/json'
		}
	}, config);

	// Authentication
	if (options.pactBrokerUsername && options.pactBrokerPassword) {
		config.auth = {
			user: options.pactBrokerUsername,
			pass: options.pactBrokerPassword
		}
	}

	return request(config).then(function (data) {
		return data[0]; // return response only
	}).then(function (response) {
		if (response.statusCode < 200 || response.statusCode >= 300) {
			return q.reject(new Error('Failed http call to pact broker. \nCode: ' + response.statusCode + '\nBody: ' + response.body));
		}
		return response.body;
	});
}

function getPactFile(options, uri) {
	// Parse the Pact file to extract consumer/provider names
	if (/\.json$/.test(uri)) {
		try {
			return q(require(uri));
		} catch (err) {
			return q.reject("Invalid Pact file: " + uri + ". Nested exception: " + err);
		}
	} else {
		return callPact(options, {
			uri: uri,
			json: true
		}).fail(function (err) {
			return q.reject(new Error('Cannot GET ' + uri + '. Nested exception: ' + err.message))
		});
	}
}

// Given Pact Options and a Pact File, construct a Pact URL used to
// PUT/POST to the Pact Broker.
function constructPutUrl(options, data) {
	if (!_.has(options, 'pactBroker')) {
		throw new Error("Cannot construct Pact publish URL: 'pactBroker' not specified");
	}

	if (!_.has(options, 'consumerVersion')) {
		throw new Error("Cannot construct Pact publish URL: 'consumerVersion' not specified");
	}

	if (!_.isObject(options)
		|| !_.has(data, 'consumer')
		|| !_.has(data, 'provider')
		|| !_.has(data.consumer, 'name')
		|| !_.has(data.provider, 'name')) {
		throw new Error("Invalid Pact file given. " +
			"Unable to parse consumer and provider name");
	}

	return urlJoin(options.pactBroker, 'pacts/provider', data.provider.name, 'consumer', data.consumer.name, 'version', options.consumerVersion)
}

function constructTagUrl(options, tag, data) {
	if (!_.has(options, 'pactBroker')) {
		throw new Error("Cannot construct Pact Tag URL: 'pactBroker' not specified");
	}

	if (!_.has(options, 'consumerVersion')) {
		throw new Error("Cannot construct Pact Tag URL: 'consumerVersion' not specified");
	}

	if (!_.isObject(options)
		|| !_.has(data, 'consumer')
		|| !_.has(data.consumer, 'name')) {
		throw new Error("Invalid Pact file given. " +
			"Unable to parse consumer name");
	}

	return urlJoin(options.pactBroker, 'pacticipants', data.consumer.name, 'versions', options.consumerVersion, 'tags', tag)
}

module.exports = function (options) {
	options = options || {};
	// Setting defaults
	options.pactBroker = options.pactBroker || '';
	options.pactUrls = options.pactUrls || [];
	options.tags = options.tags || [];

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

	return new Publisher(options.pactBroker, options.pactUrls, options.consumerVersion, options.pactBrokerUsername, options.pactBrokerPassword, options.tags);
};
