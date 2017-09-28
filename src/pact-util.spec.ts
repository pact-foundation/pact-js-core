import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import pactUtil from "./pact-util";

const expect = chai.expect;

chai.use(chaiAsPromised);

describe("Pact Util Spec", () => {
	describe("createArguments", () => {
		context("when provided any arguments", () => {
			it("should wrap its arguments in quotes", () => {
				const result = pactUtil.createArguments({
					providerBaseUrl: "http://localhost",
					pactUrls: ["http://idontexist"]
				}, {
					providerBaseUrl: "--provider-base-url",
					pactUrls: "--pact-urls"
				});
				expect(result).to.include("--provider-base-url");
				expect(result).to.include("'http://localhost'");
				expect(result).to.include("--pact-urls");
				expect(result).to.include("'http://idontexist'");
			});
		});
	});
});
