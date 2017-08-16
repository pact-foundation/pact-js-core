var rewire = require("rewire"),
	serverFactory = rewire('./server'),
	logger = require('./logger'),
	expect = require('chai').expect,
	fs = require('fs'),
	path = require('path'),
	q = require('q'),
	_ = require('underscore');

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

		context("when invalid options are set", function () {
			it("should fail if custom ssl certs do not exist", function () {
				expect(function () { serverFactory({ssl: true, sslcert: 'does/not/exist', sslkey: path.resolve(__dirname, '../test/ssl/server.key')})}).to.throw(Error);
			});

			it("should fail if custom ssl keys do not exist", function () {
				expect(function () { serverFactory({ssl: true, sslcert: path.resolve(__dirname, '../test/ssl/server.crt'), sslkey: 'does/not/exist'})}).to.throw(Error);
			});

			it("should fail if custom ssl cert is set, but ssl key isn't", function () {
				expect(function () { serverFactory({ssl: true, sslcert: path.resolve(__dirname, '../test/ssl/server.crt')})}).to.throw(Error);
			});

			it("should fail if custom ssl key is set, but ssl cert isn't", function () {
				expect(function () { serverFactory({ssl: true,  sslkey: path.resolve(__dirname, '../test/ssl/server.key')})}).to.throw(Error);
			});
		});

		context("when valid options are set", function () {

			var dirPath;

			beforeEach(function () {
				dirPath = path.resolve(__dirname, '../.tmp/' + Math.floor(Math.random() * 1000));
			});

			afterEach(function (done) {
				try {
					if (fs.statSync(dirPath).isDirectory()) {
						fs.rmdirSync(dirPath);
					}
				} catch (e) {
				}
				done();
			});

			it("should start correctly when instance is delayed", function (done) {
				server = serverFactory();
				var waitForServerUp = serverFactory.__get__('waitForServerUp');

				q.allSettled([
					waitForServerUp(server._options),
					q.delay(5000).then(function () {
						server.start()
					})
				]).then(function (results) {
					expect(_.reduce(results, function (m, r) {
						return m && r.state === 'fulfilled'
					})).to.be.true;
					done();
				});
			});

			it("should start correctly with ssl", function (done) {
				server = serverFactory({ssl: true});
				server.start().then(function () {
					expect(server._options.ssl).to.equal(true);
					done();
				});
			});

			it("should start correctly with custom ssl cert/key", function (done) {
				server = serverFactory({ssl: true, sslcert: path.resolve(__dirname, '../test/ssl/server.crt'), sslkey: path.resolve(__dirname, '../test/ssl/server.key')});
				server.start().then(function () {
					expect(server._options.ssl).to.equal(true);
					done();
				});
			});

			it("should start correctly with custom ssl cert/key but without specifying ssl flag", function (done) {
				server = serverFactory({sslcert: path.resolve(__dirname, '../test/ssl/server.crt'), sslkey: path.resolve(__dirname, '../test/ssl/server.key')});
				server.start().then(function () {
					expect(server._options.ssl).to.equal(true);
					done();
				});
			});

			it("should start correctly with cors", function (done) {
				server = serverFactory({cors: true});
				server.start().then(function () {
					expect(server._options.cors).to.equal(true);
					done();
				});
			});

			it("should start correctly with port", function (done) {
				server = serverFactory({port: 9500});
				server.start().then(function () {
					expect(server._options.port).to.equal(9500);
					done();
				});
			});

			it("should start correctly with host", function (done) {
				server = serverFactory({host: 'localhost'});
				server.start().then(function () {
					expect(server._options.host).to.equal('localhost');
					done();
				});
			});

			it("should start correctly with spec version 1", function (done) {
				server = serverFactory({spec: 1});
				server.start().then(function () {
					expect(server._options.spec).to.equal(1);
					done();
				});
			});

			it("should start correctly with spec version 2", function (done) {
				server = serverFactory({spec: 2});
				server.start().then(function () {
					expect(server._options.spec).to.equal(2);
					done();
				});
			});

			it("should start correctly with dir", function (done) {
				server = serverFactory({dir: dirPath});
				server.start().then(function () {
					expect(server._options.dir).to.equal(dirPath);
					done();
				});
			});

			it("should start correctly with log", function (done) {
				var logPath = path.resolve(dirPath, 'log.txt');
				server = serverFactory({log: logPath});
				server.start().then(function () {
					expect(server._options.log).to.equal(logPath);
					done();
				});
			});

			it("should start correctly with consumer name", function (done) {
				server = serverFactory({consumer: 'cName'});
				server.start().then(function () {
					expect(server._options.consumer).to.equal('cName');
					done();
				});
			});

			it("should start correctly with provider name", function (done) {
				server = serverFactory({provider: 'pName'});
				server.start().then(function () {
					expect(server._options.provider).to.equal('pName');
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
				expect(server._running).to.be.true;
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
					expect(server._running).to.be.false;
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
					expect(server._running).to.be.false;
					done();
				});
			});
		});
	});

});
