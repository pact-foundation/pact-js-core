import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import pactUtil, {DEFAULT_ARG} from "./pact-util";

const expect = chai.expect;

chai.use(chaiAsPromised);

describe("Pact Util Spec", () => {
	describe("createArguments", () => {
		describe("when called with an object", () => {
			it("should return an array of all arguments", () => {
				const result = pactUtil.createArguments({providerBaseUrl: "http://localhost",}, {providerBaseUrl: "--provider-base-url",});
				expect(result).to.be.an("array").that.includes("--provider-base-url");
				expect(result.length).to.be.equal(2);
			});

			it("should wrap its argument values in quotes", () => {
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
		describe("when called with an array", () => {
			describe("with one element",() => {
				it("should return an array of all arguments", () => {
					const result = pactUtil.createArguments([{providerBaseUrl: "http://localhost",}], {providerBaseUrl: "--provider-base-url",});
					expect(result).to.be.an("array").that.includes("--provider-base-url");
					expect(result.length).to.be.equal(2);
				});

				it("should wrap its argument values in quotes", () => {
					const result = pactUtil.createArguments([{
						providerBaseUrl: "http://localhost",
						pactUrls: ["http://idontexist"]
					}], {
						providerBaseUrl: "--provider-base-url",
						pactUrls: "--pact-urls"
					});
					expect(result).to.include("--provider-base-url");
					expect(result).to.include("'http://localhost'");
					expect(result).to.include("--pact-urls");
					expect(result).to.include("'http://idontexist'");
				});
			});
			describe("with multiple elements",() => {
				it("should wrap its argument values in quotes", () => {
					const result = pactUtil.createArguments(
						[
							{participant: "one"},
							{version: "v1"},
							{participant: "two"},
							{version: "v2"}
						],
						{version: "--version" ,participant: "--participant",}
					);

					expect(result).to.be.an("array");
					expect(result).to.eql(
						["--participant",
						"'one'",
						"--version",
						"'v1'",
						"--participant",
						"'two'",
						"--version",
						"'v2'"]);
				});
			});
		});

		it("should make DEFAULT values first, everything else after", () => {
			const result = pactUtil.createArguments({
				providerBaseUrl: "http://localhost",
				pactUrls: ["http://idontexist"]
			}, {
				providerBaseUrl: "--provider-base-url",
				pactUrls: DEFAULT_ARG
			});
			expect(result.length).to.be.equal(3);
			expect(result[0]).to.be.equal("'http://idontexist'");
		});
	});
});
