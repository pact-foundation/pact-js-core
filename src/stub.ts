// tslint:disable:no-string-literal

import path = require("path");
import fs = require("fs");
import events = require("events");
import http = require("request");
import q = require("q");
import logger from "./logger";
import pactUtil, {DEFAULT_ARG, SpawnArguments} from "./pact-util";
import {ChildProcess} from "child_process";
const mkdirp = require("mkdirp");
const pact = require("@pact-foundation/pact-standalone");
const checkTypes = require("check-types");

const CHECKTIME = 500;
const RETRY_AMOUNT = 60;
const PROCESS_TIMEOUT = 30000;

export class Stub extends events.EventEmitter {
	public static get Events() {
		return {
			START_EVENT: "start",
			STOP_EVENT: "stop",
			DELETE_EVENT: "delete"
		};
	}

	public static create(options: StubOptions = {}): Stub {
		// defaults
		options.pactUrls = options.pactUrls || [];
		options.ssl = options.ssl || false;
		options.cors = options.cors || false;
		options.host = options.host || "localhost";

		if (options.pactUrls) {
			checkTypes.assert.array.of.string(options.pactUrls);
		}

		checkTypes.assert.not.emptyArray(options.pactUrls, "Must provide the pactUrls argument");

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

		// If both sslcert and sslkey option has been specified, let's assume the user wants to enable ssl
		if (options.sslcert && options.sslkey) {
			options.ssl = true;
		}

		// cors check
		checkTypes.assert.boolean(options.cors);

		// log check
		if (options.log) {
			const fileObj = path.parse(path.normalize(options.log));
			try {
				fs.statSync(fileObj.dir).isDirectory();
			} catch (e) {
				// If log path doesn't exist, create it
				mkdirp.sync(fileObj.dir);
			}
		}

		// host check
		if (options.host) {
			checkTypes.assert.string(options.host);
		}

		return new Stub(options);
	}

	public readonly options: StubOptions;
	private __running: boolean;
	private __instance: ChildProcess;
	private readonly __argMapping = {
		"pactUrls": DEFAULT_ARG,
		"port": "--port",
		"host": "--host",
		"log": "--log",
		"ssl": "--ssl",
		"sslcert": "--sslcert",
		"sslkey": "--sslkey",
		"cors": "--cors",
	};

	constructor(options: StubOptions) {
		super();
		this.options = options;
		this.__running = false;
	}

	// Let the stubbing begin!
	public start(): q.Promise<Stub> {
		if (this.__instance && this.__instance.connected) {
			logger.warn(`You already have a process running with PID: ${this.__instance.pid}`);
			return q.resolve(this);
		}
		this.__instance = pactUtil.spawnBinary(`${pact.stubPath} service`, this.options, this.__argMapping);
		this.__instance.once("close", () => this.stop());

		if (!this.options.port) {
			// if port isn't specified, listen for it when pact runs
			const catchPort = (data: any) => {
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
		return this.__waitForStubUp()
			.timeout(PROCESS_TIMEOUT, `Couldn't start Pact with PID: ${this.__instance.pid}`)
			.then(() => {
				this.__running = true;
				this.emit(Stub.Events.START_EVENT, this);
				return this;
			});
	}

	// Stop the stub instance
	public stop(): q.Promise<Stub> {
		const pid = this.__instance ? this.__instance.pid : -1;
		return q(pactUtil.killBinary(this.__instance))
			.then(() => this.__waitForStubDown())
			.timeout(PROCESS_TIMEOUT, `Couldn't stop Pact with PID '${pid}'`)
			.then(() => {
				this.__running = false;
				this.emit(Stub.Events.STOP_EVENT, this);
				return this;
			});
	}

	// Deletes this stub instance and emit an event
	public delete(): q.Promise<Stub> {
		return this.stop().tap(() => this.emit(Stub.Events.DELETE_EVENT, this));
	}

	// Wait for pact-stub-service to be initialized and ready
	private __waitForStubUp(): q.Promise<any> {
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

	private __waitForStubDown(): q.Promise<any> {
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

	private __call(options: StubOptions): q.Promise<any> {
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

		http(config, (err: any, res: any) => (!err && res.statusCode === 200) ? deferred.resolve() : deferred.reject(`HTTP Error: '${JSON.stringify(err ? err : res)}'`));

		return deferred.promise;
	}
}

// Creates a new instance of the pact stub with the specified option
export default Stub.create;

export interface StubOptions extends SpawnArguments {
	pactUrls?: string[];
	port?: number;
	ssl?: boolean;
	cors?: boolean;
	host?: string;
	sslcert?: string;
	sslkey?: string;
	log?: string;
}
