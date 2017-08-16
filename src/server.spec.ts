import rewire = require("rewire");
import serverFactory = rewire

("./server");
import chai = require("chai");
import fs = require("fs");
import path = require("path");
import q = require("q");
import _ = require("underscore");

const expect = chai.expect;

describe("Server Spec", () => {
	let server;

	afterEach((done) => {
		if (server) {
			server.delete().then(() => done());
		} else {
			done();
		}
	});

	describe("Start server", () => {
		context("when no options are set", () => {
			it("should start correctly with defaults", (done) => {
				server = serverFactory();
				server.start().then(() => done());
			});
		});

		context("when invalid options are set", () => {
			it("should fail if custom ssl certs do not exist", () => {
				expect(() => serverFactory({
					ssl: true,
					sslcert: "does/not/exist",
					sslkey: path.resolve(__dirname, "../test/ssl/server.key")
				})).to.throw(Error);
			});

			it("should fail if custom ssl keys do not exist", () => {
				expect(() => serverFactory({
					ssl: true,
					sslcert: path.resolve(__dirname, "../test/ssl/server.crt"),
					sslkey: "does/not/exist"
				})).to.throw(Error);
			});

			it("should fail if custom ssl cert is set, but ssl key isn't", () => {
				expect(() => serverFactory({
					ssl: true,
					sslcert: path.resolve(__dirname, "../test/ssl/server.crt")
				})).to.throw(Error);
			});

			it("should fail if custom ssl key is set, but ssl cert isn't", () => {
				expect(() => serverFactory({
					ssl: true,
					sslkey: path.resolve(__dirname, "../test/ssl/server.key")
				})).to.throw(Error);
			});
		});

		context("when valid options are set", () => {
			let dirPath;

			beforeEach(() => dirPath = path.resolve(__dirname, "../.tmp/" + Math.floor(Math.random() * 1000)));

			afterEach((done) => {
				try {
					if (fs.statSync(dirPath).isDirectory()) {
						fs.rmdirSync(dirPath);
					}
				} catch (e) {
				}
				done();
			});

			it("should start correctly when instance is delayed", (done) => {
				server = serverFactory();
				const waitForServerUp = serverFactory.__get__("waitForServerUp");

				q.allSettled([
					waitForServerUp(server._options),
					q.delay(5000).then(() => server.start())
				]).then((results) => {
					expect(_.reduce(results, (m, r) => m && r.state === "fulfilled")).to.be.true;
					done();
				});
			});

			it("should start correctly with ssl", (done) => {
				server = serverFactory({ssl: true});
				server.start().then(() => {
					expect(server._options.ssl).to.equal(true);
					done();
				});
			});

			it("should start correctly with custom ssl cert/key", (done) => {
				server = serverFactory({
					ssl: true,
					sslcert: path.resolve(__dirname, "../test/ssl/server.crt"),
					sslkey: path.resolve(__dirname, "../test/ssl/server.key")
				});
				server.start().then(() => {
					expect(server._options.ssl).to.equal(true);
					done();
				});
			});

			it("should start correctly with custom ssl cert/key but without specifying ssl flag", (done) => {
				server = serverFactory({
					sslcert: path.resolve(__dirname, "../test/ssl/server.crt"),
					sslkey: path.resolve(__dirname, "../test/ssl/server.key")
				});
				server.start().then(() => {
					expect(server._options.ssl).to.equal(true);
					done();
				});
			});

			it("should start correctly with cors", (done) => {
				server = serverFactory({cors: true});
				server.start().then(() => {
					expect(server._options.cors).to.equal(true);
					done();
				});
			});

			it("should start correctly with port", (done) => {
				server = serverFactory({port: 9500});
				server.start().then(() => {
					expect(server._options.port).to.equal(9500);
					done();
				});
			});

			it("should start correctly with host", (done) => {
				server = serverFactory({host: "localhost"});
				server.start().then(() => {
					expect(server._options.host).to.equal("localhost");
					done();
				});
			});

			it("should start correctly with spec version 1", (done) => {
				server = serverFactory({spec: 1});
				server.start().then(() => {
					expect(server._options.spec).to.equal(1);
					done();
				});
			});

			it("should start correctly with spec version 2", (done) => {
				server = serverFactory({spec: 2});
				server.start().then(() => {
					expect(server._options.spec).to.equal(2);
					done();
				});
			});

			it("should start correctly with dir", (done) => {
				server = serverFactory({dir: dirPath});
				server.start().then(() => {
					expect(server._options.dir).to.equal(dirPath);
					done();
				});
			});

			it("should start correctly with log", (done) => {
				const logPath = path.resolve(dirPath, "log.txt");
				server = serverFactory({log: logPath});
				server.start().then(() => {
					expect(server._options.log).to.equal(logPath);
					done();
				});
			});

			it("should start correctly with consumer name", (done) => {
				server = serverFactory({consumer: "cName"});
				server.start().then(() => {
					expect(server._options.consumer).to.equal("cName");
					done();
				});
			});

			it("should start correctly with provider name", (done) => {
				server = serverFactory({provider: "pName"});
				server.start().then(() => {
					expect(server._options.provider).to.equal("pName");
					done();
				});
			});
		});

		it("should dispatch event when starting", (done) => {
			server = serverFactory();
			server.once("start", () => done());
			server.start();
		});

		it("should change running state to true", (done) => {
			server = serverFactory();
			server.start().then(() => {
				expect(server._running).to.be.true;
				done();
			});
		});
	});

	describe("Stop server", () => {
		context("when already started", () => {
			it("should stop running", (done) => {
				server = serverFactory();
				server.start()
					.then(() => server.stop())
					.then(() => done());
			});

			it("should dispatch event when stopping", (done) => {
				server = serverFactory();
				server.once("stop", () => done());
				server.start().then(() => server.stop());
			});

			it("should change running state to false", (done) => {
				server = serverFactory();
				server.start()
					.then(() => server.stop())
					.then(() => {
						expect(server._running).to.be.false;
						done();
					});
			});
		});
	});

	describe("Delete server", () => {
		context("when already running", () => {
			it("should stop & delete server", (done) => {
				server = serverFactory();
				server.start()
					.then(() => server.delete())
					.then(() => done());
			});

			it("should dispatch event when deleting", (done) => {
				server = serverFactory();
				server.once("delete", () => done());
				server.start().then(() => server.delete());
			});

			it("should change running state to false", (done) => {
				server = serverFactory();
				server.start()
					.then(() => server.delete())
					.then(() => {
						expect(server._running).to.be.false;
						done();
					});
			});
		});
	});
});
