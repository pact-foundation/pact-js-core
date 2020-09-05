"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var fs = require("fs");
var message_1 = require("../src/message");
var path = require("path");
var logger_1 = require("../src/logger");
chai.use(chaiAsPromised);
var rimraf = require("rimraf");
var expect = chai.expect;
describe('Message Integration Spec', function () {
    var pactDir = process && process.mainModule
        ? path.dirname(process.mainModule.filename) + "/pacts"
        : '/tmp/pacts';
    var contractFile = pactDir + "/consumer-provider.json";
    var validJSON = "{ \"description\": \"a test mesage\", \"content\": { \"name\": \"Mary\" } }";
    context('when given a successful contract', function () {
        before(function () {
            try {
                if (fs.statSync(contractFile)) {
                    rimraf(pactDir, function () { return logger_1.default.debug('removed existing pacts'); });
                }
            }
            catch (e) { }
        });
        it('should return a successful promise', function (done) {
            var message = message_1.default({
                consumer: 'consumer',
                provider: 'provider',
                dir: "" + pactDir,
                content: validJSON,
            });
            var promise = message.createMessage();
            promise.then(function () {
                expect(fs.statSync(contractFile).isFile()).to.eql(true);
                done();
            });
        });
    });
});
//# sourceMappingURL=message.integration.spec.js.map