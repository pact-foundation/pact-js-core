/* global describe:true, before:true, after:true, it:true, global:true, process:true */

var serverFactory = require('./server.js'),
	expect = require('chai').expect,
	fs = require('fs'),
	path = require('path');

describe("Server Spec", function () {
	var server;

	afterEach(function (done) {
		if (server) {
			server.delete().then(function () {
				done();
			});
		} else {
			done();
		}
	});

	describe("Start server", function () {
		context("when no options are set", function () {
			it("should start correctly with defaults", function (done) {
				server = serverFactory();
				server.start().then(function () {
					done();
				});
			});
		});

		context("when valid options are set", function () {

			var dirPath = path.resolve(__dirname, '../.tmp' + Math.floor(Math.random() * 1000));

			beforeEach(function (done) {
				fs.mkdir(dirPath, done);
			});

			afterEach(function (done) {
				fs.rmdir(dirPath, done);
			});

			it("should start correctly with ssl", function (done) {
				server = serverFactory({ssl: true});
				server.start().then(function () {
					expect(server.options.ssl).to.equal(true);
					done();
				});
			});

			it("should start correctly with cors", function (done) {
				server = serverFactory({cors: true});
				server.start().then(function () {
					expect(server.options.cors).to.equal(true);
					done();
				});
			});

			it("should start correctly with port", function (done) {
				server = serverFactory({port: 9500});
				server.start().then(function () {
					expect(server.options.port).to.equal(9500);
					done();
				});
			});

			it("should start correctly with host", function (done) {
				server = serverFactory({host: 'localhost'});
				server.start().then(function () {
					expect(server.options.host).to.equal('localhost');
					done();
				});
			});

			it("should start correctly with spec version 1", function (done) {
				server = serverFactory({spec: 1});
				server.start().then(function () {
					expect(server.options.spec).to.equal(1);
					done();
				});
			});

			it("should start correctly with spec version 2", function (done) {
				server = serverFactory({spec: 2});
				server.start().then(function () {
					expect(server.options.spec).to.equal(2);
					done();
				});
			});

			it("should start correctly with dir", function (done) {
				server = serverFactory({dir: dirPath});
				server.start().then(function () {
					expect(server.options.dir).to.equal(dirPath);
					done();
				});
			});

			it("should start correctly with log", function (done) {
				server = serverFactory({log: 'log.txt'});
				server.start().then(function () {
					expect(server.options.log).to.equal('log.txt');
					done();
				});
			});

			it("should start correctly with consumer name", function (done) {
				server = serverFactory({consumer: 'cName'});
				server.start().then(function () {
					expect(server.options.consumer).to.equal('cName');
					done();
				});
			});

			it("should start correctly with provider name", function (done) {
				server = serverFactory({provider: 'pName'});
				server.start().then(function () {
					expect(server.options.provider).to.equal('pName');
					done();
				});
			});
		});

		it("should dispatch event when starting", function (done) {
			server = serverFactory();
			server.once('start', function () {
				done();
			});
			server.start();
		});

		it("should change running state to true", function (done) {
			server = serverFactory();
			server.start().then(function () {
				expect(server.$running).to.be.true;
				done();
			});
		});
	});

	describe("Stop server", function () {
		context("when already started", function () {
			it("should stop running", function (done) {
				server = serverFactory();
				server.start().then(function () {
					return server.stop();
				}).then(function () {
					done();
				});
			});

			it("should dispatch event when stopping", function (done) {
				server = serverFactory();
				server.once('stop', function () {
					done();
				});
				server.start().then(function () {
					server.stop();
				});
			});

			it("should change running state to false", function (done) {
				server = serverFactory();
				server.start().then(function () {
					return server.stop();
				}).then(function () {
					expect(server.$running).to.be.false;
					done();
				});
			});
		});
	});

	describe("Delete server", function () {
		context("when already running", function () {
			it("should stop & delete server", function (done) {
				server = serverFactory();
				server.start().then(function () {
					return server.delete();
				}).then(function () {
					done();
				});
			});

			it("should dispatch event when deleting", function (done) {
				server = serverFactory();
				server.once('delete', function () {
					done();
				});
				server.start().then(function () {
					server.delete();
				});
			});

			it("should change running state to false", function (done) {
				server = serverFactory();
				server.start().then(function () {
					return server.delete();
				}).then(function () {
					expect(server.$running).to.be.false;
					done();
				});
			});
		});
	});

});
