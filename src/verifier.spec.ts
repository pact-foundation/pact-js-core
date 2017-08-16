var verifierFactory = require('./verifier'),
	logger = require('./logger'),
	expect = require('chai').expect,
	fs = require('fs'),
	path = require('path'),
	chai = require("chai"),
	rewire = require("rewire"),
	verifier = rewire("./verifier.js"),
	chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

describe("Verifier Spec", function () {
	describe("Verifier", function () {
		context("when automatically finding pacts from a broker", function () {
			context("when not given --pact-urls and only --provider", function () {
				it("should fail with an error", function () {
					expect(function () {
						verifierFactory({
							providerBaseUrl: "http://localhost",
							provider: "someprovider"
						});
					}).to.throw(Error);
				});
			});
			context("when not given --pact-urls and only --pact-broker-url", function () {
				it("should fail with an error", function () {
					expect(function () {
						verifierFactory({
							providerBaseUrl: "http://localhost",
							pactBrokerUrl: "http://foo.com"
						});
					}).to.throw(Error);
				});
			});
			context("when given valid arguments", function () {
				it("should return a Verifier object", function () {
					var verifier = verifierFactory({
						providerBaseUrl: "http://localhost",
						pactBrokerUrl: "http://foo.com",
						provider: "someprovider"
					});

					expect(verifier).to.be.a('object');
					expect(verifier).to.respondTo('verify');
				});
			});
		})
		context("when not given --pact-urls or --provider-base-url", function () {
			it("should fail with an error", function () {
				expect(function () {
					verifierFactory({});
				}).to.throw(Error);
			});
		});
		context("when given --provider-states-url and not --provider-states-setup-url", function () {
			it("should fail with an error", function () {
				expect(function () {
					verifierFactory({ "providerStatesUrl": "http://foo/provider-states" });
				}).to.throw(Error);
			});
		});
		context("when given --provider-states-setup-url and not --provider-states-url", function () {
			it("should fail with an error", function () {
				expect(function () {
					verifierFactory({ "providerStatesSetupUrl": "http://foo/provider-states/setup" });
				}).to.throw(Error);
			});
		});
		context("when given local Pact URLs that don't exist", function () {
			it("should fail with an error", function () {
				expect(function () {
					verifierFactory({
						providerBaseUrl: "http://localhost",
						pactUrls: ["test.json"]
					});
				}).to.throw(Error);
			});
		});
		context("when given an invalid timeout", function () {
			it("should fail with an error", function () {
				expect(function () {
					verifierFactory({
						providerBaseUrl: "http://localhost",
						pactUrls: ["http://idontexist"],
						timeout: -10
					});
				}).to.throw(Error);
			});
		});

		context("when given remote Pact URLs that don't exist", function () {
			it("should pass through to the Pact Verifier regardless", function () {
				expect(function () {
					verifierFactory({
						providerBaseUrl: "http://localhost",
						pactUrls: ["http://idontexist"]
					});
				}).to.not.throw(Error);
			});
		});
		context("when given local Pact URLs that do exist", function () {
			it("should not fail", function () {
				expect(function () {
					verifierFactory({
						providerBaseUrl: "http://localhost",
						pactUrls: [path.dirname(process.mainModule.filename)]
					});
				}).to.not.throw(Error);
			});
		});

		context("when requested to publish verification results to a Pact Broker", function () {
			context("and specifies a provider version", function () {
				it("should pass through to the Pact Verifier", function () {
					expect(function () {
						verifierFactory({
							providerBaseUrl: "http://localhost",
							pactUrls: ["http://idontexist"],
							publishVerificationResult: true,
							providerVersion: "1.0.0"
						});
					}).to.not.throw(Error);
				});
			});
		});

		context("when requested to publish verification results to a Pact Broker", function () {
			context("and does not specify provider version", function () {
				it("should fail with an error", function () {
					expect(function () {
						verifierFactory({
							providerBaseUrl: "http://localhost",
							pactUrls: ["http://idontexist"],
							publishVerificationResult: true
						});
					}).to.throw(Error);
				});
			});
		});

		context("when given the correct arguments", function () {
			it("should return a Verifier object", function () {
				var verifier = verifierFactory({
					providerBaseUrl: "http://localhost",
					pactUrls: ["http://idontexist"]
				});
				expect(verifier).to.be.a('object');
				expect(verifier).to.respondTo('verify');
			});
		});
	});

	describe("verify", function () {
		context("when given a successful scenario", function () {
			context("with no provider States", function () {
				it("should return a successful promise with exit-code 0", function () {
					var verifier = verifierFactory({
						providerBaseUrl: "http://localhost",
						pactUrls: ["http://idontexist"]
					});
					return expect(verifier.verify()).to.eventually.be.resolved;
				});
			});
		});
	});
});
