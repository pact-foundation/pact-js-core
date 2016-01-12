/* global describe:true, before:true, after:true, it:true, global:true, process:true */

var expect = require('chai').expect,
	cp = require('child_process'),
	pact = require('./../src/pact.js');

describe("Pact CLI Spec", function () {

	afterEach(function (done) {
		pact.removeAll().then(function () {
			done();
		});
	});

	describe("run pact-node command", function () {
		context("when no options are set", function () {
			it("should use defaults and start running", function () {
				//var proc = cp.spawn()
			});
		});

		context("when user specifies valid options", function () {
			var fs = require('fs'),
				path = require('path'),
				dirPath = path.resolve(__dirname, '../.tmp' + Math.floor(Math.random() * 1000));
			beforeEach(function (done) {
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
		});
	});
});
