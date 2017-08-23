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
		console.log("Broker (Mock) running on port: " + PORT);
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

	context("constructPutUrl", () => {
		let constructPutUrl: (options: any, data: any) => string;

		beforeEach(() => {
			const publisher = publisherFactory({
				pactBroker: "http://localhost",
				pactUrls: [path.dirname(process.mainModule.filename)],
				consumerVersion: "1.0.0"
			});
			constructPutUrl = (publisher as any)["__constructPutUrl"].bind(publisher);
		});

		context("when given a valid config object and pact JSON", () => {
			it("should return a PUT url", () => {
				let options = {
					"pactBroker": "http://foo",
					"consumerVersion": "1"
				};
				let data = {"consumer": {"name": "consumerName"}, "provider": {"name": "providerName"}};
				expect(constructPutUrl(options, data)).to.eq("http://foo/pacts/provider/providerName/consumer/consumerName/version/1");
			});
		});

		context("when given an invalid config object", () => {
			it("should throw Error when pactBroker is not specified", () => {
				let options = {"someotherurl": "http://foo"};
				let data = {"consumer": {"name": "consumerName"}, "provider": {"name": "providerName"}};
				expect(() => constructPutUrl(options, data)).to.throw(Error, "Cannot construct Pact publish URL: 'pactBroker' not specified");
			});

			it("should throw Error when consumerVersion is not specified", () => {
				let options = {"pactBroker": "http://foo"};
				let data = {"consumer": {"name": "consumerName"}, "provider": {"name": "providerName"}};
				expect(() => constructPutUrl(options, data)).to.throw(Error, "Cannot construct Pact publish URL: 'consumerVersion' not specified");
			});
		});

		context("when given an invalid Pact contract (no consumer/provider keys)", () => {
			it("should return a PUT url", () => {
				let options = {"pactBroker": "http://foo", "consumerVersion": "1"};
				let data = {};
				expect(() => {
					constructPutUrl(options, data);
				}).to.throw(Error, "Invalid Pact contract given. Unable to parse consumer and provider name");
			});
		});

		context("when given an invalid Pact contract (no name keys)", () => {
			it("should return a PUT url", () => {
				let options = {"pactBroker": "http://foo", "consumerVersion": "1"};
				let data = {"consumer": {}, "provider": {}};
				expect(() => {
					constructPutUrl(options, data);
				}).to.throw(Error, "Invalid Pact contract given. Unable to parse consumer and provider name");
			});
		});
	});

	context("constructTagUrl", () => {
		let constructTagUrl: (options: any, tag: string, data: any) => string;

		beforeEach(() => {
			const publisher = publisherFactory({
				pactBroker: "http://localhost",
				pactUrls: [path.dirname(process.mainModule.filename)],
				consumerVersion: "1.0.0"
			});
			constructTagUrl = (publisher as any)["__constructTagUrl"].bind(publisher);
		});

		context("when given a valid config object and pact JSON", () => {
			it("should return a PUT url", () => {
				let options = {"pactBroker": "http://foo", consumerVersion: "1.0"};
				let data = {"consumer": {"name": "consumerName"}};
				expect(constructTagUrl(options, "test", data)).to.eq("http://foo/pacticipants/consumerName/versions/1.0/tags/test");
			});
		});
		context("when given an invalid config object", () => {
			it("should throw Error when pactBroker is not specified", () => {
				let options = {"someotherurl": "http://foo", consumerVersion: "1.0"};
				let data = {"consumer": {"name": "consumerName"}};
				expect(() => constructTagUrl(options, "", data)).to.throw(Error, "Cannot construct Pact Tag URL: 'pactBroker' not specified");
			});

			it("should throw Error when consumerVersion is not specified", () => {
				let options = {"pactBroker": "http://foo"};
				let data = {"consumer": {"name": "consumerName"}, "provider": {"name": "providerName"}};
				expect(() => constructTagUrl(options, "", data)).to.throw(Error, "Cannot construct Pact Tag URL: 'consumerVersion' not specified");
			});
		});
		context("when given an invalid Pact contract (no consumer key)", () => {
			it("should return a PUT url", () => {
				let options = {"pactBroker": "http://foo", consumerVersion: "1.0"};
				let data = {};
				expect(() => {
					constructTagUrl(options, "", data);
				}).to.throw(Error, "Invalid Pact contract given. Unable to parse consumer name");
			});
		});
		context("when given an invalid Pact contract (no name keys)", () => {
			it("should return a PUT url", () => {
				let options = {"pactBroker": "http://foo", consumerVersion: "1.0"};
				let data = {"consumer": {}};
				expect(() => {
					constructTagUrl(options, "", data);
				}).to.throw(Error, "Invalid Pact contract given. Unable to parse consumer name");
			});
		});
	});
})
;
