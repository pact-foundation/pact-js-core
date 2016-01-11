/* global describe:true, before:true, after:true, it:true, global:true, process:true */

var serverFactory = require('./server.js'),
	expect = require('chai').expect;

describe("Server Spec", function () {
	var server;

	afterEach(function (done) {
		if(server) {
			server.delete().then(function(){
				done();
			});
		}
		else {
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
			// TODO: Fix SSL, some kind of horrible issues with Ruby 1.9.3 and SSL on the Pact Mock Service side
			it("should start correctly with ssl", function (done) {
				server = serverFactory( { ssl: true});
				server.start().then(function () {
					expect(server.ssl).to.equal(true);
					done();
				});
			});

			it("should start correctly with cors", function (done) {
				server = serverFactory( { cors: true});
				server.start().then(function () {
					expect(server.cors).to.equal(true);
					done();
				});
			});

			it("should start correctly with port", function (done) {
				server = serverFactory( { port: 9500});
				server.start().then(function () {
					expect(server.port).to.equal(9500);
					done();
				});
			});

			it("should start correctly with host", function (done) {
				server = serverFactory( { host: 'localhost'});
				server.start().then(function () {
					expect(server.host).to.equal('localhost');
					done();
				});
			});

			it("should start correctly with spec", function (done) {
				server = serverFactory( { spec: 1});
				server.start().then(function () {
					expect(server.spec).to.equal(1);
					done();
				});
			});

			var fs = require('fs'),
				path = require('path'),
				dirPath = path.resolve(__dirname, '../.tmp' + Math.floor(Math.random() * 1000));
			beforeEach(function (done) {
				fs.mkdir(dirPath, done);
			});
			afterEach(function (done) {
				fs.rmdir(dirPath, done);
			});
			it("should start correctly with dir", function (done) {
				server = serverFactory( { dir: dirPath});
				server.start().then(function () {
					expect(server.dir).to.equal(dirPath);
					done();
				});
			});

			it("should start correctly with log", function (done) {
				server = serverFactory( { log: 'log.txt'});
				server.start().then(function () {
					expect(server.log).to.equal('log.txt');
					done();
				});
			});

			it("should start correctly with consumer name", function (done) {
				server = serverFactory( { consumer: 'cName'});
				server.start().then(function () {
					expect(server.consumer).to.equal('cName');
					done();
				});
			});

			it("should start correctly with provider name", function (done) {
				server = serverFactory( { provider: 'pName'});
				server.start().then(function () {
					expect(server.provider).to.equal('pName');
					done();
				});
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
		});
	});

});
