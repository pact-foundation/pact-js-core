import path = require("path");
import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import verifierFactory from "./verifier";

const expect = chai.expect;
chai.use(chaiAsPromised);

describe("Verifier Spec", () => {
	describe("Verifier", () => {
		context("when automatically finding pacts from a broker", () => {
			context("when not given --pact-urls and only --provider", () => {
				it("should fail with an error", () => {
					expect(() => verifierFactory({
						providerBaseUrl: "http://localhost",
						provider: "someprovider"
					})).to.throw(Error);
				});
			});

			context("when not given --pact-urls and only --pact-broker-url", () => {
				it("should fail with an error", () => {
					expect(() => verifierFactory({
						providerBaseUrl: "http://localhost",
						pactBrokerUrl: "http://foo.com"
					})).to.throw(Error);
				});
			});

			context("when given valid arguments", () => {
				it("should return a Verifier object", () => {
					const verifier = verifierFactory({
						providerBaseUrl: "http://localhost",
						pactBrokerUrl: "http://foo.com",
						provider: "someprovider"
					});
					expect(verifier).to.be.a("object");
					expect(verifier).to.respondTo("verify");
				});
			});
		});

		context("when not given --pact-urls or --provider-base-url", () => {
			it("should fail with an error", () => {
				expect(() => verifierFactory({})).to.throw(Error);
			});
		});

		context("when given --provider-states-setup-url", () => {
			it("should fail with an error", () => {
				expect(() => verifierFactory({"providerStatesSetupUrl": "http://foo/provider-states/setup"})).to.throw(Error);
			});
		});

		context("when given local Pact URLs that don't exist", () => {
			it("should fail with an error", () => {
				expect(() => verifierFactory({
					providerBaseUrl: "http://localhost",
					pactUrls: ["test.json"]
				})).to.throw(Error);
			});
		});

		context("when given an invalid timeout", () => {
			it("should fail with an error", () => {
				expect(() => {
					verifierFactory({
						providerBaseUrl: "http://localhost",
						pactUrls: ["http://idontexist"],
						timeout: -10
					});
				}).to.throw(Error);
			});
		});

		context("when given remote Pact URLs that don't exist", () => {
			it("should pass through to the Pact Verifier regardless", () => {
				expect(() => verifierFactory({
					providerBaseUrl: "http://localhost",
					pactUrls: ["http://idontexist"]
				})).to.not.throw(Error);
			});
		});

		context("when given local Pact URLs that do exist", () => {
			it("should not fail", () => {
				expect(() => verifierFactory({
					providerBaseUrl: "http://localhost",
					pactUrls: [path.dirname(process.mainModule.filename)]
				})).to.not.throw(Error);
			});
		});

		context("when requested to publish verification results to a Pact Broker", () => {
			context("and specifies a provider version", () => {
				it("should pass through to the Pact Verifier", () => {
					expect(() => verifierFactory({
						providerBaseUrl: "http://localhost",
						pactUrls: ["http://idontexist"],
						publishVerificationResult: true,
						providerVersion: "1.0.0"
					})).to.not.throw(Error);
				});
			});
		});

		context("when requested to publish verification results to a Pact Broker", () => {
			context("and does not specify provider version", () => {
				it("should fail with an error", () => {
					expect(() => verifierFactory({
						providerBaseUrl: "http://localhost",
						pactUrls: ["http://idontexist"],
						publishVerificationResult: true
					})).to.throw(Error);
				});
			});
		});

		context("when given the correct arguments", () => {
			it("should return a Verifier object", () => {
				const verifier = verifierFactory({
					providerBaseUrl: "http://localhost",
					pactUrls: ["http://idontexist"]
				});
				expect(verifier).to.be.a("object");
				expect(verifier).to.respondTo("verify");
			});
		});
	});

	describe("verify", () => {
		context("when given a successful scenario", () => {
			context("with no provider States", () => {
				it("should return a successful promise with exit-code 0", () => {
					const verifier = verifierFactory({
						providerBaseUrl: "http://localhost",
						pactUrls: ["http://idontexist"]
					});
					expect(verifier.verify()).to.eventually.be.fulfilled;
				});
			});
		});
	});
});
