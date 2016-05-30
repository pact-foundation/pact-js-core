/* global describe:true, before:true, after:true, it:true, global:true, process:true */

var expect = require('chai').expect,
	pact = require('./pact.js'),
	logger = require('./logger.js'),
	path = require('path'),
	chai = require("chai"),
	chaiAsPromised = require("chai-as-promised"),
	provider = require('../test/integration/provider.js');

chai.use(chaiAsPromised);

describe("Pact Spec", function () {
	before(function() {
		logger.level('debug');
	});

	afterEach(function (done) {
		pact.removeAllServers().then(function () {
			done();
		});
	});

	describe("Create serverFactory", function () {
		context("when no options are set", function () {
			it("should use defaults and return serverFactory", function () {
				var server = pact.createServer();
				expect(server).to.be.an('object');
				expect(server.options).to.be.an('object');
				expect(server.options).to.contain.all.keys(['port', 'cors', 'ssl', 'host', 'dir', 'log', 'spec', 'consumer', 'provider']);
				expect(server.start).to.be.a('function');
				expect(server.stop).to.be.a('function');
				expect(server.delete).to.be.a('function');
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
				var server = pact.createServer(options);
				expect(server).to.be.an('object');
				expect(server.options).to.be.an('object');
				expect(server.options.port).to.equal(options.port);
				expect(server.options.host).to.equal(options.host);
				expect(server.options.dir).to.equal(options.dir);
				expect(server.options.ssl).to.equal(options.ssl);
				expect(server.options.cors).to.equal(options.cors);
				expect(server.options.log).to.equal(options.log);
				expect(server.options.spec).to.equal(options.spec);
				expect(server.options.consumer).to.equal(options.consumer);
				expect(server.options.provider).to.equal(options.provider);
			});
		});

		context("when user specifies invalid port", function () {
			it("should return an error on negative port number", function () {
				expect(function () {
					pact.createServer({port: -42})
				}).to.throw(Error);
			});

			it("should return an error on non-integer", function () {
				expect(function () {
					pact.createServer({port: 42.42});
				}).to.throw(Error);
			});

			it("should return an error on non-number", function () {
				expect(function () {
					pact.createServer({port: '99'});
				}).to.throw(Error);
			});

			it("should return an error on outside port range", function () {
				expect(function () {
					pact.createServer({port: 99999});
				}).to.throw(Error);
			});
		});

		context("when user specifies port that's currently in use", function () {
			it("should return a port conflict error", function () {
				pact.createServer({port: 5100});
				expect(function () {
					pact.createServer({port: 5100})
				}).to.throw(Error);
			});
		});

		context("when user specifies invalid host", function () {
			it("should return an error on non-string", function () {
				expect(function () {
					pact.createServer({host: 12});
				}).to.throw(Error);
			});
		});

		context("when user specifies invalid pact directory", function () {
			it("should return an error on invalid path", function () {
				expect(function () {
					pact.createServer({dir: 'M:/nms'});
				}).to.throw(Error);
			});
		});

		context("when user specifies invalid ssl", function () {
			it("should return an error on non-boolean", function () {
				expect(function () {
					pact.createServer({ssl: 1});
				}).to.throw(Error);
			});
		});

		context("when user specifies invalid cors", function () {
			it("should return an error on non-boolean", function () {
				expect(function () {
					pact.createServer({cors: 1});
				}).to.throw(Error);
			});
		});

		context("when user specifies invalid log", function () {
			it("should return an error on invalid path", function () {
				expect(function () {
					pact.createServer({log: 'abc/123'});
				}).to.throw(Error);
			});
		});

		context("when user specifies invalid spec", function () {
			it("should return an error on non-number", function () {
				expect(function () {
					pact.createServer({spec: '1'});
				}).to.throw(Error);
			});

			it("should return an error on negative number", function () {
				expect(function () {
					pact.createServer({spec: -12});
				}).to.throw(Error);
			});

			it("should return an error on non-integer", function () {
				expect(function () {
					pact.createServer({spec: 3.14});
				}).to.throw(Error);
			});
		});

		context("when user specifies invalid consumer name", function () {
			it("should return an error on non-string", function () {
				expect(function () {
					pact.createServer({consumer: 1234});
				}).to.throw(Error);
			});
		});

		context("when user specifies invalid provider name", function () {
			it("should return an error on non-string", function () {
				expect(function () {
					pact.createServer({provider: 2341});
				}).to.throw(Error);
			});
		});
	});

	describe("List servers", function () {
		context("when called and there are no servers", function () {
			it("should return an empty list", function () {
				expect(pact.listServers()).to.be.empty;
			});
		});

		context("when called and there are servers in list", function () {
			it("should return a list of all servers", function () {
				pact.createServer({port: 1234});
				pact.createServer({port: 1235});
				pact.createServer({port: 1236});
				expect(pact.listServers()).to.have.length(3);
			});
		});

		context("when server is removed", function () {
			it("should update the list", function (done) {
				pact.createServer({port: 1234});
				pact.createServer({port: 1235});
				pact.createServer({port: 1236}).delete().then(function () {
					expect(pact.listServers()).to.have.length(2);
					done();
				});
			});
		});
	});

	describe("Remove all servers", function () {
		context("when removeAll() is called and there are servers to remove", function () {
			it("should remove all servers", function (done) {
				pact.createServer({port: 1234});
				pact.createServer({port: 1235});
				pact.createServer({port: 1236});
				pact.removeAllServers().then(function () {
					expect(pact.listServers()).to.be.empty;
					done();
				});
			});
		});
	});

	// TODO: uncomment once signature is back
	/*describe("Verify Pacts", function () {
		context("With provider states", function () {
			it("should start the pact-provider-verifier service and verify pacts", function () {
				var opts = {
					providerBaseUrl: "http://localhost",
					pactUrls: [ path.dirname(process.mainModule.filename) ]
				};
				return expect(pact.verifyPacts(opts)).to.eventually.be.resolved;
			});
		});
	});

	describe("Publish Pacts", function () {
		it("should start running the Pact publishig process", function () {
			var opts = {
				pactBroker: "http://localhost",
				pactUrls: [ path.dirname(process.mainModule.filename) ],
				consumerVersion: "1.0.0"
			};
			return expect(pact.publishPacts(opts)).to.eventually.be.resolved;
		});
	});*/
});
