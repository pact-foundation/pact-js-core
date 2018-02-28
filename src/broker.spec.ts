import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import logger from "./logger";
import brokerMock from "../test/integration/broker-mock";
import brokerFactory, {BrokerOptions} from "./broker";
import * as http from "http";

const expect = chai.expect;
chai.use(chaiAsPromised);

describe("Broker Spec", () => {
	let server: http.Server;
	const PORT = Math.floor(Math.random() * 999) + 9000;
	const pactBrokerBaseUrl = `http://localhost:${PORT}`;

	before(() => brokerMock(PORT).then((s) => {
		logger.debug(`Pact Broker Mock listening on port: ${PORT}`);
		server = s;
	}));

	after(() => server.close());

	describe("Broker", () => {
		context("when not given a Pact Broker URL", () => {
			it("should fail with an error", () => {
				expect(() => brokerFactory({
					provider: "foobar"
				} as BrokerOptions)).to.throw(Error);
			});
		});
		context("when not given a Provider name", () => {
			it("should fail with an error", () => {
				expect(() => {
					brokerFactory({
						brokerUrl: "http://test.pact.dius.com.au"
					} as BrokerOptions);
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
					return expect(brokerFactory({
						brokerUrl: pactBrokerBaseUrl,
						provider: "notfound"
					}).findConsumers()).to.eventually.be.rejected;
				});
			});
		});
		context("when no pacts exist for provider 'nolinks'", () => {
			context("and given the provider name", () => {
				it("should return an empty array of pact links", () => {
					return expect(brokerFactory({
						brokerUrl: pactBrokerBaseUrl,
						provider: "nolinks"
					}).findConsumers()).to.eventually.eql([]);
				});
			});
		});

		context("When pacts exist for provider 'they'", () => {
			context("and given the provider name and tags", () => {
				it("should find pacts from all known consumers of the provider given any of the tags", () => {
					return expect(brokerFactory({
						brokerUrl: pactBrokerBaseUrl,
						provider: "they",
						tags: ["prod"]
					}).findConsumers()).to.eventually.have.lengthOf(2);
				});
			});

			context("and given the provider name without tags", () => {
				it("should find pacts from all known consumers of the provider", () => {
					return expect(brokerFactory({
						brokerUrl: pactBrokerBaseUrl,
						provider: "they"
					}).findConsumers()).to.eventually.have.lengthOf(2);
				});
			});
		});
	});
});
