"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("underscore");
var q = require("q");
var server_1 = require("./server");
var verifier_1 = require("./verifier");
var publisher_1 = require("./publisher");
var logger_1 = require("./logger");
var Pact = (function () {
    function Pact() {
        var _this = this;
        this.__servers = [];
        process.once("exit", function () { return _this.removeAllServers(); });
        process.once("SIGINT", process.exit);
    }
    Pact.prototype.logLevel = function (level) {
        return level ? logger_1.default.level(level) : logger_1.default.logLevelName;
    };
    Pact.prototype.createServer = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        if (options && options.port && _.some(this.__servers, function (s) { return s.options.port === options.port; })) {
            var msg = "Port '" + options.port + "' is already in use by another process.";
            logger_1.default.error(msg);
            throw new Error(msg);
        }
        var server = server_1.default(options);
        this.__servers.push(server);
        logger_1.default.info("Creating Pact Server with options: \n" + this.__stringifyOptions(server.options));
        server.once("delete", function (s) {
            logger_1.default.info("Deleting Pact Server with options: \n" + _this.__stringifyOptions(s.options));
            _this.__servers = _.without(_this.__servers, s);
        });
        return server;
    };
    Pact.prototype.listServers = function () {
        return this.__servers;
    };
    Pact.prototype.removeAllServers = function () {
        logger_1.default.info("Removing all Pact servers.");
        return q.all(_.map(this.__servers, function (server) { return server.delete(); }));
    };
    Pact.prototype.verifyPacts = function (options) {
        logger_1.default.info("Verifying Pacts.");
        return verifier_1.default(options).verify();
    };
    Pact.prototype.publishPacts = function (options) {
        logger_1.default.info("Publishing Pacts to Broker");
        return publisher_1.default(options).publish();
    };
    Pact.prototype.__stringifyOptions = function (obj) {
        return _.chain(obj)
            .pairs()
            .map(function (v) { return v.join(" = "); })
            .value()
            .join(",\n");
    };
    return Pact;
}());
exports.Pact = Pact;
exports.default = new Pact();
//# sourceMappingURL=pact.js.map