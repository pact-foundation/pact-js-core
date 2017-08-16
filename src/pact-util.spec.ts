var logger = require('./logger'),
	expect = require('chai').expect,
	fs = require('fs'),
	path = require('path'),
	chai = require("chai"),
	rewire = require("rewire"),
	pactUtil = rewire("./pact-util"),
	chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

describe("Pact Util Spec", function () {
	describe("createArguments", function () {
		context("when provided any arguments", function () {
			it("should wrap its arguments in quotes", function () {
				var result = pactUtil.createArguments({
					providerBaseUrl: "http://localhost",
					pactUrls: ["http://idontexist"]
				}, {
					providerBaseUrl: '--provider-base-url',
					pactUrls: '--pact-urls'
				});
				expect(result).to.include('--provider-base-url');
				expect(result).to.include('"http://localhost"');
				expect(result).to.include('--pact-urls');
				expect(result).to.include('"http://idontexist"');
			});
		});
	});
});
