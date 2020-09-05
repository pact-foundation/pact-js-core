"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var chai = require("chai");
var logger_1 = require("../src/logger");
var chaiAsPromised = require("chai-as-promised");
var publisher_1 = require("../src/publisher");
var broker_mock_1 = require("./integration/broker-mock");
var expect = chai.expect;
chai.use(chaiAsPromised);
describe('Publish Spec', function () {
    var server;
    var PORT = Math.floor(Math.random() * 999) + 9000;
    var pactBrokerBaseUrl = "http://localhost:" + PORT;
    var authenticatedPactBrokerBaseUrl = pactBrokerBaseUrl + "/auth";
    before(function () {
        return broker_mock_1.default(PORT).then(function (s) {
            logger_1.default.debug("Pact Broker Mock listening on port: " + PORT);
            server = s;
        });
    });
    after(function () { return server.close(); });
    context('when publishing a to a broker', function () {
        context('without authentication', function () {
            context('and the Pact contract is valid', function () {
                it('should successfully publish all Pacts', function () {
                    var publisher = publisher_1.default({
                        pactBroker: pactBrokerBaseUrl,
                        pactFilesOrDirs: [
                            path.resolve(__dirname, 'integration/publish/publish-success.json'),
                        ],
                        consumerVersion: '1.0.0',
                    });
                    expect(publisher).to.be.a('object');
                    expect(publisher).to.respondTo('publish');
                    return expect(publisher.publish()).to.eventually.be.fulfilled;
                });
                it('should successfully tag all Pacts with `test` and `latest`', function () {
                    var publisher = publisher_1.default({
                        pactBroker: pactBrokerBaseUrl,
                        pactFilesOrDirs: [
                            path.resolve(__dirname, 'integration/publish/publish-success.json'),
                        ],
                        consumerVersion: '1.0.0',
                        tags: ['test', 'latest'],
                    });
                    expect(publisher).to.be.a('object');
                    expect(publisher).to.respondTo('publish');
                    return expect(publisher.publish()).to.eventually.be.fulfilled;
                });
            });
            context('and the Pact contract is invalid', function () {
                it('should report an unsuccessful push', function () {
                    var publisher = publisher_1.default({
                        pactBroker: pactBrokerBaseUrl,
                        pactFilesOrDirs: [
                            path.resolve(__dirname, 'integration/publish/publish-fail.json'),
                        ],
                        consumerVersion: '1.0.0',
                    });
                    expect(publisher).to.be.a('object');
                    expect(publisher).to.respondTo('publish');
                    return expect(publisher.publish()).to.eventually.be.rejected;
                });
            });
        });
        context('with authentication', function () {
            context('and valid credentials', function () {
                it('should return a sucessful promise', function () {
                    var publisher = publisher_1.default({
                        pactBroker: authenticatedPactBrokerBaseUrl,
                        pactFilesOrDirs: [
                            path.resolve(__dirname, 'integration/publish/publish-success.json'),
                        ],
                        consumerVersion: '1.0.0',
                        pactBrokerUsername: 'foo',
                        pactBrokerPassword: 'bar',
                    });
                    expect(publisher).to.be.a('object');
                    expect(publisher).to.respondTo('publish');
                    return expect(publisher.publish()).to.eventually.be.fulfilled;
                });
            });
            context('and invalid credentials', function () {
                it('should return a rejected promise', function () {
                    var publisher = publisher_1.default({
                        pactBroker: authenticatedPactBrokerBaseUrl,
                        pactFilesOrDirs: [
                            path.resolve(__dirname, 'integration/publish/publish-success.json'),
                        ],
                        consumerVersion: '1.0.0',
                        pactBrokerUsername: 'not',
                        pactBrokerPassword: 'right',
                    });
                    expect(publisher).to.be.a('object');
                    expect(publisher).to.respondTo('publish');
                    return expect(publisher.publish()).to.eventually.be.rejected;
                });
            });
        });
    });
    context('when publishing a directory of Pacts to a Broker', function () {
        context('and the directory contains only valid Pact contracts', function () {
            it('should asynchronously send all Pacts to the Broker', function () {
                var publisher = publisher_1.default({
                    pactBroker: pactBrokerBaseUrl,
                    pactFilesOrDirs: [
                        path.resolve(__dirname, 'integration/publish/pactDirTests'),
                    ],
                    consumerVersion: '1.0.0',
                });
                expect(publisher).to.be.a('object');
                expect(publisher).to.respondTo('publish');
                return expect(publisher.publish()).to.eventually.be.fulfilled;
            });
            it('should successfully tag all Pacts sent with `test` and `latest`', function () {
                var publisher = publisher_1.default({
                    pactBroker: pactBrokerBaseUrl,
                    pactFilesOrDirs: [
                        path.resolve(__dirname, 'integration/publish/pactDirTests'),
                    ],
                    consumerVersion: '1.0.0',
                    tags: ['test', 'latest'],
                });
                expect(publisher).to.be.a('object');
                expect(publisher).to.respondTo('publish');
                return expect(publisher.publish()).to.eventually.be.fulfilled;
            });
        });
        context('and the directory contains Pact and non-Pact contracts', function () {
            it('should asynchronously send only the Pact contracts to the broker', function () {
                var publisher = publisher_1.default({
                    pactBroker: pactBrokerBaseUrl,
                    pactFilesOrDirs: [
                        path.resolve(__dirname, 'integration/publish/pactDirTestsWithOtherStuff'),
                    ],
                    consumerVersion: '1.0.0',
                });
                expect(publisher).to.be.a('object');
                expect(publisher).to.respondTo('publish');
                return expect(publisher.publish()).to.eventually.be.fulfilled;
            });
        });
    });
});
//# sourceMappingURL=publisher.integration.spec.js.map