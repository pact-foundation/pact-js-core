/* global describe:true, before:true, after:true, it:true, global:true, process:true */

var verifierFactory = require('./verifier'),
	logger = require('./logger'),
	expect = require('chai').expect,
	fs = require('fs'),
	path = require('path'),
	chai = require("chai"),
	rewire = require("rewire"),
	verifier = rewire("./verifier.js");
	sanitisePath = verifier.__get__("sanitisePath");
	chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

describe("Verifier Spec", function () {

	before(function () {
		logger.level('debug');
	});

	afterEach(function (done) {
		done();
	});

	describe("Verifier", function () {
		context("when not given --pact-urls or --provider-base-url", function () {
			it("should fail with an error", function () {
				expect(function () {
					verifierFactory({});
				}).to.throw(Error);
			});
		});
		context("when given --provider-states-url and not --provider-states-setup-url", function () {
			it("should fail with an error", function () {
				expect(function () {
					verifierFactory({"providerStatesUrl": "http://foo/provider-states"});
				}).to.throw(Error);
			});
		});
		context("when given --provider-states-setup-url and not --provider-states-url", function () {
			it("should fail with an error", function () {
				expect(function () {
					verifierFactory({"providerStatesSetupUrl": "http://foo/provider-states/setup"});
				}).to.throw(Error);
			});
		});
		context("when given local Pact URLs that don't exist", function () {
			it("should fail with an error", function () {
				expect(function () {
					verifierFactory({
						providerBaseUrl: "http://localhost",
						pactUrls: ["test.json"]
					});
				}).to.throw(Error);
			});
		});
		context("when given remote Pact URLs that don't exist", function () {
			it("should pass through to the Pact Verifier regardless", function () {
				expect(function () {
					verifierFactory({
						providerBaseUrl: "http://localhost",
						pactUrls: ["http://idontexist"]
					});
				}).to.not.throw(Error);
			});
		});
		context("when given local Pact URLs that do exist", function () {
			it("should not fail", function () {
				expect(function () {
					verifierFactory({
						providerBaseUrl: "http://localhost",
						pactUrls: [path.dirname(process.mainModule.filename)]
					});
				}).to.not.throw(Error);
			});
		});
		context("when given the correct arguments", function () {
			it("should return a Verifier object", function () {
				var verifier = verifierFactory({
					providerBaseUrl: "http://localhost",
					pactUrls: ["http://idontexist"]
				});
				expect(verifier).to.be.a('object');
				expect(verifier).to.respondTo('verify');
			});
		});
	});

	describe("verify", function () {
		context("when given a successful scenario", function () {
			context("with no provider States", function () {
				it("should return a successful promise with exit-code 0", function () {
					var verifier = verifierFactory({
						providerBaseUrl: "http://localhost",
						pactUrls: ["http://idontexist"]
					});
					return expect(verifier.verify()).to.eventually.be.resolved;
				});
			});
		});
	});

	describe("sanitise", function () {
		context("when given windows path", function () {
			context("and the path is not an extended Windows path", function () {
				it("should convert to an absolute linux path", function () {
					expect(sanitisePath("c:\\test\\pact.json")).to.eq("/test/pact.json");
				});
				it('should convert backwards-slash paths to forward slash paths', function () {
					expect(sanitisePath('c:/aaaa\\bbbb')).to.eq('/aaaa/bbbb');
					expect(sanitisePath('c:\\aaaa\\bbbb')).to.eq('/aaaa/bbbb');
				});
			});
			context("and the path is an extended Winows path", function () {
				it('should not convert extended-length paths', function () {
					var path = '\\\\?\\c:\\aaaa\\bbbb';
					expect(sanitisePath(path)).to.eq(path);
				});
			});
			context("and the path contains unicode", function () {
				it('should not convert paths with Unicode', function () {
					var path = 'c:\\aaaa\\bbbb\\★';
					expect(sanitisePath(path)).to.eq(path);
				});
			})
		});
		context("when given a linux path", function () {
			it("should not modify the path", function () {
				var path = '/usr/local/foo.json';
				expect(sanitisePath(path)).to.eq(path);
			});
		});
	});
});
