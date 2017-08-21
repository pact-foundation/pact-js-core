"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var checkTypes = require("check-types");
var _ = require("underscore");
var path = require("path");
var fs = require("fs");
var cp = require("child_process");
var events = require("events");
var http = require("request");
var q = require("q");
var pactPath = require("@pact-foundation/pact-mock-service");
var mkdirp = require("mkdirp");
var logger_1 = require("./logger");
var pact_util_1 = require("./pact-util");
var isWindows = process.platform === "win32";
var CHECKTIME = 500;
var RETRY_AMOUNT = 60;
var PROCESS_TIMEOUT = 30000;
var Server = (function (_super) {
    __extends(Server, _super);
    function Server(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.__running = false;
        return _this;
    }
    Object.defineProperty(Server, "Events", {
        get: function () {
            return {
                START_EVENT: "start",
                STOP_EVENT: "stop",
                DELETE_EVENT: "delete"
            };
        },
        enumerable: true,
        configurable: true
    });
    Server.create = function (options) {
        if (options === void 0) { options = {}; }
        options.ssl = options.ssl || false;
        options.cors = options.cors || false;
        options.dir = options.dir ? path.resolve(options.dir) : process.cwd();
        options.host = options.host || "localhost";
        if (options.port) {
            checkTypes.assert.number(options.port);
            checkTypes.assert.integer(options.port);
            checkTypes.assert.positive(options.port);
            checkTypes.assert.inRange(options.port, 0, 65535);
            if (checkTypes.not.inRange(options.port, 1024, 49151)) {
                logger_1.default.warn("Like a Boss, you used a port outside of the recommended range (1024 to 49151); I too like to live dangerously.");
            }
        }
        checkTypes.assert.boolean(options.ssl);
        if ((options.sslcert && !options.sslkey) || (!options.sslcert && options.sslkey)) {
            throw new Error("Custom ssl certificate and key must be specified together.");
        }
        if (options.sslcert) {
            try {
                fs.statSync(path.normalize(options.sslcert)).isFile();
            }
            catch (e) {
                throw new Error("Custom ssl certificate not found at path: " + options.sslcert);
            }
        }
        if (options.sslkey) {
            try {
                fs.statSync(path.normalize(options.sslkey)).isFile();
            }
            catch (e) {
                throw new Error("Custom ssl key not found at path: " + options.sslkey);
            }
        }
        if (options.sslcert && options.sslkey) {
            options.ssl = true;
        }
        checkTypes.assert.boolean(options.cors);
        if (options.spec) {
            checkTypes.assert.number(options.spec);
            checkTypes.assert.integer(options.spec);
            checkTypes.assert.positive(options.spec);
        }
        if (options.dir) {
            try {
                fs.statSync(path.normalize(options.dir)).isDirectory();
            }
            catch (e) {
                mkdirp.sync(path.normalize(options.dir));
            }
        }
        if (options.log) {
            var fileObj = path.parse(path.normalize(options.log));
            try {
                fs.statSync(fileObj.dir).isDirectory();
            }
            catch (e) {
                mkdirp.sync(fileObj.dir);
            }
        }
        if (options.host) {
            checkTypes.assert.string(options.host);
        }
        if (options.consumer) {
            checkTypes.assert.string(options.consumer);
        }
        if (options.provider) {
            checkTypes.assert.string(options.provider);
        }
        return new Server(options);
    };
    Server.prototype.start = function () {
        var _this = this;
        if (this.__instance && this.__instance.connected) {
            logger_1.default.warn("You already have a process running with PID: " + this.__instance.pid);
            return;
        }
        var envVars = JSON.parse(JSON.stringify(process.env));
        delete envVars["RUBYGEMS_GEMDEPS"];
        var file;
        var opts = {
            cwd: pactPath.cwd,
            detached: !isWindows,
            env: envVars
        };
        var args = pact_util_1.default.createArguments(this.options, {
            "port": "--port",
            "host": "--host",
            "log": "--log",
            "ssl": "--ssl",
            "sslcert": "--sslcert",
            "sslkey": "--sslkey",
            "cors": "--cors",
            "dir": "--pact_dir",
            "spec": "--pact_specification_version",
            "consumer": "--consumer",
            "provider": "--provider"
        });
        var cmd = [pactPath.file].concat(args).join(" ");
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
        logger_1.default.debug("Starting binary with '" + _.flatten([file, args, JSON.stringify(opts)]) + "'");
        this.__instance = cp.spawn(file, args, opts);
        this.__instance.stdout.setEncoding("utf8");
        this.__instance.stdout.on("data", logger_1.default.debug.bind(logger_1.default));
        this.__instance.stderr.setEncoding("utf8");
        this.__instance.stderr.on("data", logger_1.default.debug.bind(logger_1.default));
        this.__instance.on("error", logger_1.default.error.bind(logger_1.default));
        function catchPort(data) {
            var match = data.match(/port=([0-9]+)/);
            if (match && match[1]) {
                this.options.port = parseInt(match[1], 10);
                this.__instance.stdout.removeListener("data", catchPort.bind(this));
                this.__instance.stderr.removeListener("data", catchPort.bind(this));
            }
        }
        if (!this.options.port) {
            this.__instance.stdout.on("data", catchPort.bind(this));
            this.__instance.stderr.on("data", catchPort.bind(this));
        }
        logger_1.default.info("Creating Pact with PID: " + this.__instance.pid);
        this.__instance.once("close", function (code) {
            if (code !== 0) {
                logger_1.default.warn("Pact exited with code " + code + ".");
            }
            return _this.stop();
        });
        return this.__waitForServerUp(this.options)
            .timeout(PROCESS_TIMEOUT, "Couldn't start Pact with PID: " + this.__instance.pid)
            .tap(function () {
            _this.__running = true;
            _this.emit(Server.Events.START_EVENT, _this);
        });
    };
    Server.prototype.stop = function () {
        var _this = this;
        var pid = -1;
        if (this.__instance) {
            pid = this.__instance.pid;
            logger_1.default.info("Removing Pact with PID: " + pid);
            this.__instance.removeAllListeners();
            if (isWindows) {
                cp.execSync("taskkill /f /t /pid " + pid);
            }
            else {
                process.kill(-pid, "SIGINT");
            }
            this.__instance = undefined;
        }
        return this.__waitForServerDown(this.options)
            .timeout(PROCESS_TIMEOUT, "Couldn't stop Pact with PID '" + pid + "'")
            .tap(function () {
            _this.__running = false;
            _this.emit(Server.Events.STOP_EVENT, _this);
        });
    };
    Server.prototype.delete = function () {
        var _this = this;
        return this.stop().tap(function () { return _this.emit(Server.Events.DELETE_EVENT, _this); });
    };
    Server.prototype.__waitForServerUp = function (options) {
        var amount = 0;
        var deferred = q.defer();
        function retry() {
            if (amount >= RETRY_AMOUNT) {
                deferred.reject(new Error("Pact startup failed; tried calling service 10 times with no result."));
            }
            setTimeout(check.bind(this), CHECKTIME);
        }
        function check() {
            amount++;
            if (options.port) {
                this.__call(options).then(function () {
                    deferred.resolve();
                }, retry);
            }
            else {
                retry();
            }
        }
        check();
        return deferred.promise;
    };
    Server.prototype.__waitForServerDown = function (options) {
        var amount = 0;
        var deferred = q.defer();
        function check() {
            amount++;
            if (options.port) {
                this.__call(options).then(function () {
                    if (amount >= RETRY_AMOUNT) {
                        deferred.reject(new Error("Pact stop failed; tried calling service 10 times with no result."));
                        return;
                    }
                    setTimeout(check, CHECKTIME);
                }, function () { return deferred.resolve(); });
            }
            else {
                deferred.resolve();
            }
        }
        check();
        return deferred.promise;
    };
    Server.prototype.__call = function (options) {
        var deferred = q.defer();
        var config = {
            uri: "http" + (options.ssl ? "s" : "") + "://" + options.host + ":" + options.port,
            method: "GET",
            headers: {
                "X-Pact-Mock-Service": true,
                "Content-Type": "application/json"
            }
        };
        if (options.ssl) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            config.agentOptions = {};
            config.agentOptions.rejectUnauthorized = false;
            config.agentOptions.requestCert = false;
            config.agentOptions.agent = false;
        }
        http(config, function (err, res) { return (!err && res.statusCode === 200) ? deferred.resolve() : deferred.reject("returned HTTP status '" + res.statusCode + "'"); });
        return deferred.promise;
    };
    return Server;
}(events.EventEmitter));
exports.Server = Server;
exports.default = Server.create;
//# sourceMappingURL=server.js.map