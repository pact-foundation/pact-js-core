"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var checkTypes = require("check-types");
var _ = require("underscore");
var path = require("path");
var fs = require("fs");
var cp = require("child_process");
var q = require("q");
var unixify = require("unixify");
var url = require("url");
var verifierPath = require("@pact-foundation/pact-provider-verifier");
var broker_1 = require("./broker");
var logger_1 = require("./logger");
var pact_util_1 = require("./pact-util");
var isWindows = process.platform === "win32";
var Verifier = (function () {
    function Verifier(options) {
        this.__options = options;
    }
    Verifier.create = function (options) {
        if (options === void 0) { options = { providerBaseUrl: "" }; }
        options.pactBrokerUrl = options.pactBrokerUrl || "";
        options.tags = options.tags || [];
        options.provider = options.provider || "";
        options.pactUrls = options.pactUrls || [];
        options.providerStatesUrl = options.providerStatesUrl || "";
        options.providerStatesSetupUrl = options.providerStatesSetupUrl || "";
        options.timeout = options.timeout || 30000;
        options.pactUrls = _.chain(options.pactUrls)
            .map(function (uri) {
            if (!/https?:/.test(url.parse(uri).protocol)) {
                try {
                    fs.statSync(path.normalize(uri)).isFile();
                    return unixify(uri);
                }
                catch (e) {
                    throw new Error("Pact file: " + uri + " doesn\"t exist");
                }
            }
            return uri;
        })
            .compact()
            .value();
        checkTypes.assert.nonEmptyString(options.providerBaseUrl, "Must provide the --provider-base-url argument");
        if (checkTypes.emptyArray(options.pactUrls) && !options.pactBrokerUrl) {
            throw new Error("Must provide the --pact-urls argument if no --broker-url provided");
        }
        if ((!options.pactBrokerUrl || !options.provider) && checkTypes.emptyArray(options.pactUrls)) {
            throw new Error("Must provide both --provider and --broker-url or if --pact-urls not provided.");
        }
        if (options.providerStatesSetupUrl) {
            checkTypes.assert.string(options.providerStatesSetupUrl);
        }
        if (options.providerStatesUrl) {
            logger_1.default.warn("--provider-states-url is deprecated and no longer required.");
            checkTypes.assert.string(options.providerStatesUrl);
        }
        if (options.pactBrokerUsername) {
            checkTypes.assert.string(options.pactBrokerUsername);
        }
        if (options.pactBrokerPassword) {
            checkTypes.assert.string(options.pactBrokerPassword);
        }
        if (options.pactUrls) {
            checkTypes.assert.array.of.string(options.pactUrls);
        }
        if (options.tags) {
            checkTypes.assert.array.of.string(options.tags);
        }
        if (options.providerBaseUrl) {
            checkTypes.assert.string(options.providerBaseUrl);
        }
        if (options.publishVerificationResult) {
            checkTypes.assert.boolean(options.publishVerificationResult);
        }
        if (options.publishVerificationResult && !options.providerVersion) {
            throw new Error("Must provide both or none of --publish-verification-results and --provider-app-version.");
        }
        if (options.providerVersion) {
            checkTypes.assert.string(options.providerVersion);
        }
        checkTypes.assert.positive(options.timeout);
        return new Verifier(options);
    };
    Verifier.prototype.verify = function () {
        var _this = this;
        logger_1.default.info("Verifier verify()");
        var retrievePactsPromise;
        if (this.__options.pactUrls.length > 0) {
            retrievePactsPromise = q(this.__options.pactUrls);
        }
        else {
            retrievePactsPromise = new broker_1.default({
                brokerUrl: this.__options.pactBrokerUrl,
                provider: this.__options.provider,
                username: this.__options.pactBrokerUsername,
                password: this.__options.pactBrokerPassword,
                tags: this.__options.tags
            }).findConsumers();
        }
        return retrievePactsPromise.then(function (data) {
            _this.__options.pactUrls = data;
            var deferred = q.defer();
            var output = "";
            function outputHandler(log) {
                logger_1.default.info(log);
                output += log;
            }
            var envVars = JSON.parse(JSON.stringify(process.env));
            delete envVars["RUBYGEMS_GEMDEPS"];
            var file;
            var opts = {
                cwd: verifierPath.cwd,
                detached: !isWindows,
                env: envVars
            };
            var args = pact_util_1.default.createArguments(_this.__options, {
                "providerBaseUrl": "--provider-base-url",
                "pactUrls": "--pact-urls",
                "providerStatesUrl": "--provider-states-url",
                "providerStatesSetupUrl": "--provider-states-setup-url",
                "pactBrokerUsername": "--broker-username",
                "pactBrokerPassword": "--broker-password",
                "publishVerificationResult": "--publish-verification-results",
                "providerVersion": "--provider-app-version"
            });
            var cmd = [verifierPath.file].concat(args).join(" ");
            if (isWindows) {
                file = "cmd.exe";
                args = ["/s", "/c", cmd];
                opts.windowsVerbatimArguments = true;
            }
            else {
                cmd = "./" + cmd;
                file = "/bin/sh";
                args = ["-c", cmd];
            }
            _this.__instance = cp.spawn(file, args, opts);
            _this.__instance.stdout.setEncoding("utf8");
            _this.__instance.stdout.on("data", outputHandler);
            _this.__instance.stderr.setEncoding("utf8");
            _this.__instance.stderr.on("data", outputHandler);
            _this.__instance.on("error", logger_1.default.error.bind(logger_1.default));
            _this.__instance.once("close", function (code) { return code === 0 ? deferred.resolve(output) : deferred.reject(new Error(output)); });
            logger_1.default.info("Created Pact Verifier process with PID: " + _this.__instance.pid);
            return deferred.promise.timeout(_this.__options.timeout, "Timeout waiting for verification process to complete (PID: " + _this.__instance.pid + ")")
                .tap(function () { return logger_1.default.info("Pact Verification succeeded."); });
        });
    };
    return Verifier;
}());
exports.Verifier = Verifier;
exports.default = Verifier.create;
//# sourceMappingURL=verifier.js.map