var brokerFactory = require('./broker'),
	expect = require('chai').expect,
	chai = require("chai"),
	logger = require('./logger'),
	brokerMock = require('../test/integration/brokerMock.js'),
	chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

describe("Broker Spec", function () {
	var PORT = 9124,
		pactBrokerBaseUrl = 'http://localhost:' + PORT,
		authenticatedPactBrokerBaseUrl = 'http://localhost:' + PORT + '/auth';

	before(function (done) {
		brokerMock.listen(PORT, function () {
			logger.debug('Broker (Mock) running on port: ' + PORT);
			done();
		});
	});

	describe("Broker", function () {
		context("when not given a Pact Broker URL", function () {
			it("should fail with an error", function () {
				expect(function () {
					brokerFactory({
						provider: "foobar"
					});
				}).to.throw(Error);
			});
		});
		context("when not given a Provider name", function () {
			it("should fail with an error", function () {
				expect(function () {
					brokerFactory({
						brokerUrl: "http://test.pact.dius.com.au"
					});
				}).to.throw(Error);
			});
		});
		context("when given a valid Pact Broker URL", function () {
			it("should return a Broker object", function () {
				expect(function () {
					brokerFactory({
						brokerUrl: "http://test.pact.dius.com.au",
						provider: "foobar"
					});
				}).to.not.throw(Error);
			});
		});
	});

	describe("Find Consumers", function () {
		context("when provider 'notfound' does not exist", function () {
			context("and given the provider name 'notfound'", function () {
				it("should fail with an Error", function (done) {
					var broker = brokerFactory({
						brokerUrl: pactBrokerBaseUrl,
						provider: "notfound",
						username: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
						password: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1"
					});
					var promise = broker.findConsumers();

					expect(promise).to.be.rejectedWith(Error).notify(done);
				});
			});
		});
		context("when no pacts exist for provider 'nolinks'", function () {
			context("and given the provider name", function () {
				it("should return an empty array of pact links", function (done) {
					var broker = brokerFactory({
						brokerUrl: pactBrokerBaseUrl,
						provider: "nolinks",
						username: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
						password: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1"
					});
					var promise = broker.findConsumers();

					expect(promise).to.eventually.eql([]).notify(done);
				});
			});
		});

		context("When pacts exist for provder 'they'", function (done) {
			context("and given the provider name and tags", function (done) {
				it("should find pacts from all known consumers of the provider given any of the tags", function (done) {
					var broker = brokerFactory({
						brokerUrl: pactBrokerBaseUrl,
						provider: "they",
						username: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
						password: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
						tags: ['prod']
					});
					var promise = broker.findConsumers();

					expect(promise).to.eventually.have.lengthOf(2).notify(done);
				});
			});

			context("and given the provider name without tags", function () {
				it("should find pacts from all known consumers of the provider", function (done) {
					var broker = brokerFactory({
						brokerUrl: pactBrokerBaseUrl,
						provider: "they",
						username: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
						password: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1"
					});
					var promise = broker.findConsumers();

					expect(promise).to.eventually.have.lengthOf(2).notify(done);
				});
			});
		});
	});
});
