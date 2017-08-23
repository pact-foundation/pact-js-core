"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var checkTypes = require("check-types");
var _ = require("underscore");
var path = require("path");
var fs = require("fs");
var q = require("q");
var request = require("request");
var urlJoin = require("url-join");
var logger_1 = require("./logger");
var http = q.denodeify(request);
var Publisher = (function () {
    function Publisher(options) {
        if (options === void 0) { options = {}; }
        this.__options = options;
    }
    Publisher.create = function (options) {
        options = options || {};
        options.pactBroker = options.pactBroker || "";
        options.pactUrls = options.pactUrls || [];
        options.tags = options.tags || [];
        if (options.pactUrls) {
            checkTypes.assert.array.of.string(options.pactUrls);
        }
        var url = require("url");
        _.each(options.pactUrls, function (uri) {
            var proto = url.parse(uri).protocol;
            if (proto === "file://" || proto === null) {
                try {
                    fs.statSync(path.normalize(uri));
                }
                catch (e) {
                    throw new Error("Pact contract or directory: '" + uri + "' doesn't exist");
                }
            }
        });
        checkTypes.assert.nonEmptyString(options.pactBroker, "Must provide the pactBroker argument");
        checkTypes.assert.nonEmptyString(options.consumerVersion, "Must provide the consumerVersion argument");
        checkTypes.assert.not.emptyArray(options.pactUrls, "Must provide the pactUrls argument");
        if (options.pactBrokerUsername) {
            checkTypes.assert.string(options.pactBrokerUsername);
        }
        if (options.pactBrokerPassword) {
            checkTypes.assert.string(options.pactBrokerPassword);
        }
        if ((options.pactBrokerUsername && !options.pactBrokerPassword) || (options.pactBrokerPassword && !options.pactBrokerUsername)) {
            throw new Error("Must provide both or none of --provider-states-url and --provider-states-setup-url.");
        }
        if (options.pactBroker) {
            checkTypes.assert.string(options.pactBroker);
        }
        return new Publisher(options);
    };
    Publisher.prototype.publish = function () {
        var _this = this;
        logger_1.default.info("Publishing pacts to broker at: " + this.__options.pactBroker);
        return q(_.chain(this.__options.pactUrls)
            .map(function (uri) {
            var localFileOrDir = path.normalize(uri);
            if (!(/^http/.test(uri)) && fs.statSync(localFileOrDir) && fs.statSync(localFileOrDir).isDirectory()) {
                uri = localFileOrDir;
                return _.map(fs.readdirSync(uri, ""), function (file) {
                    if (/\.json$/.test(file)) {
                        return path.join(uri, file);
                    }
                });
            }
            else {
                return uri;
            }
        })
            .flatten(true)
            .compact()
            .value())
            .then(function (uris) { return q.allSettled(_.map(uris, function (uri) { return _this.__getPactFile(_this.__options, uri); }))
            .then(function (data) {
            var rejects = [];
            data = _.map(data, function (result) {
                if (result.state === "fulfilled") {
                    return result.value;
                }
                rejects.push(result.reason);
            });
            return rejects.length ? q.reject(new Error("Could not retrieve all Pact contracts:\n  - " + rejects.join("\n  - "))) : data;
        }); })
            .tap(function (files) { return q.allSettled(_.map(files, function (data) {
            return _this.__callPact(_this.__options, {
                uri: _this.__constructPutUrl(_this.__options, data),
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                json: true,
                body: data
            });
        }))
            .then(function (results) {
            var rejects = _.where(results, { state: "rejected" });
            if (rejects.length) {
                return q.reject(new Error("Could not publish pacts to broker at '" + _this.__options.pactBroker + "':\n  - " + rejects.join("\n  - ")));
            }
        }); })
            .tap(function (files) {
            if (!_this.__options.tags || !_this.__options.tags.length) {
                return;
            }
            return q.allSettled(_.chain(files)
                .map(function (data) {
                return _.map(_this.__options.tags, function (tag) {
                    return _this.__callPact(_this.__options, {
                        uri: _this.__constructTagUrl(_this.__options, tag, data),
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }).fail(function (err) { return q.reject("Error with tag '" + tag + "' : " + err); });
                });
            })
                .flatten(true)
                .value()).then(function (results) {
                var rejects = _.where(results, { state: "rejected" });
                if (rejects.length) {
                    return q.reject(new Error("Could not tag Pact contract:\n  - " + rejects.join("\n  - ")));
                }
            });
        })
            .catch(function (err) {
            logger_1.default.error(err);
            return q.reject(err);
        });
    };
    Publisher.prototype.__callPact = function (options, config) {
        config = _.extend({
            uri: options.pactBroker ? options.pactBroker : "http://localhost",
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        }, config);
        if (options.pactBrokerUsername && options.pactBrokerPassword) {
            config.auth = {
                user: options.pactBrokerUsername,
                pass: options.pactBrokerPassword
            };
        }
        return http(config)
            .then(function (data) { return data[0]; })
            .then(function (response) {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                return q.reject("Failed http call to pact broker.\n\t\t\t\t\tURI: " + config.uri + "\n\t\t\t\t\tCode: " + response.statusCode + "\n\t\t\t\t\tBody: " + response.body);
            }
            return response.body;
        });
    };
    Publisher.prototype.__getPactFile = function (options, uri) {
        if (/\.json$/.test(uri)) {
            try {
                return q(require(uri));
            }
            catch (err) {
                return q.reject("Invalid Pact contract '" + uri + ":\n" + err);
            }
        }
        else {
            return this.__callPact(options, {
                uri: uri,
                json: true
            }).fail(function (err) { return q.reject("Failed to get Pact contract from broker:\n" + err); });
        }
    };
    Publisher.prototype.__constructPutUrl = function (options, data) {
        if (!_.has(options, "pactBroker")) {
            throw new Error("Cannot construct Pact publish URL: 'pactBroker' not specified");
        }
        if (!_.has(options, "consumerVersion")) {
            throw new Error("Cannot construct Pact publish URL: 'consumerVersion' not specified");
        }
        if (!_.isObject(options)
            || !_.has(data, "consumer")
            || !_.has(data, "provider")
            || !_.has(data.consumer, "name")
            || !_.has(data.provider, "name")) {
            throw new Error("Invalid Pact contract given. Unable to parse consumer and provider name");
        }
        return urlJoin(options.pactBroker, "pacts/provider", data.provider.name, "consumer", data.consumer.name, "version", options.consumerVersion);
    };
    Publisher.prototype.__constructTagUrl = function (options, tag, data) {
        if (!_.has(options, "pactBroker")) {
            throw new Error("Cannot construct Pact Tag URL: 'pactBroker' not specified");
        }
        if (!_.has(options, "consumerVersion")) {
            throw new Error("Cannot construct Pact Tag URL: 'consumerVersion' not specified");
        }
        if (!_.isObject(options)
            || !_.has(data, "consumer")
            || !_.has(data.consumer, "name")) {
            throw new Error("Invalid Pact contract given. Unable to parse consumer name");
        }
        return urlJoin(options.pactBroker, "pacticipants", data.consumer.name, "versions", options.consumerVersion, "tags", tag);
    };
    return Publisher;
}());
exports.Publisher = Publisher;
exports.default = Publisher.create;
//# sourceMappingURL=publisher.js.map