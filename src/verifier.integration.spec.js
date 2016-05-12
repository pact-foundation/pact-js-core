/* global describe:true, before:true, after:true, it:true, global:true, process:true */

var serverFactory = require('./verifier.js'),
	expect = require('chai').expect,
	fs = require('fs'),
	path = require('path'),
	chai = require("chai"),
	chaiAsPromised = require("chai-as-promised"),
	provider = require('./integration/provider.js')

chai.use(chaiAsPromised);

describe("Verifier Integration Spec", function () {

	var pact,
		verifierFactory = require('./verifier'),
		PORT = Math.floor(Math.random() * 999) + 9000,
		providerBaseUrl = 'http://localhost:' + PORT,
		providerStatesUrl = providerBaseUrl + '/provider-states',
		providerStatesSetupUrl = providerBaseUrl + '/provider-state/';

	before(function(done) {
    provider.listen(PORT, function () {
			console.log('Listening on port: ' + PORT);
      done();
    });
  });

	afterEach(function (done) {
		done();
	});

	describe("verify", function () {
		context("when given a successful contract", function() {
			context("without provider states", function () {
				it("should return a successful promise with exit-code 0", function () {
					var verifier = verifierFactory({
						providerBaseUrl: providerBaseUrl,
						pactUrls: [ __dirname + "/integration/me-they-success.json" ]
					});
					return expect(verifier.verify()).to.eventually.be.fulfilled;
				});
			});

			context("with Provider States", function () {
				it("should return a successful promise with exit-code 0", function () {
					var verifier = verifierFactory({
						providerBaseUrl: providerBaseUrl,
						pactUrls: [ __dirname + "/integration/me-they-states.json" ],
						providerStatesUrl: providerStatesUrl,
						providerStatesSetupUrl: providerStatesSetupUrl
					});
					return expect(verifier.verify()).to.eventually.be.fulfilled;
				});
			});
		});

		context("when given a failing contract", function() {
			it("should return a rejected promise with exit-code > 0", function () {
				var verifier = verifierFactory({
					providerBaseUrl: providerBaseUrl,
					pactUrls: [ __dirname + "/integration/me-they-fail.json" ]
				});
				return expect(verifier.verify()).to.eventually.be.rejected;
			});
		});

		context("when given multiple successful API calls in a contract", function () {
			it("should return a successful promise with exit-code 0", function () {
				var verifier = verifierFactory({
					providerBaseUrl: providerBaseUrl,
					pactUrls: [ __dirname + "/integration/me-they-multi.json" ],
					providerStatesUrl: providerStatesUrl,
					providerStatesSetupUrl: providerStatesSetupUrl
				});
				return expect(verifier.verify()).to.eventually.be.fulfilled;
			});
		});

		context("when given multiple contracts", function () {
			context("from a local file", function () {
				it("should return a successful promise with exit-code 0", function () {
					var verifier = verifierFactory({
						providerBaseUrl: providerBaseUrl,
						pactUrls: [ __dirname + "/integration/me-they-success.json", __dirname + "/integration/me-they-multi.json" ],
						providerStatesUrl: providerStatesUrl,
						providerStatesSetupUrl: providerStatesSetupUrl
					});
					return expect(verifier.verify()).to.eventually.be.fulfilled;
				});
			});

			context("from a Pact Broker", function () {
				it("should return a successful promise with exit-code 0", function () {
					var verifier = verifierFactory({
						providerBaseUrl: providerBaseUrl,
						pactUrls: [providerBaseUrl + '/pacts/provider/they/consumer/me/latest', providerBaseUrl + '/pacts/provider/they/consumer/anotherclient/latest'],
						providerStatesUrl: providerStatesUrl,
						providerStatesSetupUrl: providerStatesSetupUrl
					});
					return expect(verifier.verify()).to.eventually.be.fulfilled;
				});
			});
		});
	});
});
