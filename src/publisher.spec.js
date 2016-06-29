/* global describe:true, before:true, after:true, it:true, global:true, process:true */

var publisherFactory = require('./publisher'),
	expect = require('chai').expect,
	logger = require('./logger'),
	fs = require('fs'),
	path = require('path'),
	chai = require("chai"),
	rewire = require("rewire"),
	publisher = rewire("./publisher.js"),
	constructPutUrl = publisher.__get__('constructPutUrl'),
	constructTagUrl = publisher.__get__('constructTagUrl'),
	broker = require('../test/integration/brokerMock.js'),
	chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

describe("Publish Spec", function () {
	var PORT = Math.floor(Math.random() * 999) + 9000,
		pactBrokerBaseUrl = 'http://localhost:' + PORT,
		authenticatedPactBrokerBaseUrl = 'http://localhost:' + PORT + '/auth';

	before(function (done) {
		logger.level('debug');
		broker.listen(PORT, function () {
			console.log('Broker (Mock) running on port: ' + PORT);
			done();
		});
	});

	describe("Publisher", function () {
		context("when not given pactUrls", function () {
			it("should fail with an error", function () {
				expect(function () {
					publisherFactory({
						pactBroker: "http://localhost",
						consumerVersion: "1.0.0"
					});
				}).to.throw(Error);
			});
		});

		context("when not given pactBroker", function () {
			it("should fail with an error", function () {
				expect(function () {
					publisherFactory({
						pactUrls: ["http://localhost"],
						consumerVersion: "1.0.0"
					});
				}).to.throw(Error);
			});
		});

		context("when not given consumerVersion", function () {
			it("should fail with an error", function () {
				expect(function () {
					publisherFactory({
						pactBroker: "http://localhost",
						pactUrls: [path.dirname(process.mainModule.filename)]
					});
				}).to.throw(Error);
			});
		});

		context("when given local Pact URLs that don't exist", function () {
			it("should fail with an error", function () {
				expect(function () {
					publisherFactory({
						pactBroker: "http://localhost",
						pactUrls: ["./test.json"]
					});
				}).to.throw(Error);
			});
		});

		context("when given local Pact URLs that do exist", function () {
			it("should not fail", function () {
				expect(function () {
					publisherFactory({
						pactBroker: "http://localhost",
						pactUrls: [path.dirname(process.mainModule.filename)],
						consumerVersion: "1.0.0"
					});
				}).to.not.throw(Error);
			});
		});

		context("when given the correct arguments", function () {
			it("should return a Publisher object", function () {
				var publisher = publisherFactory({
					pactBroker: "http://localhost",
					pactUrls: ["http://idontexist"],
					consumerVersion: "1.0.0"
				});
				expect(publisher).to.be.a('object');
				expect(publisher).to.respondTo('publish');
			});
		});
	});

	context("constructPutUrl", function () {
		context("when given a valid config object and pact JSON", function () {
			it("should return a PUT url", function () {
				var options = { 'pactBroker': 'http://foo' };
				var data = { 'consumer': { 'name': 'consumerName' }, 'provider': { 'name': 'providerName' } };
				expect(constructPutUrl(options, data)).to.eq('http://foo/pacts/provider/providerName/consumer/consumerName/version/');
			});
		});
		context("when given an invalid config object", function () {
			it("should return a PUT url", function () {
				var options = { 'someotherurl': 'http://foo' };
				var data = { 'consumer': { 'name': 'consumerName' }, 'provider': { 'name': 'providerName' } };
				expect(function() {
					constructPutUrl(options, data);
				}).to.throw(Error, "Cannot construct Pact publish URL: 'pactBroker' not specified");
			});
		});
		context("when given an invalid pact file (no consumer/provider keys)", function () {
			it("should return a PUT url", function () {
				var options = { 'pactBroker': 'http://foo' };
				var data = { };
				expect(function() {
					constructPutUrl(options, data);
				}).to.throw(Error, "Invalid Pact file given. Unable to parse consumer and provider name");
			});
		});
		context("when given an invalid pact file (no name keys)", function () {
			it("should return a PUT url", function () {
				var options = { 'pactBroker': 'http://foo' };
				var data = { 'consumer': {}, 'provider': {} };
				expect(function() {
					constructPutUrl(options, data);
				}).to.throw(Error, "Invalid Pact file given. Unable to parse consumer and provider name");
			});
		});
	});

	context("constructTagUrl", function () {
		context("when given a valid config object and pact JSON", function () {
			it("should return a PUT url", function () {
				var options = { 'pactBroker': 'http://foo', consumerVersion: '1.0' };
				var data = { 'consumer': { 'name': 'consumerName' } };
				expect(constructTagUrl(options, 'test', data)).to.eq('http://foo/pacticipants/consumerName/version/1.0/tags/test');
			});
		});
		context("when given an invalid config object", function () {
			it("should return a PUT url", function () {
				var options = { 'someotherurl': 'http://foo', consumerVersion: '1.0' };
				var data = { 'consumer': { 'name': 'consumerName' } };
				expect(function() {
					constructTagUrl(options, data);
				}).to.throw(Error, "Cannot construct Pact publish URL: 'pactBroker' not specified");
			});
		});
		context("when given an invalid pact file (no consumer key)", function () {
			it("should return a PUT url", function () {
				var options = { 'pactBroker': 'http://foo' };
				var data = { };
				expect(function() {
					constructTagUrl(options, data);
				}).to.throw(Error, "Invalid Pact file given. Unable to parse consumer name");
			});
		});
		context("when given an invalid pact file (no name keys)", function () {
			it("should return a PUT url", function () {
				var options = { 'pactBroker': 'http://foo' };
				var data = { 'consumer': {} };
				expect(function() {
					constructTagUrl(options, data);
				}).to.throw(Error, "Invalid Pact file given. Unable to parse consumer name");
			});
		});
	});
});
