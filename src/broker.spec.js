var brokerFactory = require('./broker'),
	expect = require('chai').expect,
	chai = require("chai"),
	brokerMock = require('../test/integration/brokerMock.js'),
	chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

describe("Broker Spec", function () {

	var PORT = 9124,
		pactBrokerBaseUrl = 'http://localhost:' + PORT,
		authenticatedPactBrokerBaseUrl = 'http://localhost:' + PORT + '/auth';

	before(function (done) {
		brokerMock.listen(PORT, function () {
			console.log('Broker (Mock) running on port: ' + PORT);
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

	describe("Get Request Options", function () {
		context("when username and password are provided", function () {
			it("should return a hash containing auth details", function () {
				var broker = brokerFactory({
					brokerUrl: "http://test.pact.dius.com.au",
					provider: "foobar",
					username: "username",
					password: "password"
				});
				expect(broker.getRequestOptions()).to.eql({
					'auth': {
						'user': "username",
						'password': "password"
					}
				})
			});
		});
		context("when either a username or password are not provided", function () {
			it("should return an empty object", function () {
				var broker = brokerFactory({
					brokerUrl: "http://test.pact.dius.com.au",
					provider: "foobar",
					password: "password"
				});
				expect(broker.getRequestOptions()).to.eql({})
			});
		});
	});

	describe("Find Consumers", function () {
		context("when given the provider name and tags", function (done) {
			it("should find pacts from all known consumers of the provider given any of the tags", function (done) {
				var broker = brokerFactory({
					brokerUrl: pactBrokerBaseUrl,
					provider: "they",
					username: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
					password: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
					tags: ['prod']
				});
				var promise = broker.findConsumers()

				expect(promise).to.eventually.have.lengthOf(2).notify(done)
			});
		});

		context("when given the provider name without tags", function () {
			it("should find pacts from all known consumers of the provider", function (done) {
				var broker = brokerFactory({
					brokerUrl: pactBrokerBaseUrl,
					provider: "they",
					username: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
					password: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1"
				});
				var promise = broker.findConsumers()

				expect(promise).to.eventually.have.lengthOf(2).notify(done)
			});
		});
	});
});
