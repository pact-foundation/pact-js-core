import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import childProcess = require("child_process");
import q = require("q");
import path = require("path");
import {ChildProcess} from "child_process";
import {ServerOptions} from "../src/server";
import util from "../src/pact-util";
import providerMock from "../test/integration/provider-mock";
import brokerMock from "../test/integration/broker-mock";
import * as http from "http";

const stripAnsi = require("strip-ansi");
const decamelize = require("decamelize");
const _ = require("underscore");

const request = q.denodeify(require("request"));
const pkg = require("../package.json");
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Pact CLI Spec", () => {
	afterEach(() => CLI.stopAll());

	it("should show the proper version", () => {
		return expect(CLI.runSync(["--version"]).then((cp) => cp.stdout)).to.eventually.contain(pkg.version);
	});

	it("should show the help options with the commands available", () => {
		const p = CLI.runSync(["--help"]).then((cp) => cp.stdout);
		return q.all([
			expect(p).to.eventually.contain("USAGE"),
			expect(p).to.eventually.contain("pact "),
			expect(p).to.eventually.contain("mock"),
			expect(p).to.eventually.contain("verify"),
		]);
	});

	describe("Mock Command", () => {
		it("should display help", () => {
			const p = CLI.runSync(["mock", "--help"]).then((cp) => cp.stdout);
			return q.all([
				expect(p).to.eventually.contain("USAGE"),
				expect(p).to.eventually.contain("pact mock"),
			]);
		});

		it("should run mock service", () => {
			const p = CLI.runMock({port: 9500}).then((cp) => cp.stdout);
			return q.all([
				expect(p).to.eventually.be.fulfilled,
				expect(p).to.eventually.match(/Created.*process with PID/),
			]);
		});
	});

	describe("Verify Command", () => {
		it("should display help", () => {
			const p = CLI.runSync(["verify", "--help"]).then((cp) => cp.stdout);
			return q.all([
				expect(p).to.eventually.contain("USAGE"),
				expect(p).to.eventually.contain("pact verify")
			]);
		});

		it("should fail if missing 'provider-base-url' argument", () => {
			return expect(CLI.runSync(["verify"]).then((cp) => cp.stderr)).to.eventually.contain("Must provide the providerBaseUrl argument");
		});

		context("with provider mock", () => {
			let server: http.Server;
			const PORT = 9123;
			const providerBaseUrl = `http://localhost:${PORT}`;

			before(() => providerMock(PORT).then((s) => server = s));
			after(() => server.close());

			it("should work pointing to fake broker", () =>
				expect(
					CLI.runSync([
						"verify",
						"--provider-base-url", providerBaseUrl,
						"--pact-urls", path.resolve(__dirname, "integration/me-they-success.json")
					]).then((cp) => cp.stdout)
				).to.eventually.be.fulfilled
			);

			it("should work with a weird path to a file", () =>
				expect(
					CLI.runSync([
						"verify",
						"--provider-base-url", providerBaseUrl,
						"--pact-urls", path.resolve(__dirname, "integration/me-they-weird path-success.json")
					]).then((cp) => cp.stdout)
				).to.eventually.be.fulfilled
			);
		});
	});

	describe("Publish Command", () => {
		it("should display help", () => {
			const p = CLI.runSync(["publish", "--help"]).then((cp) => cp.stdout);
			return q.all([
				expect(p).to.eventually.contain("USAGE"),
				expect(p).to.eventually.contain("pact publish")
			]);
		});

		it("should fail if missing 'provider-base-url' argument", () => {
			return expect(CLI.runSync(["publish"]).then((cp) => cp.stderr)).to.eventually.contain("Missing option");
		});

		context("with broker mock", () => {
			const PORT = 9123;
			const brokerBaseUrl = `http://localhost:${PORT}`;
			const currentDir = (process && process.mainModule) ? process.mainModule.filename : "";
			let server: http.Server;

			before(() => brokerMock(PORT).then((s) => server = s));
			after(() => server.close());

			it("should work pointing to fake broker", () => {
				const p = CLI.runSync(["publish", "--pact-files-or-dirs", path.dirname(currentDir), "--consumer-version", "1.0.0", "--pact-broker", brokerBaseUrl])
					.then((cp) => cp.stdout);
				return expect(p).to.eventually.be.fulfilled;
			});
		});
	});

	describe("can-i-deploy Command", () => {
		it("should display help", () => {
			const p = CLI.runSync(["can-i-deploy", "--help"]).then((cp) => cp.stdout);
			return q.all([
				expect(p).to.eventually.contain("USAGE"),
				expect(p).to.eventually.contain("pact can-i-deploy")
			]);
		});

		it("should fail if missing arguments", () => {
			return expect(CLI.runSync(["can-i-deploy"]).then((cp) => cp.stderr)).to.eventually.contain("Error");
		});

		context("with broker mock", () => {
			const PORT = 9123;
			const brokerBaseUrl = `http://localhost:${PORT}`;
			let server: http.Server;

			before(() => brokerMock(PORT).then((s) => server = s));
			after(() => server.close());

			it("should work pointing to fake broker", () => {
				const p = CLI.runSync(["can-i-deploy", "--pacticipant", "pacticipant1", "--version", "1.0.0", "--pact-broker", brokerBaseUrl])
					.then((cp) => cp.stdout);
				return expect(p).to.eventually.be.fulfilled;
			});
		});
	});
});

class CLI {
	public static runMock(options: ServerOptions = {}): q.Promise<CLI> {
		const args = _.chain(options)
			.pairs()
			.map((arr: any[]) => [`--${decamelize(arr[0], "-")}`, `${arr[1]}`])
			.flatten()
			.value();

		return this.run(["mock"].concat(args))
			.tap(() => this.checkMockStarted(options));
	}

	public static run(args: string[] = []): q.Promise<CLI> {
		const opts = {
			cwd: __dirname,
			detached: !util.isWindows(),
			windowsVerbatimArguments: util.isWindows()
		};
		args = [this.__cliPath].concat(args);
		if(util.isWindows()) {
			args = args.map((v) => `"${v}"`);
		}
		const proc = childProcess.spawn("node", args, opts);
		this.__children.push(proc);
		return q(new CLI(proc))
			.tap((cli) => this.commandRunning(cli));
	}

	public static runSync(args: string[] = []): q.Promise<CLI> {
		return this.run(args)
			.tap((cp) => {
				if ((cp.process as any).exitCode === null) {
					const deferred = q.defer<CLI>();
					cp.process.once("exit", () => deferred.resolve());
					return deferred.promise;
				}
				return null;
			});
	}

	public static remove(proc: ChildProcess) {
		for (let i = 0; i < this.__children.length; i++) {
			if (this.__children[i] === proc) {
				this.__children.splice(i, 1);
				break;
			}
		}
	}

	public static stopAll() {
		for (let child of this.__children) {
			util.isWindows() ? childProcess.execSync(`taskkill /f /t /pid ${child.pid}`) : process.kill(-child.pid, "SIGINT");
		}
	}

	private static readonly __children: ChildProcess[] = [];
	private static readonly __cliPath: string = require.resolve("./pact-cli.js");

	private static commandRunning(c: CLI, amount: number = 0): q.Promise<any> {
		amount++;
		const isSet = () => c.stdout.length !== 0 || c.stderr.length !== 0 ? q.resolve() : q.reject();
		return isSet()
			.catch(() => {
				if (amount >= 10) {
					return q.reject(new Error("stdout and stderr never set, command probably didn't run"));
				}
				return q.delay(1000).then(() => this.commandRunning(c, amount));
			});
	}

	private static checkMockStarted(options: ServerOptions, amount: number = 0): q.Promise<any> {
		amount++;
		return this.call(options)
			.catch(() => {
				if (amount >= 10) {
					return q.reject(new Error("Pact stop failed; tried calling service 10 times with no result."));
				}
				// Try again in 1 second
				return q.delay(1000).then(() => this.checkMockStarted(options, amount));
			});
	}

	private static call(options: ServerOptions): q.Promise<any> {
		// console.log("Calling to see if pact service is up");
		options.ssl = options.ssl || false;
		options.cors = options.cors || false;
		options.host = options.host || "localhost";
		options.port = options.port || 1234;
		const config: any = {
			uri: `http${options.ssl ? "s" : ""}://${options.host}:${options.port}`,
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

		return request(config)
			.then((data) => data[0])
			.then((response) => {
				if (response.statusCode !== 200) {
					return q.reject();
				}
				// console.log("Pact service is up");
				return response;
			});
	}

	public get stdout(): string {
		return this.__stdout;
	}

	public get stderr(): string {
		return this.__stderr;
	}

	public readonly process: ChildProcess;
	private __stdout: string = "";
	private __stderr: string = "";

	constructor(proc: ChildProcess) {
		this.process = proc;
		this.process.stdout.setEncoding("utf8");
		this.process.stdout.on("data", (d) => {
			// console.log(d);
			this.__stdout += stripAnsi(d);
		});
		this.process.stderr.setEncoding("utf8");
		this.process.stderr.on("data", (d) => {
			// console.log(d);
			this.__stderr += stripAnsi(d);
		});
		this.process.once("exit", (code) => {
			// console.log("EXITED " + code);
			CLI.remove(this.process);
			this.process.stdout.removeAllListeners();
			this.process.stderr.removeAllListeners();
		});
	}
}
