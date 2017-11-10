// tslint:disable:no-string-literal

import checkTypes = require("check-types");
import _ = require("underscore");
import path = require("path");
import fs = require("fs");
import cp = require("child_process");
import events = require("events");
import http = require("request");
import q = require("q");
import pact = require("@pact-foundation/pact-standalone");
import mkdirp = require("mkdirp");
import logger from "./logger";
import pactUtil from "./pact-util";
import {ChildProcess, SpawnOptions} from "child_process";

const isWindows = process.platform === "win32";
const CHECKTIME = 500;
const RETRY_AMOUNT = 60;
const PROCESS_TIMEOUT = 30000;

export class Server extends events.EventEmitter {
	public static get Events() {
		return {
			START_EVENT: "start",
			STOP_EVENT: "stop",
			DELETE_EVENT: "delete"
		};
	}

	public static create(options: ServerOptions = {}): Server {
		// defaults
		options.ssl = options.ssl || false;
		options.cors = options.cors || false;
		options.dir = options.dir ? path.resolve(options.dir) : process.cwd(); // Use directory relative to cwd
		options.host = options.host || "localhost";

		// port checking
		if (options.port) {
			checkTypes.assert.number(options.port);
			checkTypes.assert.integer(options.port);
			checkTypes.assert.positive(options.port);
			checkTypes.assert.inRange(options.port, 0, 65535);

			if (checkTypes.not.inRange(options.port, 1024, 49151)) {
				logger.warn("Like a Boss, you used a port outside of the recommended range (1024 to 49151); I too like to live dangerously.");
			}
		}

		// ssl check
		checkTypes.assert.boolean(options.ssl);

		// Throw error if one ssl option is set, but not the other
		if ((options.sslcert && !options.sslkey) || (!options.sslcert && options.sslkey)) {
			throw new Error("Custom ssl certificate and key must be specified together.");
		}

		// check certs/keys exist for SSL
		if (options.sslcert) {
			try {
				fs.statSync(path.normalize(options.sslcert)).isFile();
			} catch (e) {
				throw new Error(`Custom ssl certificate not found at path: ${options.sslcert}`);
			}
		}

		if (options.sslkey) {
			try {
				fs.statSync(path.normalize(options.sslkey)).isFile();
			} catch (e) {
				throw new Error(`Custom ssl key not found at path: ${options.sslkey}`);
			}
		}

		// If both sslcert and sslkey option has been specified, let"s assume the user wants to enable ssl
		if (options.sslcert && options.sslkey) {
			options.ssl = true;
		}

		// cors check"
		checkTypes.assert.boolean(options.cors);

		// spec checking
		if (options.spec) {
			checkTypes.assert.number(options.spec);
			checkTypes.assert.integer(options.spec);
			checkTypes.assert.positive(options.spec);
		}

		// dir check
		if (options.dir) {
			try {
				fs.statSync(path.normalize(options.dir)).isDirectory();
			} catch (e) {
				mkdirp.sync(path.normalize(options.dir));
			}
		}

		// log check
		if (options.log) {
			const fileObj = path.parse(path.normalize(options.log));
			try {
				fs.statSync(fileObj.dir).isDirectory();
			} catch (e) {
				// If log path doesn"t exist, create it
				mkdirp.sync(fileObj.dir);
			}
		}

		// host check
		if (options.host) {
			checkTypes.assert.string(options.host);
		}

		// consumer name check
		if (options.consumer) {
			checkTypes.assert.string(options.consumer);
		}

		// provider name check
		if (options.provider) {
			checkTypes.assert.string(options.provider);
		}

		// monkeypatch check
		if (options.monkeypatch) {
			try {
				fs.statSync(path.normalize(options.monkeypatch)).isFile();
			} catch (e) {
				throw new Error(`Monkeypatch not found at path: ${options.monkeypatch}`);
			}
		}

		return new Server(options);
	}

	public readonly options: ServerOptions;
	private __running: boolean;
	private __instance: ChildProcess;

	constructor(options: ServerOptions) {
		super();
		this.options = options;
		this.__running = false;
	}

	// Let the mocking begin!
	public start(): q.Promise<Server> {
		if (this.__instance && this.__instance.connected) {
			logger.warn(`You already have a process running with PID: ${this.__instance.pid}`);
			return;
		}

		const envVars = JSON.parse(JSON.stringify(process.env)); // Create copy of environment variables
		// Remove environment variable if there
		// This is a hack to prevent some weird Travelling Ruby behaviour with Gems
		// https://github.com/pact-foundation/pact-mock-service-npm/issues/16
		delete envVars["RUBYGEMS_GEMDEPS"];
		let file: string;
		let opts: SpawnOptions = {
			cwd: pact.cwd,
			detached: !isWindows,
			env: envVars
		};
		let args: string[] = pactUtil.createArguments(this.options, {
			"port": "--port",
			"host": "--host",
			"log": "--log",
			"ssl": "--ssl",
			"sslcert": "--sslcert",
			"sslkey": "--sslkey",
			"cors": "--cors",
			"dir": "--pact_dir",
			"spec": "--pact_specification_version",
			"consumer": "--consumer",
			"provider": "--provider",
			"monkeypatch": "--monkeypatch"
		});

		let cmd: string = [pact.mockServicePath].concat("service", ...args).join(" ");

		if (isWindows) {
			file = "cmd.exe";
			args = ["/s", "/c", cmd];
			(opts as any).windowsVerbatimArguments = true;
		} else {
			cmd = `./${cmd}`;
			file = "/bin/sh";
			args = ["-c", cmd];
		}
		logger.debug(`Starting binary with '${_.flatten([file, args, JSON.stringify(opts)])}'`);
		this.__instance = cp.spawn(file, args, opts);

		this.__instance.stdout.setEncoding("utf8");
		this.__instance.stdout.on("data", logger.debug.bind(logger));
		this.__instance.stderr.setEncoding("utf8");
		this.__instance.stderr.on("data", logger.debug.bind(logger));
		this.__instance.on("error", logger.error.bind(logger));

		// if port isn't specified, listen for it when pact runs
		const catchPort = (data) => {
			const match = data.match(/port=([0-9]+)/);
			if (match && match[1]) {
				this.options.port = parseInt(match[1], 10);
				this.__instance.stdout.removeListener("data", catchPort.bind(this));
				this.__instance.stderr.removeListener("data", catchPort.bind(this));
				logger.info(`Pact running on port ${this.options.port}`);
			}
		};

		if (!this.options.port) {
			this.__instance.stdout.on("data", catchPort.bind(this));
			this.__instance.stderr.on("data", catchPort.bind(this));
		}

		logger.info(`Creating Pact with PID: ${this.__instance.pid}`);

		this.__instance.once("close", (code) => {
			if (code !== 0) {
				logger.warn(`Pact exited with code ${code}.`);
			}
			return this.stop();
		});

		// check service is available
		return this.__waitForServerUp()
			.timeout(PROCESS_TIMEOUT, `Couldn't start Pact with PID: ${this.__instance.pid}`)
			.then(() => {
				this.__running = true;
				this.emit(Server.Events.START_EVENT, this);
				return this;
			});
	}

	// Stop the server instance, no more mocking
	public stop(): q.Promise<Server> {
		let pid = -1;
		if (this.__instance) {
			pid = this.__instance.pid;
			logger.info(`Removing Pact with PID: ${pid}`);
			this.__instance.removeAllListeners();
			// Killing instance, since windows can't send signals, must kill process forcefully
			try {
				if (isWindows) {
					cp.execSync(`taskkill /f /t /pid ${pid}`);
				} else {
					process.kill(-pid, "SIGINT");
				}
			} catch (e) {

			}

			this.__instance = undefined;
		}

		return this.__waitForServerDown()
			.timeout(PROCESS_TIMEOUT, `Couldn't stop Pact with PID '${pid}'`)
			.then(() => {
				this.__running = false;
				this.emit(Server.Events.STOP_EVENT, this);
				return this;
			});
	}

	// Delete this server instance and emit an event
	public delete(): q.Promise<Server> {
		return this.stop().tap(() => this.emit(Server.Events.DELETE_EVENT, this));
	}

	// Wait for pact-mock-service to be initialized and ready
	private __waitForServerUp(): q.Promise<any> {
		let amount = 0;
		const deferred = q.defer();

		const retry = () => {
			if (amount >= RETRY_AMOUNT) {
				deferred.reject(new Error("Pact startup failed; tried calling service 10 times with no result."));
			}
			setTimeout(check.bind(this), CHECKTIME);
		};

		const check = () => {
			amount++;
			if (this.options.port) {
				this.__call(this.options).then(() => deferred.resolve(), retry.bind(this));
			} else {
				retry();
			}
		};

		check(); // Check first time, start polling
		return deferred.promise;
	}

	private __waitForServerDown(): q.Promise<any> {
		let amount = 0;
		const deferred = q.defer();

		const check = () => {
			amount++;
			if (this.options.port) {
				this.__call(this.options).then(() => {
					if (amount >= RETRY_AMOUNT) {
						deferred.reject(new Error("Pact stop failed; tried calling service 10 times with no result."));
						return;
					}
					setTimeout(check, CHECKTIME);
				}, () => deferred.resolve());
			} else {
				deferred.resolve();
			}
		};

		check(); // Check first time, start polling
		return deferred.promise;
	}

	private __call(options: ServerOptions): q.Promise<any> {
		const deferred = q.defer();
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

		http(config, (err, res) => (!err && res.statusCode === 200) ? deferred.resolve() : deferred.reject(`HTTP Error: '${err ? err.message : ""}'`));

		return deferred.promise;
	}
}

// Creates a new instance of the pact server with the specified option
export default Server.create;

export interface ServerOptions {
	port?: number;
	ssl?: boolean;
	cors?: boolean;
	dir?: string;
	host?: string;
	sslcert?: string;
	sslkey?: string;
	log?: string;
	spec?: number;
	consumer?: string;
	provider?: string;
	monkeypatch?: string;
}
