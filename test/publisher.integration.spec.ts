import path = require("path");
import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import publisherFactory from "../src/publisher";
import broker from "./integration/brokerMock";

const expect = chai.expect;
chai.use(chaiAsPromised);

describe("Publish Spec", () => {
	let server;
	const PORT = Math.floor(Math.random() * 999) + 9000;
	const pactBrokerBaseUrl = `http://localhost:${PORT}`;
	const authenticatedPactBrokerBaseUrl = `http://localhost:${PORT}/auth`;

	before((done) => server = broker.listen(PORT, () => {
		console.log(`Pact Broker Mock listening on port: ${PORT}`);
		done();
	}));

	after(() => server.close());

	context("when publishing a to a broker", () => {
		context("without authentication", () => {
			context("and the Pact contract is valid", () => {
				it("should successfully publish all Pacts", () => {
					const publisher = publisherFactory({
						pactBroker: pactBrokerBaseUrl,
						pactUrls: [path.resolve(__dirname, "integration/publish/publish-success.json")],
						consumerVersion: "1.0.0"
					});

					expect(publisher).to.be.a("object");
					expect(publisher).to.respondTo("publish");
					return expect(publisher.publish()).to.eventually.be.fulfilled;
				});

				it("should successfully tag all Pacts with `test` and `latest`", () => {
					const publisher = publisherFactory({
						pactBroker: pactBrokerBaseUrl,
						pactUrls: [path.resolve(__dirname, "integration/publish/publish-success.json")],
						consumerVersion: "1.0.0",
						tags: ["test", "latest"]
					});

					expect(publisher).to.be.a("object");
					expect(publisher).to.respondTo("publish");
					return expect(publisher.publish()).to.eventually.be.fulfilled;
				});
			});
			context("and the Pact contract is invalid", () => {
				it("should report an unsuccessful push", () => {
					const publisher = publisherFactory({
						pactBroker: pactBrokerBaseUrl,
						pactUrls: [path.resolve(__dirname, "integration/publish/publish-fail.json")],
						consumerVersion: "1.0.0"
					});

					expect(publisher).to.be.a("object");
					expect(publisher).to.respondTo("publish");
					return expect(publisher.publish()).to.eventually.be.rejected;
				});
			});
		});

		context("with authentication", () => {
			context("and valid credentials", () => {
				it("should return a sucessful promise", () => {
					const publisher = publisherFactory({
						pactBroker: authenticatedPactBrokerBaseUrl,
						pactUrls: [path.resolve(__dirname, "integration/publish/publish-success.json")],
						consumerVersion: "1.0.0",
						pactBrokerUsername: "foo",
						pactBrokerPassword: "bar"
					});

					expect(publisher).to.be.a("object");
					expect(publisher).to.respondTo("publish");
					return expect(publisher.publish()).to.eventually.be.fulfilled;
				});
			});

			context("and invalid credentials", () => {
				it("should return a rejected promise", () => {
					const publisher = publisherFactory({
						pactBroker: authenticatedPactBrokerBaseUrl,
						pactUrls: [path.resolve(__dirname, "integration/publish/publish-success.json")],
						consumerVersion: "1.0.0",
						pactBrokerUsername: "not",
						pactBrokerPassword: "right"
					});

					expect(publisher).to.be.a("object");
					expect(publisher).to.respondTo("publish");
					return expect(publisher.publish()).to.eventually.be.rejected;
				});
			});
		});

	});

	context("when publishing a directory of Pacts to a Broker", () => {
		context("and the directory contains only valid Pact contracts", () => {
			it("should asynchronously send all Pacts to the Broker", () => {
				const publisher = publisherFactory({
					pactBroker: pactBrokerBaseUrl,
					pactUrls: [path.resolve(__dirname, "integration/publish/pactDirTests")],
					consumerVersion: "1.0.0"
				});

				expect(publisher).to.be.a("object");
				expect(publisher).to.respondTo("publish");
				return expect(publisher.publish()
					.then((res) => expect(res.length).to.eq(2))).to.eventually.be.fulfilled;
			});

			it("should successfully tag all Pacts sent with `test` and `latest`", () => {
				const publisher = publisherFactory({
					pactBroker: pactBrokerBaseUrl,
					pactUrls: [path.resolve(__dirname, "integration/publish/pactDirTests")],
					consumerVersion: "1.0.0",
					tags: ["test", "latest"]
				});

				expect(publisher).to.be.a("object");
				expect(publisher).to.respondTo("publish");
				return expect(publisher.publish()
					.then((res) => expect(res.length).to.eq(2))).to.eventually.be.fulfilled;
			});
		});

		context("and the directory contains Pact and non-Pact contracts", () => {
			it("should asynchronously send only the Pact contracts to the broker", () => {
				const publisher = publisherFactory({
					pactBroker: pactBrokerBaseUrl,
					pactUrls: [path.resolve(__dirname, "integration/publish/pactDirTestsWithOtherStuff")],
					consumerVersion: "1.0.0"
				});

				expect(publisher).to.be.a("object");
				expect(publisher).to.respondTo("publish");
				return expect(publisher.publish()
					.then((res) => expect(res.length).to.eq(2))).to.eventually.be.fulfilled;
			});
		});
	});
	context("when publishing Pacts from an http-based URL", () => {
		context("and the Pact contracts are valid", () => {
			it("should asynchronously send the Pact contracts to the broker", () => {
				const publisher = publisherFactory({
					pactBroker: pactBrokerBaseUrl,
					pactUrls: [`${pactBrokerBaseUrl}/somepact`],
					consumerVersion: "1.0.0"
				});

				return expect(publisher.publish()).to.eventually.be.fulfilled;
			});

			it("should successfully tag all Pacts sent with `test` and `latest`", () => {
				const publisher = publisherFactory({
					pactBroker: pactBrokerBaseUrl,
					pactUrls: [`${pactBrokerBaseUrl}/somepact`],
					consumerVersion: "1.0.0",
					tags: ["test", "latest"]
				});

				return expect(publisher.publish()).to.eventually.be.fulfilled;
			});
		});

		context("and the Pact contracts do not exist (404)", () => {
			it("should return a rejected promise", () => {
				const publisher = publisherFactory({
					pactBroker: pactBrokerBaseUrl,
					pactUrls: [`${pactBrokerBaseUrl}/somepacturlthatdoesntexist`],
					consumerVersion: "1.0.0"
				});

				return publisher.publish()
					.then(() => { throw new Error("Expected an error but got none"); })
					.catch((err) => expect(err.message).to.contain("Cannot GET /somepacturlthatdoesntexist"));
			});
		});

		context("and the Pact contracts are invalid (no consumer/provider)", () => {
			it("should return a rejected promise", () => {
				const publisher = publisherFactory({
					pactBroker: pactBrokerBaseUrl,
					pactUrls: [`${pactBrokerBaseUrl}/somebrokenpact`],
					consumerVersion: "1.0.0"
				});

				return publisher.publish()
					.then(() => { throw new Error("Expected an error but got none"); })
					.catch((err) => expect(err.message).to.contain("Invalid Pact contract given. Unable to parse consumer and provider name"));
			});
		});
	});
});
