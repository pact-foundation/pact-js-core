import chai = require("chai");
import cp = require("child_process");
import path = require("path");
import q = require("q");
import request = require("request");
import {ChildProcess} from "child_process";

const http = q.denodeify(request);

const isWindows = process.platform === "win32";
const expect = chai.expect;

describe("Pact CLI Spec", () => {
	const cliPath: string = path.resolve(__dirname, "pact-node");
	let procs: ChildProcess[] = [];

	function spawn(args) {
		args = args || {port: 1234, host: "localhost"};
		let deferred = q.defer();
		let amount = 0;
		let opts = {
			cwd: __dirname,
			detached: !isWindows,
			windowsVerbatimArguments: isWindows
		};
		procs.push(cp.spawn(cliPath, args, opts));
		check();

		function check() {
			amount++;
			call(args).then(() => {
				if (amount >= 10) {
					deferred.reject(new Error("Pact stop failed; tried calling service 10 times with no result."));
				}
				setTimeout(check, 1000);
			}, deferred.resolve);
		}

		function call(options) {
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

		return deferred.promise.timeout(10000, "Process took too long");
	}

	beforeEach(() => procs = []);

	afterEach(() => {
		for (let i = 0, len = procs.length; i < len; i++) {
			if (isWindows) {
				cp.execSync("taskkill /f /t /pid " + procs[i].pid);
			} else {
				process.kill(-procs[i].pid, "SIGKILL");
			}
		}
	});

	describe("run pact-node command", () => {
		context("when no options are set", () => {
			/*it("should use defaults and start running", function (done) {
			 spawn();
			 done();
			 });*/
		});

		/*context("when user specifies valid options", () => {
		 let dirPath;
		 beforeEach(function (done) {
		 dirPath = path.resolve(__dirname, "../.tmp" + Math.floor(Math.random() * 1000));
		 fs.mkdir(dirPath, done);
		 });
		 afterEach(function (done) {
		 fs.rmdir(dirPath, done);
		 });

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

		 context("when user specifies port that"s currently in use", () => {
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
	});
});
