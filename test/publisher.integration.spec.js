/* global describe:true, before:true, after:true, it:true, global:true, process:true */

var publisherFactory = require('./../src/publisher'),
	logger = require('./../src/logger'),
	expect = require('chai').expect,
	fs = require('fs'),
	path = require('path'),
	chai = require("chai"),
	broker = require('./integration/brokerMock.js'),
	chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

describe("Publish Spec", function () {
	var server,
		PORT = Math.floor(Math.random() * 999) + 9000,
		pactBrokerBaseUrl = 'http://localhost:' + PORT,
		authenticatedPactBrokerBaseUrl = 'http://localhost:' + PORT + '/auth';

	before(function (done) {
		server = broker.listen(PORT, function () {
			console.log('Pact Broker Mock listening on port: ' + PORT);
			done();
		});
	});

	after(function () {
		server.close();
	});

	context("when publishing a to a broker", function () {
		context("without authentication", function () {
			context("and the Pact file is valid", function () {
				it("should successfully publish all Pacts", function () {
					var publisher = publisherFactory({
						pactBroker: pactBrokerBaseUrl,
						pactUrls: [path.resolve(__dirname, 'integration/publish/publish-success.json')],
						consumerVersion: "1.0.0"
					});

					expect(publisher).to.be.a('object');
					expect(publisher).to.respondTo('publish');
					return expect(publisher.publish()).to.eventually.be.fulfilled;
				});

				it("should successfully tag all Pacts with 'test' and 'latest'", function () {
					var publisher = publisherFactory({
						pactBroker: pactBrokerBaseUrl,
						pactUrls: [path.resolve(__dirname, 'integration/publish/publish-success.json')],
						consumerVersion: "1.0.0",
						tags: ['test', 'latest']
					});

					expect(publisher).to.be.a('object');
					expect(publisher).to.respondTo('publish');
					return expect(publisher.publish()).to.eventually.be.fulfilled;
				});
			});
			context("and the Pact file is invalid", function () {
				it("should report an unsuccessful push", function () {
					var publisher = publisherFactory({
						pactBroker: pactBrokerBaseUrl,
						pactUrls: [path.resolve(__dirname, 'integration/publish/publish-fail.json')],
						consumerVersion: "1.0.0"
					});

					expect(publisher).to.be.a('object');
					expect(publisher).to.respondTo('publish');
					return expect(publisher.publish()).to.eventually.be.rejected;
				});
			});
		});

		context("with authentication", function () {
			context("and valid credentials", function () {
				it("should return a sucessful promise", function () {
					var publisher = publisherFactory({
						pactBroker: authenticatedPactBrokerBaseUrl,
						pactUrls: [path.resolve(__dirname, 'integration/publish/publish-success.json')],
						consumerVersion: "1.0.0",
						pactBrokerUsername: 'foo',
						pactBrokerPassword: 'bar'
					});

					expect(publisher).to.be.a('object');
					expect(publisher).to.respondTo('publish');
					return expect(publisher.publish()).to.eventually.be.fulfilled;
				});
			});

			context("and invalid credentials", function () {
				it("should return a rejected promise", function () {
					var publisher = publisherFactory({
						pactBroker: authenticatedPactBrokerBaseUrl,
						pactUrls: [path.resolve(__dirname, 'integration/publish/publish-success.json')],
						consumerVersion: "1.0.0",
						pactBrokerUsername: 'not',
						pactBrokerPassword: 'right'
					});

					expect(publisher).to.be.a('object');
					expect(publisher).to.respondTo('publish');
					return expect(publisher.publish()).to.eventually.be.rejected;
				});
			});
		});

	});
	context("when publishing a directory of Pacts to a Broker", function () {
		context("and the directory contains only valid pact files", function () {
			it("should asynchronously send all Pacts to the Broker", function () {
				var publisher = publisherFactory({
					pactBroker: pactBrokerBaseUrl,
					pactUrls: [path.resolve(__dirname, 'integration/publish/pactDirTests')],
					consumerVersion: "1.0.0"
				});

				expect(publisher).to.be.a('object');
				expect(publisher).to.respondTo('publish');
				return expect(publisher.publish()
					.then(function (res) {
						expect(res.length).to.eq(2);
					})).to.eventually.be.fulfilled;
			});

			it("should successfully tag all Pacts sent with 'test' and 'latest'", function () {
				var publisher = publisherFactory({
					pactBroker: pactBrokerBaseUrl,
					pactUrls: [path.resolve(__dirname, 'integration/publish/pactDirTests')],
					consumerVersion: "1.0.0",
					tags: ['test', 'latest']
				});

				expect(publisher).to.be.a('object');
				expect(publisher).to.respondTo('publish');
				return expect(publisher.publish()
					.then(function (res) {
						expect(res.length).to.eq(2);
					})).to.eventually.be.fulfilled;
			});
		});

		context("and the directory contains Pact and non-Pact files", function () {
			it("should asynchronously send only the Pact files to the broker", function () {
				var publisher = publisherFactory({
					pactBroker: pactBrokerBaseUrl,
					pactUrls: [path.resolve(__dirname, 'integration/publish/pactDirTestsWithOtherStuff')],
					consumerVersion: "1.0.0"
				});

				expect(publisher).to.be.a('object');
				expect(publisher).to.respondTo('publish');
				return expect(publisher.publish()
					.then(function (res) {
						expect(res.length).to.eq(2);
					})).to.eventually.be.fulfilled;
			});
		});
	});
	context("when publishing Pacts from an http-based URL", function () {
		context("and the pact files are valid", function () {
			it("should asynchronously send the Pact files to the broker", function () {
				var publisher = publisherFactory({
					pactBroker: pactBrokerBaseUrl,
					pactUrls: [pactBrokerBaseUrl + '/somepact'],
					consumerVersion: "1.0.0"
				});

				return expect(publisher.publish()).to.eventually.be.fulfilled;
			});

			it("should successfully tag all Pacts sent with 'test' and 'latest'", function () {
				var publisher = publisherFactory({
					pactBroker: pactBrokerBaseUrl,
					pactUrls: [pactBrokerBaseUrl + '/somepact'],
					consumerVersion: "1.0.0",
					tags: ['test', 'latest']
				});

				return expect(publisher.publish()).to.eventually.be.fulfilled;
			});
		});

		context("and the pact files do not exist (404)", function () {
			it("should return a rejected promise", function () {
				var publisher = publisherFactory({
					pactBroker: pactBrokerBaseUrl,
					pactUrls: [pactBrokerBaseUrl + '/somepacturlthatdoesntexist'],
					consumerVersion: "1.0.0"
				});

				return publisher.publish()
					.then(function() {
						throw new Error("Expected an error but got none");
					})
					.catch(function(err) {
						expect(err.message).to.contain("Nested exception: Cannot GET /somepacturlthatdoesntexist")
					})
			});
		});
		context("and the pact files are invalid (no consumer/provider)", function () {
			it("should return a rejected promise", function () {
				var publisher = publisherFactory({
					pactBroker: pactBrokerBaseUrl,
					pactUrls: [pactBrokerBaseUrl + '/somebrokenpact'],
					consumerVersion: "1.0.0"
				});

				return publisher.publish()
					.then(function() {
						throw new Error("Expected an error but got none");
					})
					.catch(function(err) {
						expect(err.message).to.contain("Invalid Pact file given. Unable to parse consumer and provider name");
					})
			});
		});
	});
});
