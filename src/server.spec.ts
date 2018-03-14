// tslint:disable:no-string-literal

import serverFactory from "./server";
import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import fs = require("fs");
import path = require("path");
import q = require("q");
import _ = require("underscore");

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Server Spec", () => {
	let server: any;

	afterEach(() => server ? server.delete() : null);

	describe("Start server", () => {
		context("when no options are set", () => {
			it("should start correctly with defaults", () => {
				server = serverFactory();
				return expect(server.start()).to.eventually.be.fulfilled;
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

			it("should fail if incorrect pactFileWriteMode provided", () => {
				expect(() => serverFactory({
					pactFileWriteMode: "notarealoption",
				})).to.throw(Error);
			});
		});

		context("when valid options are set", () => {
			let dirPath: string;

			beforeEach(() => dirPath = path.resolve(__dirname, `../.tmp/${Math.floor(Math.random() * 1000)}`));

			afterEach(() => {
				try {
					if (fs.statSync(dirPath).isDirectory()) {
						fs.rmdirSync(dirPath);
					}
				} catch (e) {
				}
			});

			it("should start correctly when instance is delayed", () => {
				server = serverFactory();

				const waitForServerUp = (server as any)["__waitForServiceUp"].bind(server);
				return q.allSettled([
					waitForServerUp(server.options),
					q.delay(5000).then(() => server.start())
				]).then((results) => expect(_.reduce(results, (m, r) => m && r.state === "fulfilled")).to.be.true);
			});

			it("should start correctly with ssl", () => {
				server = serverFactory({ssl: true});
				expect(server.options.ssl).to.equal(true);
				return expect(server.start()).to.eventually.be.fulfilled;
			});

			it("should start correctly with custom ssl cert/key", () => {
				server = serverFactory({
					ssl: true,
					sslcert: path.resolve(__dirname, "../test/ssl/server.crt"),
					sslkey: path.resolve(__dirname, "../test/ssl/server.key")
				});
				expect(server.options.ssl).to.equal(true);
				return expect(server.start()).to.eventually.be.fulfilled;
			});

			it("should start correctly with custom ssl cert/key but without specifying ssl flag", () => {
				server = serverFactory({
					sslcert: path.resolve(__dirname, "../test/ssl/server.crt"),
					sslkey: path.resolve(__dirname, "../test/ssl/server.key")
				});

				expect(server.options.ssl).to.equal(true);
				return expect(server.start()).to.eventually.be.fulfilled;
			});

			it("should start correctly with cors", () => {
				server = serverFactory({cors: true});
				expect(server.options.cors).to.equal(true);
				return expect(server.start()).to.eventually.be.fulfilled;
			});

			it("should start correctly with port", () => {
				const port = Math.floor(Math.random() * 999) + 9000;
				server = serverFactory({port: port});
				expect(server.options.port).to.equal(port);
				return expect(server.start()).to.eventually.be.fulfilled;
			});

			it("should start correctly with host", () => {
				const host = "localhost";
				server = serverFactory({host: host});
				expect(server.options.host).to.equal(host);
				return expect(server.start()).to.eventually.be.fulfilled;
			});

			it("should start correctly with spec version 1", () => {
				server = serverFactory({spec: 1});
				expect(server.options.spec).to.equal(1);
				return expect(server.start()).to.eventually.be.fulfilled;
			});

			it("should start correctly with spec version 2", () => {
				server = serverFactory({spec: 2});
				expect(server.options.spec).to.equal(2);
				return expect(server.start()).to.eventually.be.fulfilled;
			});

			it("should start correctly with dir", () => {
				server = serverFactory({dir: dirPath});
				expect(server.options.dir).to.equal(dirPath);
				return expect(server.start()).to.eventually.be.fulfilled;
			});

			it("should start correctly with log", () => {
				const logPath = path.resolve(dirPath, "log.txt");
				server = serverFactory({log: logPath});
				expect(server.options.log).to.equal(logPath);
				return expect(server.start()).to.eventually.be.fulfilled;
			});

			it("should start correctly with consumer name", () => {
				const consumerName = "cName";
				server = serverFactory({consumer: consumerName});
				expect(server.options.consumer).to.equal(consumerName);
				return expect(server.start()).to.eventually.be.fulfilled;
			});

			it("should start correctly with provider name", () => {
				const providerName = "pName";
				server = serverFactory({provider: providerName});
				expect(server.options.provider).to.equal(providerName);
				return expect(server.start()).to.eventually.be.fulfilled;
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
