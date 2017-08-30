import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import childProcess = require("child_process");
import fs = require("fs");
import path = require("path");
import q = require("q");
import request = require("request");
import _ = require("underscore");
import {ChildProcess} from "child_process";
import {ServerOptions} from "../src/server";
import decamelize = require("decamelize");

const http = q.denodeify(request);
const pkg = require("../package.json");
const isWindows = process.platform === "win32";
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Pact CLI Spec", () => {
	afterEach(() => CLI.stopAll());

	it("should show the proper version", () => {
		return expect(CLI.runSync(["--version"]).then((cp) => cp.stdout)).to.eventually.contain(pkg.version);
	});

	it("should show the help options with the commands available", () => {
		const out = CLI.runSync(["--help"]).then((cp) => cp.stdout);
		return q.all([
			expect(out).to.eventually.contain("Usage: pact "),
			expect(out).to.eventually.contain("mock"),
			expect(out).to.eventually.contain("verify"),
		]);
	});

	describe("Mock Command", () => {
		it("should display help", () => {
			return expect(CLI.runSync(["mock", "--help"]).then((cp) => cp.stdout)).to.eventually.contain("Usage: mock ");
		});

		/*context("when user specifies valid options", () => {
			let dirPath;

			beforeEach(() => fs.mkdirSync(path.resolve(__dirname, `../.tmp${Math.floor(Math.random() * 1000)}`)));
			afterEach(() => fs.rmdirSync(dirPath));

			it("should return serverFactory using specified options", () => {
				let options = {
					port: 9500,
					host: "localhost",
					dir: dirPath,
					ssl: true,
					cors: true,
					log: "log.txt",
					spec: 1,
					consumer: "consumerName",
					provider: "providerName"
				};

			});
		});

		context("when user specifies invalid port", () => {
			it("should return an error on negative port number", () => {

			});

			it("should return an error on non-integer", () => {
			});

			it("should return an error on non-number", () => {
			});

			it("should return an error on outside port range", () => {
			});

		});

		context("when user specifies port that's currently in use", () => {
			it("should return a port conflict error", () => {
			});
		});

		context("when user specifies invalid host", () => {
			it("should return an error on non-string", () => {
			});

		});

		context("when user specifies invalid directory", () => {
			it("should return an error on invalid path", () => {
			});

		});

		context("when user specifies invalid ssl", () => {
			it("should return an error on non-boolean", () => {
			});

		});

		context("when user specifies invalid cors", () => {
			it("should return an error on non-boolean", () => {
			});

		});

		context("when user specifies invalid log", () => {
			it("should return an error on invalid path", () => {
			});

		});

		context("when user specifies invalid spec", () => {
			it("should return an error on non-number", () => {
			});

			it("should return an error on negative number", () => {
			});

			it("should return an error on non-integer", () => {
			});

		});

		context("when user specifies invalid consumer name", () => {
			it("should return an error on non-string", () => {
			});
		});

		context("when user specifies invalid provider name", () => {
			it("should return an error on non-string", () => {
			});
		});*/

		describe("Verify Command", () => {
			it("should display help", () => {
				return expect(CLI.runSync(["verify", "--help"]).then((cp) => cp.stdout)).to.eventually.contain("Usage: verify ");
			});
		});
	});
});

class CLI {
	public static runMock(options: ServerOptions = {}): q.Promise<CLI> {
		const args = _.chain(options)
			.pairs()
			.map((arr) => `${decamelize(arr[0], "-")} ${arr[1]}`)
			.value();

		return this.run(args)
			.tap(() => this.check(options))
			.timeout(10000, "Process took too long")
			.catch(() => null);
	}

	public static run(args: string[] = []): q.Promise<CLI> {
		const opts = {
			cwd: __dirname,
			detached: !isWindows,
			windowsVerbatimArguments: isWindows
		};
		args.unshift(this.__cliPath);
		const proc = childProcess.spawn("node", args, opts);
		this.__children.push(proc);
		return q(new CLI(proc));
	}

	public static runSync(args: string[] = []): q.Promise<CLI> {
		return this.run(args)
			.then((cp) => {
				const deferred = q.defer<CLI>();
				cp.process.once("exit", () => deferred.resolve(cp));
				return deferred.promise;
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
			isWindows ? childProcess.execSync(`taskkill /f /t /pid ${child.pid}`) : process.kill(-child.pid, "SIGKILL");
		}
	}

	private static readonly __children: ChildProcess[] = [];
	private static readonly __cliPath: string = require.resolve("./pact-cli.js");

	private static check(options: ServerOptions, amount: number = 0) {
		amount++;
		return this.call(options).catch(() => {
			if (amount >= 10) {
				return q.reject(new Error("Pact stop failed; tried calling service 10 times with no result."));
			}
			setTimeout(() => this.check(options, amount), 1000);
		});
	}

	private static call(options: ServerOptions) {
		let config: any = {
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

		return http(config)
			.then((data) => data[0])
			.then((response) => {
				if (response.statusCode !== 200) {
					return q.reject();
				}
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
		this.process.stdout.on("data", (d) => this.__stdout += d);
		this.process.stderr.on("data", (d) => this.__stderr += d);
		this.process.once("exit", () => {
			CLI.remove(this.process);
			this.process.stdout.removeAllListeners();
			this.process.stderr.removeAllListeners();
		});
	}
}
