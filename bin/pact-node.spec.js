/* global describe:true, before:true, after:true, it:true, global:true, process:true */

var expect = require('chai').expect,
	cp = require('child_process'),
	pact = require('./../src/pact.js'),
	fs = require('fs'),
	path = require('path'),
	q = require('q'),
	http = require('request');
var isWindows = process.platform === 'win32';

describe("Pact CLI Spec", function () {
	var cliPath = path.resolve(__dirname, 'pact-node');
	var procs;

	function spawn(args) {
		args = args || { port: 1234, host: 'localhost'};
		var deferred = q.defer();
		var amount = 0;
		var opts = {
			cwd: __dirname,
			detached: !isWindows,
			windowsVerbatimArguments: isWindows
		};
		procs.push(cp.spawn(cliPath, args, opts));
		check();

		function check() {
			amount++;
			call(args).then(function () {
				if (amount >= 10) {
					deferred.reject(new Error("Pact stop failed; tried calling service 10 times with no result."));
				}
				setTimeout(check, 1000);
			}, deferred.resolve);
		}

		function call(options) {
			var deferred = q.defer();
			var config = {
				uri: (options.ssl ? 'https' : 'http') + '://' + options.host + ':' + options.port,
				method: 'GET',
				headers: {
					'X-Pact-Mock-Service': true,
					'Content-Type': 'application/json'
				}
			};
			if (options.ssl) {
				process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
				config.agentOptions = {};
				config.agentOptions.rejectUnauthorized = false;
				config.agentOptions.requestCert = false;
				config.agentOptions.agent = false;
			}
			http(config, function (error, response) {
				if (!error && response.statusCode == 200) {
					deferred.resolve();
				} else {
					deferred.reject();
				}
			});

			return deferred.promise;
		}

		return deferred.promise.timeout(10000, 'Process took too long');
	}

	beforeEach(function () {
		procs = [];
	});

	afterEach(function () {
		for (var i = 0, len = procs.length; i < len; i++) {
			if (isWindows) {
				cp.execSync('taskkill /f /t /pid ' + procs[i].pid);
			} else {
				process.kill(-procs[i].pid, 'SIGKILL');
			}
		}
	});

	describe("run pact-node command", function () {
		context("when no options are set", function () {
			it("should use defaults and start running", function (done) {
				//spawn();

			});
		});

		/*context("when user specifies valid options", function () {
		 var dirPath;
		 beforeEach(function (done) {
		 dirPath = path.resolve(__dirname, '../.tmp' + Math.floor(Math.random() * 1000));
		 fs.mkdir(dirPath, done);
		 });
		 afterEach(function (done) {
		 fs.rmdir(dirPath, done);
		 });

		 it("should return serverFactory using specified options", function () {
		 var options = {
		 port: 9500,
		 host: 'localhost',
		 dir: dirPath,
		 ssl: true,
		 cors: true,
		 log: 'log.txt',
		 spec: 1,
		 consumer: 'consumerName',
		 provider: 'providerName'
		 };

		 });
		 });

		 context("when user specifies invalid port", function () {
		 it("should return an error on negative port number", function () {

		 });

		 it("should return an error on non-integer", function () {
		 });

		 it("should return an error on non-number", function () {
		 });

		 it("should return an error on outside port range", function () {
		 });

		 });

		 context("when user specifies port that's currently in use", function () {
		 it("should return a port conflict error", function () {
		 });
		 });

		 context("when user specifies invalid host", function () {
		 it("should return an error on non-string", function () {
		 });

		 });

		 context("when user specifies invalid directory", function () {
		 it("should return an error on invalid path", function () {
		 });

		 });

		 context("when user specifies invalid ssl", function () {
		 it("should return an error on non-boolean", function () {
		 });

		 });

		 context("when user specifies invalid cors", function () {
		 it("should return an error on non-boolean", function () {
		 });

		 });

		 context("when user specifies invalid log", function () {
		 it("should return an error on invalid path", function () {
		 });

		 });

		 context("when user specifies invalid spec", function () {
		 it("should return an error on non-number", function () {
		 });

		 it("should return an error on negative number", function () {
		 });

		 it("should return an error on non-integer", function () {
		 });

		 });

		 context("when user specifies invalid consumer name", function () {
		 it("should return an error on non-string", function () {
		 });
		 });

		 context("when user specifies invalid provider name", function () {
		 it("should return an error on non-string", function () {
		 });
		 });*/
	});
});
