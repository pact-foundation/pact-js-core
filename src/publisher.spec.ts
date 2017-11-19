// tslint:disable:no-string-literal

import path = require("path");
import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import publisherFactory from "./publisher";
import logger from "./logger";
import brokerMock from "../test/integration/broker-mock";
import * as http from "http";

const expect = chai.expect;
chai.use(chaiAsPromised);

describe("Publish Spec", () => {

	const PORT = Math.floor(Math.random() * 999) + 9000;
	let server: http.Server;

	before(() => brokerMock(PORT).then((s) => {
		logger.debug(`Pact Broker Mock listening on port: ${PORT}`);
		server = s;
	}));

	after(() => server.close());

	describe("Publisher", () => {
		context("when not given pactFilesOrDirs", () => {
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
						pactFilesOrDirs: [path.dirname(process.mainModule.filename)],
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
						pactFilesOrDirs: [path.dirname(process.mainModule.filename)]
					});
				}).to.throw(Error);
			});
		});

		context("when given local Pact URLs that don't exist ", () => {
			it("should fail with an error", () => {
				expect(() => {
					publisherFactory({
						pactBroker: "http://localhost",
						pactFilesOrDirs: ["./test.json"]
					});
				}).to.throw(Error);
			});
		});

		context("when given local Pact URLs that do exist", () => {
			it("should not fail", () => {
				expect(() => {
					publisherFactory({
						pactBroker: "http://localhost",
						pactFilesOrDirs: [path.dirname(process.mainModule.filename)],
						consumerVersion: "1.0.0"
					});
				}).to.not.throw(Error);
			});
		});

		context("when given the correct arguments", () => {
			it("should return a Publisher object", () => {
				const p = publisherFactory({
					pactBroker: "http://localhost",
					pactFilesOrDirs: ["http://idontexist"],
					consumerVersion: "1.0.0"
				});
				expect(p).to.be.ok;
				expect(p.publish).to.be.a("function");
			});
		});
	});
});
