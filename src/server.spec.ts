// tslint:disable:no-string-literal

import serverFactory from "./server";
import chai = require("chai");
import fs = require("fs");
import path = require("path");
import q = require("q");
import _ = require("underscore");

const expect = chai.expect;

describe("Server Spec", () => {
	let server;

	afterEach(() => server ? server.delete() : null);

	describe("Start server", () => {
		context("when no options are set", () => {
			it("should start correctly with defaults", () => {
				server = serverFactory();
				return server.start();
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

			it("should start correctly when instance is delayed", () => {
				server = serverFactory();
				const waitForServerUp = (server as any)["__waitForServerUp"].bind(server);

				return q.allSettled([
					waitForServerUp(server.options),
					q.delay(5000).then(() => server.start())
				]).then((results) => expect(_.reduce(results, (m, r) => m && r.state === "fulfilled")).to.be.true);
			});

			it("should start correctly with ssl", () => {
				server = serverFactory({ssl: true});
				return server.start()
					.then(() => expect(server.options.ssl).to.equal(true));
			});

			it("should start correctly with custom ssl cert/key", () => {
				server = serverFactory({
					ssl: true,
					sslcert: path.resolve(__dirname, "../test/ssl/server.crt"),
					sslkey: path.resolve(__dirname, "../test/ssl/server.key")
				});
				return server.start()
					.then(() => expect(server.options.ssl).to.equal(true));
			});

			it("should start correctly with custom ssl cert/key but without specifying ssl flag", () => {
				server = serverFactory({
					sslcert: path.resolve(__dirname, "../test/ssl/server.crt"),
					sslkey: path.resolve(__dirname, "../test/ssl/server.key")
				});
				return server.start()
					.then(() => expect(server.options.ssl).to.equal(true));
			});

			it("should start correctly with cors", () => {
				server = serverFactory({cors: true});
				return server.start()
					.then(() => expect(server.options.cors).to.equal(true));
			});

			it("should start correctly with port", () => {
				server = serverFactory({port: 9500});
				return server.start()
					.then(() => expect(server.options.port).to.equal(9500));
			});

			it("should start correctly with host", () => {
				server = serverFactory({host: "localhost"});
				return server.start()
					.then(() => expect(server.options.host).to.equal("localhost"));
			});

			it("should start correctly with spec version 1", () => {
				server = serverFactory({spec: 1});
				return server.start().then(() => expect(server.options.spec).to.equal(1));
			});

			it("should start correctly with spec version 2", () => {
				server = serverFactory({spec: 2});
				return server.start()
					.then(() => expect(server.options.spec).to.equal(2));
			});

			it("should start correctly with dir", () => {
				server = serverFactory({dir: dirPath});
				return server.start()
					.then(() => expect(server.options.dir).to.equal(dirPath));
			});

			it("should start correctly with log", () => {
				const logPath = path.resolve(dirPath, "log.txt");
				server = serverFactory({log: logPath});
				return server.start()
					.then(() => expect(server.options.log).to.equal(logPath));
			});

			it("should start correctly with consumer name", () => {
				server = serverFactory({consumer: "cName"});
				return server.start()
					.then(() => expect(server.options.consumer).to.equal("cName"));
			});

			it("should start correctly with provider name", () => {
				server = serverFactory({provider: "pName"});
				return server.start()
					.then(() => expect(server.options.provider).to.equal("pName"));
			});
		});

		it("should dispatch event when starting", (done) => {
			server = serverFactory();
			server.once("start", () => done());
			server.start();
		});

		it("should change running state to true", () => {
			server = serverFactory();
			return server.start()
				.then(() => expect((server as any)["__running"]).to.be.true);
		});
	});

	describe("Stop server", () => {
		context("when already started", () => {
			it("should stop running", () => {
				server = serverFactory();
				return server.start().then(() => server.stop());
			});

			it("should dispatch event when stopping", (done) => {
				server = serverFactory();
				server.once("stop", () => done());
				server.start().then(() => server.stop());
			});

			it("should change running state to false", () => {
				server = serverFactory();
				return server.start()
					.then(() => server.stop())
					.then(() => expect((server as any)["__running"]).to.be.false);
			});
		});
	});

	describe("Delete server", () => {
		context("when already running", () => {
			it("should stop & delete server", () => {
				server = serverFactory();
				return server.start()
					.then(() => server.delete());
			});

			it("should dispatch event when deleting", (done) => {
				server = serverFactory();
				server.once("delete", () => done());
				server.start().then(() => server.delete());
			});

			it("should change running state to false", () => {
				server = serverFactory();
				return server.start()
					.then(() => server.delete())
					.then(() => expect((server as any)["__running"]).to.be.false);
			});
		});
	});
});
