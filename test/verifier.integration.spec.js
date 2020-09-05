"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var verifier_1 = require("../src/verifier");
var chai = require("chai");
var path = require("path");
var chaiAsPromised = require("chai-as-promised");
var provider_mock_1 = require("./integration/provider-mock");
var expect = chai.expect;
chai.use(chaiAsPromised);
describe('Verifier Integration Spec', function () {
    var server;
    var PORT = 9123;
    var providerBaseUrl = "http://localhost:" + PORT;
    var providerStatesSetupUrl = providerBaseUrl + "/provider-state";
    var pactBrokerBaseUrl = "http://localhost:" + PORT;
    var monkeypatchFile = path.resolve(__dirname, 'monkeypatch.rb');
    before(function () {
        return provider_mock_1.default(PORT).then(function (s) {
            console.log("Pact Broker Mock listening on port: " + PORT);
            server = s;
        });
    });
    after(function () { return server.close(); });
    context('when given a successful contract', function () {
        context('with spaces in the file path', function () {
            it('should return a successful promise', function () {
                return expect(verifier_1.default({
                    providerBaseUrl: providerBaseUrl,
                    pactUrls: [
                        path.resolve(__dirname, 'integration/me-they-weird path-success.json'),
                    ],
                }).verify()).to.eventually.be.fulfilled;
            });
        });
        context('without provider states', function () {
            it('should return a successful promise', function () {
                return expect(verifier_1.default({
                    providerBaseUrl: providerBaseUrl,
                    pactUrls: [
                        path.resolve(__dirname, 'integration/me-they-success.json'),
                    ],
                }).verify()).to.eventually.be.fulfilled;
            });
        });
        context('with Provider States', function () {
            it('should return a successful promise', function () {
                return expect(verifier_1.default({
                    providerBaseUrl: providerBaseUrl,
                    pactUrls: [
                        path.resolve(__dirname, 'integration/me-they-states.json'),
                    ],
                    providerStatesSetupUrl: providerStatesSetupUrl,
                }).verify()).to.eventually.be.fulfilled;
            });
        });
        context('with POST data', function () {
            it('should return a successful promise', function () {
                return expect(verifier_1.default({
                    providerBaseUrl: providerBaseUrl,
                    pactUrls: [
                        path.resolve(__dirname, 'integration/me-they-post-success.json'),
                    ],
                }).verify()).to.eventually.be.fulfilled;
            });
        });
        context('with POST data and regex validation', function () {
            it('should return a successful promise', function () {
                return expect(verifier_1.default({
                    providerBaseUrl: providerBaseUrl,
                    pactUrls: [
                        path.resolve(__dirname, 'integration/me-they-post-regex-success.json'),
                    ],
                }).verify()).to.eventually.be.fulfilled;
            });
        });
        context('with monkeypatch file specified', function () {
            it('should return a successful promise', function () {
                return expect(verifier_1.default({
                    providerBaseUrl: providerBaseUrl,
                    pactUrls: [
                        path.resolve(__dirname, 'integration/me-they-success.json'),
                    ],
                    monkeypatch: monkeypatchFile,
                }).verify()).to.eventually.be.fulfilled;
            });
        });
    });
    context('when given a failing contract', function () {
        it('should return a rejected promise', function () {
            return expect(verifier_1.default({
                providerBaseUrl: providerBaseUrl,
                pactUrls: [path.resolve(__dirname, 'integration/me-they-fail.json')],
            }).verify()).to.eventually.be.rejected;
        });
    });
    context('when given multiple successful API calls in a contract', function () {
        it('should return a successful promise', function () {
            return expect(verifier_1.default({
                providerBaseUrl: providerBaseUrl,
                pactUrls: [path.resolve(__dirname, 'integration/me-they-multi.json')],
                providerStatesSetupUrl: providerStatesSetupUrl,
            }).verify()).to.eventually.be.fulfilled;
        });
    });
    context('when given multiple contracts', function () {
        context('from a local file', function () {
            it('should return a successful promise', function () {
                return expect(verifier_1.default({
                    providerBaseUrl: providerBaseUrl,
                    pactUrls: [
                        path.resolve(__dirname, 'integration/me-they-success.json'),
                        path.resolve(__dirname, 'integration/me-they-multi.json'),
                    ],
                    providerStatesSetupUrl: providerStatesSetupUrl,
                }).verify()).to.eventually.be.fulfilled;
            });
        });
        context('from a Pact Broker', function () {
            context('without authentication', function () {
                it('should return a successful promise', function () {
                    return expect(verifier_1.default({
                        providerBaseUrl: providerBaseUrl,
                        pactUrls: [
                            pactBrokerBaseUrl + "/noauth/pacts/provider/they/consumer/me/latest",
                            pactBrokerBaseUrl + "/noauth/pacts/provider/they/consumer/anotherclient/latest",
                        ],
                        providerStatesSetupUrl: providerStatesSetupUrl,
                    }).verify()).to.eventually.be.fulfilled;
                });
            });
            context('with authentication', function () {
                context('and a valid user/password', function () {
                    it('should return a successful promise', function () {
                        return expect(verifier_1.default({
                            providerBaseUrl: providerBaseUrl,
                            pactUrls: [
                                pactBrokerBaseUrl + "/pacts/provider/they/consumer/me/latest",
                                pactBrokerBaseUrl + "/pacts/provider/they/consumer/anotherclient/latest",
                            ],
                            providerStatesSetupUrl: providerStatesSetupUrl,
                            pactBrokerUsername: 'foo',
                            pactBrokerPassword: 'bar',
                        }).verify()).to.eventually.be.fulfilled;
                    });
                });
                context('and an invalid user/password', function () {
                    it('should return a rejected promise', function () {
                        return expect(verifier_1.default({
                            providerBaseUrl: providerBaseUrl,
                            pactUrls: [
                                pactBrokerBaseUrl + "/pacts/provider/they/consumer/me/latest",
                                pactBrokerBaseUrl + "/pacts/provider/they/consumer/anotherclient/latest",
                            ],
                            providerStatesSetupUrl: providerStatesSetupUrl,
                            pactBrokerUsername: 'foo',
                            pactBrokerPassword: 'baaoeur',
                        }).verify()).to.eventually.be.rejected;
                    });
                    it('should return the verifier error output in the returned promise', function () {
                        return expect(verifier_1.default({
                            providerBaseUrl: providerBaseUrl,
                            pactUrls: [
                                pactBrokerBaseUrl + "/pacts/provider/they/consumer/me/latest",
                                pactBrokerBaseUrl + "/pacts/provider/they/consumer/anotherclient/latest",
                            ],
                            providerStatesSetupUrl: providerStatesSetupUrl,
                            pactBrokerUsername: 'foo',
                            pactBrokerPassword: 'baaoeur',
                        }).verify()).to.eventually.be.rejected;
                    });
                });
            });
        });
    });
    context('when publishing verification results to a Pact Broker', function () {
        context('and there is a valid Pact file with spaces in the path', function () {
            it('should return a successful promise', function () {
                return expect(verifier_1.default({
                    providerBaseUrl: providerBaseUrl,
                    pactUrls: [
                        path.resolve(__dirname, 'integration/publish-verification-example weird path-success.json'),
                    ],
                    providerStatesSetupUrl: providerStatesSetupUrl,
                    publishVerificationResult: true,
                    providerVersion: '1.0.0',
                }).verify()).to.eventually.be.fulfilled;
            });
        });
        context('and there is a valid verification HAL link in the Pact file', function () {
            it('should return a successful promise', function () {
                return expect(verifier_1.default({
                    providerBaseUrl: providerBaseUrl,
                    pactUrls: [
                        path.resolve(__dirname, 'integration/publish-verification-example-success.json'),
                    ],
                    providerStatesSetupUrl: providerStatesSetupUrl,
                    publishVerificationResult: true,
                    providerVersion: '1.0.0',
                }).verify()).to.eventually.be.fulfilled;
            });
        });
        context('and there is an invalid verification HAL link in the Pact file', function () {
            it('should fail with an error', function () {
                return expect(verifier_1.default({
                    providerBaseUrl: providerBaseUrl,
                    pactUrls: [
                        path.resolve(__dirname, 'integration/publish-verification-example-fail.json'),
                    ],
                    providerStatesSetupUrl: providerStatesSetupUrl,
                    publishVerificationResult: true,
                    providerVersion: '1.0.0',
                }).verify()).to.eventually.be.fulfilled;
            });
        });
    });
});
//# sourceMappingURL=verifier.integration.spec.js.map