// tslint:disable:no-string-literal

import path = require("path");
import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import publisherFactory from "./publisher";
import brokerMock from "../test/integration/brokerMock";

const expect = chai.expect;
chai.use(chaiAsPromised);

describe("Publish Spec", () => {

	const PORT = Math.floor(Math.random() * 999) + 9000;

	before((done) => brokerMock.listen(PORT, () => {
		console.log(`Broker (Mock) running on port: ${PORT}`);
		done();
	}));

	describe("Publisher", () => {
		context("when not given pactUrls", () => {
			it("should fail with an error", () => {
				expect(() => {
					publisherFactory({
						pactBroker: "http://localhost",
						consumerVersion: "1.0.0"
					});
				}).to.throw(Error);
			});
		});

		context("when not given pactBroker", () => {
			it("should fail with an error", () => {
				expect(() => {
					publisherFactory({
						pactUrls: ["http://localhost"],
						consumerVersion: "1.0.0"
					});
				}).to.throw(Error);
			});
		});

		context("when not given consumerVersion", () => {
			it("should fail with an error", () => {
				expect(() => {
					publisherFactory({
						pactBroker: "http://localhost",
						pactUrls: [path.dirname(process.mainModule.filename)]
					});
				}).to.throw(Error);
			});
		});

		context("when given local Pact URLs that don't exist ", () => {
			it("should fail with an error", () => {
				expect(() => {
					publisherFactory({
						pactBroker: "http://localhost",
						pactUrls: ["./test.json"]
					});
				}).to.throw(Error);
			});
		});

		context("when given local Pact URLs that do exist", () => {
			it("should not fail", () => {
				expect(() => {
					publisherFactory({
						pactBroker: "http://localhost",
						pactUrls: [path.dirname(process.mainModule.filename)],
						consumerVersion: "1.0.0"
					});
				}).to.not.throw(Error);
			});
		});

		context("when given the correct arguments", () => {
			it("should return a Publisher object", () => {
				const p = publisherFactory({
					pactBroker: "http://localhost",
					pactUrls: ["http://idontexist"],
					consumerVersion: "1.0.0"
				});
				expect(p).to.be.ok;
				expect(p.publish).to.be.a("function");
			});
		});
	});
});
