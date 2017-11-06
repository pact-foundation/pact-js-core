// tslint:disable:no-string-literal

import checkTypes = require("check-types");
import path = require("path");
import fs = require("fs");
import events = require("events");
import http = require("request");
import q = require("q");
import pact = require("@pact-foundation/pact-standalone");
import mkdirp = require("mkdirp");
import logger from "./logger";
import pactUtil, {SpawnArguments} from "./pact-util";
import {ChildProcess} from "child_process";

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

		return new Server(options);
	}

	public readonly options: ServerOptions;
	private __running: boolean;
	private __instance: ChildProcess;
	private readonly __argMapping = {
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
		"provider": "--provider"
	};

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
		this.__instance = pactUtil.spawnBinary(`${pact.mockServicePath} service`, this.options, this.__argMapping);
		this.__instance.once("close", () => this.stop());

		if (!this.options.port) {
			// if port isn't specified, listen for it when pact runs
			const catchPort = (data) => {
				const match = data.match(/port=([0-9]+)/);
				if (match && match[1]) {
					this.options.port = parseInt(match[1], 10);
					this.__instance.stdout.removeListener("data", catchPort);
					this.__instance.stderr.removeListener("data", catchPort);
					logger.info(`Pact running on port ${this.options.port}`);
				}
			};

			this.__instance.stdout.on("data", catchPort);
			this.__instance.stderr.on("data", catchPort);
		}

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
		const pid = this.__instance ? this.__instance.pid : -1;
		return q(pactUtil.killBinary(this.__instance))
			.then(() => this.__waitForServerDown(this.options))
			.timeout(PROCESS_TIMEOUT, `Couldn't stop Pact with PID '${pid}'`)
			.then(() => {
				this.__running = false;
				this.__instance = undefined;
				this.emit(Server.Events.STOP_EVENT, this);
				return this;
			});
	}

	// Deletes this server instance and emit an event
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

		http(config, (err, res) => (!err && res.statusCode === 200) ? deferred.resolve() : deferred.reject(`HTTP Error: '${err.message}'`));

		return deferred.promise;
	}
}

// Creates a new instance of the pact server with the specified option
export default Server.create;

export interface ServerOptions extends SpawnArguments {
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
}
