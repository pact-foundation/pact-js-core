import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import logger from "./logger";
import brokerMock from "../test/integration/brokerMock.js";
import brokerFactory from "./broker";

const expect = require("chai").expect;
chai.use(chaiAsPromised);

describe("Broker Spec", () => {
	const PORT = 9124;
	const pactBrokerBaseUrl = `http://localhost:${PORT}`;

	before((done) => brokerMock.listen(PORT, () => {
		logger.debug(`Broker (Mock) running on port: ${PORT}`);
		done();
	}));

	describe("Broker", () => {
		context("when not given a Pact Broker URL", () => {
			it("should fail with an error", () => {
				expect(() => brokerFactory({
					provider: "foobar"
				})).to.throw(Error);
			});
		});
		context("when not given a Provider name", () => {
			it("should fail with an error", () => {
				expect(() => {
					brokerFactory({
						brokerUrl: "http://test.pact.dius.com.au"
					});
				}).to.throw(Error);
			});
		});
		context("when given a valid Pact Broker URL", () => {
			it("should return a Broker object", () => {
				expect(() => brokerFactory({
					brokerUrl: "http://test.pact.dius.com.au",
					provider: "foobar"
				})).to.not.throw(Error);
			});
		});
	});

	describe("Find Consumers", () => {
		context("when provider 'notfound' does not exist", () => {
			context("and given the provider name 'notfound'", () => {
				it("should fail with an Error", () => {
					const broker = brokerFactory({
						brokerUrl: pactBrokerBaseUrl,
						provider: "notfound",
						username: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
						password: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1"
					});
					const promise = broker.findConsumers();
					return expect(promise).to.eventually.be.rejected;
				});
			});
		});
		context("when no pacts exist for provider 'nolinks'", () => {
			context("and given the provider name", () => {
				it("should return an empty array of pact links", () => {
					const broker = brokerFactory({
						brokerUrl: pactBrokerBaseUrl,
						provider: "nolinks",
						username: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
						password: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1"
					});
					const promise = broker.findConsumers();
					return expect(promise).to.eventually.eql([]);
				});
			});
		});

		context("When pacts exist for provider 'they'", () => {
			context("and given the provider name and tags", () => {
				it("should find pacts from all known consumers of the provider given any of the tags", () => {
					const broker = brokerFactory({
						brokerUrl: pactBrokerBaseUrl,
						provider: "they",
						username: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
						password: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
						tags: ["prod"]
					});
					const promise = broker.findConsumers();
					return expect(promise).to.eventually.have.lengthOf(2);
				});
			});

			context("and given the provider name without tags", () => {
				it("should find pacts from all known consumers of the provider", () => {
					const broker = brokerFactory({
						brokerUrl: pactBrokerBaseUrl,
						provider: "they",
						username: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
						password: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1"
					});
					const promise = broker.findConsumers();
					return expect(promise).to.eventually.have.lengthOf(2);
				});
			});
		});
	});
});
