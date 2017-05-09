'use strict';

var checkTypes = require('check-types'),
	logger = require('./logger'),
	traverson = require('traverson-promise'),
	JsonHalAdapter = require('traverson-hal');

// register the traverson-hal plug-in for media type 'application/hal+json'
traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter);

var pactURLPattern = "/pacts/provider/%s/latest",
	pactURLPatternWithTag = "/pacts/provider/%s/latest/%s";

// Constructor
function Broker(brokerUrl, provider, tags, username, password) {
	this._options = {};
	this._options.brokerUrl = brokerUrl;
	this._options.provider = provider;
	this._options.tags = tags;
	this._options.username = username;
	this._options.password = password;
}

// Find all consumers
Broker.prototype.findConsumers = function () {
	logger.debug("Finding consumers")
	return traverson
		.from('https://test.pact.dius.com.au/pacts/provider/bobby/latest/sit4')
		.withRequestOptions(this.getRequestOptions())
		.jsonHal()
		.follow('pacts')
		.get()
		.result;
};

Broker.prototype.getRequestOptions = function () {
	if (this._options.username && this._options.password) {
		return {
			'auth': {
				'user': this._options.username,
				'password': this._options.password
			}
		}
	}
	return {}
}



// Creates a new instance of the Pact Broker HAL client with the specified option
module.exports = function (options) {
	options = options || {};

	// defaults
	options.brokerUrl = options.brokerUrl || '';
	options.provider = options.provider || '';
	options.username = options.username || '';
	options.password = options.password || '';
	options.tags = options.tags || [];

	checkTypes.assert.nonEmptyString(options.brokerUrl);
	checkTypes.assert.nonEmptyString(options.provider);

	if (options.tags) {
		checkTypes.assert.array.of.string(options.tags);
	}

	if (options.username) {
		checkTypes.assert.string(options.username);
	}

	if (options.password) {
		checkTypes.assert.string(options.password);
	}

	return new Broker(options.provider, options.brokerUrl, options.tags, options.username, options.password);
};
