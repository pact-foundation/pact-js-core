/* global describe:true, before:true, after:true, it:true, global:true, process:true */

var publisherFactory = require('./publisher'),
	expect = require('chai').expect,
	logger = require('./logger'),
	fs = require('fs'),
	path = require('path'),
	chai = require("chai"),
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

	afterEach(function (done) {
		done();
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
});
