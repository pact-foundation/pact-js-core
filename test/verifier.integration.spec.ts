import verifierFactory from "../src/verifier";
import chai = require("chai");
import path = require("path");
import chaiAsPromised = require("chai-as-promised");
import providerMock from "./integration/provider-mock";
import * as http from "http";

const expect = chai.expect;
chai.use(chaiAsPromised);

describe("Verifier Integration Spec", () => {

	let server:http.Server;
	const PORT = 9123;
	const providerBaseUrl = `http://localhost:${PORT}`;
	const providerStatesSetupUrl = `${providerBaseUrl}/provider-state`;
	const pactBrokerBaseUrl = `http://localhost:${PORT}`;
	const monkeypatchFile: string = path.resolve(__dirname, "monkeypatch.rb");

	before(() => providerMock(PORT).then((s) => {
		console.log(`Pact Broker Mock listening on port: ${PORT}`);
		server = s;
	}));

	after(() => server.close());

	context("when given a successful contract", () => {
		context("without provider states", () => {
			it("should return a successful promise", () => {
				const verifier = verifierFactory({
					providerBaseUrl: providerBaseUrl,
					pactUrls: [path.resolve(__dirname, "integration/me-they-success.json")]
				});
				return expect(verifier.verify()).to.eventually.be.fulfilled;
			});
		});

		context("with Provider States", () => {
			it("should return a successful promise", () => {
				const verifier = verifierFactory({
					providerBaseUrl: providerBaseUrl,
					pactUrls: [path.resolve(__dirname, "integration/me-they-states.json")],
					providerStatesSetupUrl: providerStatesSetupUrl
				});
				return expect(verifier.verify()).to.eventually.be.fulfilled;
			});
		});

		context("with POST data", () => {
			it("should return a successful promise", () => {
				const verifier = verifierFactory({
					providerBaseUrl: providerBaseUrl,
					pactUrls: [path.resolve(__dirname, "integration/me-they-post-success.json")]
				});
				return expect(verifier.verify()).to.eventually.be.fulfilled;
			});
		});

		context("with POST data and regex validation", () => {
			it("should return a successful promise", () => {
				const verifier = verifierFactory({
					providerBaseUrl: providerBaseUrl,
					pactUrls: [path.resolve(__dirname, "integration/me-they-post-regex-success.json")]
				});
				return expect(verifier.verify()).to.eventually.be.fulfilled;
			});
		});

		context("with monkeypatch file specified", () => {
			it("should return a successful promise", () => {
				const verifier = verifierFactory({
					providerBaseUrl: providerBaseUrl,
					pactUrls: [path.resolve(__dirname, "integration/me-they-success.json")],
					monkeypatch: monkeypatchFile
				});
				return expect(verifier.verify()).to.eventually.be.fulfilled;
			});
		});
	});

	context("when given a failing contract", () => {
		it("should return a rejected promise", () => {
			const verifier = verifierFactory({
				providerBaseUrl: providerBaseUrl,
				pactUrls: [path.resolve(__dirname, "integration/me-they-fail.json")]
			});
			return expect(verifier.verify()).to.eventually.be.rejected;
		});
	});

	context("when given multiple successful API calls in a contract", () => {
		it("should return a successful promise", () => {
			const verifier = verifierFactory({
				providerBaseUrl: providerBaseUrl,
				pactUrls: [path.resolve(__dirname, "integration/me-they-multi.json")],
				providerStatesSetupUrl: providerStatesSetupUrl
			});
			return expect(verifier.verify()).to.eventually.be.fulfilled;
		});
	});

	context("when given multiple contracts", () => {
		context("from a local file", () => {
			it("should return a successful promise", () => {
				const verifier = verifierFactory({
					providerBaseUrl: providerBaseUrl,
					pactUrls: [path.resolve(__dirname, "integration/me-they-success.json"), path.resolve(__dirname, "integration/me-they-multi.json")],
					providerStatesSetupUrl: providerStatesSetupUrl
				});
				return expect(verifier.verify()).to.eventually.be.fulfilled;
			});
		});

		context("from a Pact Broker", () => {
			context("without authentication", () => {
				it("should return a successful promise", () => {
					const verifier = verifierFactory({
						providerBaseUrl: providerBaseUrl,
						pactUrls: [`${pactBrokerBaseUrl}/noauth/pacts/provider/they/consumer/me/latest`, `${pactBrokerBaseUrl}/noauth/pacts/provider/they/consumer/anotherclient/latest`],
						providerStatesSetupUrl: providerStatesSetupUrl
					});
					return expect(verifier.verify()).to.eventually.be.fulfilled;
				});
			});

			context("with authentication", () => {
				context("and a valid user/password", () => {
					it("should return a successful promise", () => {
						const verifier = verifierFactory({
							providerBaseUrl: providerBaseUrl,
							pactUrls: [`${pactBrokerBaseUrl}/pacts/provider/they/consumer/me/latest`, `${pactBrokerBaseUrl}/pacts/provider/they/consumer/anotherclient/latest`],
							providerStatesSetupUrl: providerStatesSetupUrl,
							pactBrokerUsername: "foo",
							pactBrokerPassword: "bar"
						});
						return expect(verifier.verify()).to.eventually.be.fulfilled;
					});
				});

				context("and an invalid user/password", () => {
					it("should return a rejected promise", () => {
						const verifier = verifierFactory({
							providerBaseUrl: providerBaseUrl,
							pactUrls: [`${pactBrokerBaseUrl}/pacts/provider/they/consumer/me/latest`, `${pactBrokerBaseUrl}/pacts/provider/they/consumer/anotherclient/latest`],
							providerStatesSetupUrl: providerStatesSetupUrl,
							pactBrokerUsername: "foo",
							pactBrokerPassword: "baaoeur"
						});
						return expect(verifier.verify()).to.eventually.be.rejected;
					});

					it("should return the verifier error output in the returned promise", () => {
						const verifier = verifierFactory({
							providerBaseUrl: providerBaseUrl,
							pactUrls: [`${pactBrokerBaseUrl}/pacts/provider/they/consumer/me/latest`, `${pactBrokerBaseUrl}/pacts/provider/they/consumer/anotherclient/latest`],
							providerStatesSetupUrl: providerStatesSetupUrl,
							pactBrokerUsername: "foo",
							pactBrokerPassword: "baaoeur"
						});
						return expect(verifier.verify()).to.eventually.be.rejected;
					});
				});
			});
		});
	});

	context("when publishing verification results to a Pact Broker", () => {
		context("and there is a valid verification HAL link in the Pact file", () => {
			it("should return a successful promise", () => {
				const verifier = verifierFactory({
					providerBaseUrl: providerBaseUrl,
					pactUrls: [path.resolve(__dirname, "integration/publish-verification-example-success.json")],
					providerStatesSetupUrl: providerStatesSetupUrl,
					publishVerificationResult: true,
					providerVersion: "1.0.0"
				});
				return expect(verifier.verify()).to.eventually.be.fulfilled;
			});
		});

		context("and there is an invalid verification HAL link in the Pact file", () => {
			it("should fail with an error", () => {
				const verifier = verifierFactory({
					providerBaseUrl: providerBaseUrl,
					pactUrls: [path.resolve(__dirname, "integration/publish-verification-example-fail.json")],
					providerStatesSetupUrl: providerStatesSetupUrl,
					publishVerificationResult: true,
					providerVersion: "1.0.0"
				});
				return expect(verifier.verify()).to.eventually.be.fulfilled;
			});
		});
	});
});
