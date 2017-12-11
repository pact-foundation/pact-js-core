// tslint:disable:no-string-literal
import { AbstractService } from "./service";

import path = require("path");
import fs = require("fs");
import pactUtil, {SpawnArguments} from "./pact-util";
import { ChildProcess } from "child_process";
const mkdirp = require("mkdirp");
const pact = require("@pact-foundation/pact-standalone");
const checkTypes = require("check-types");

const CHECKTIME = 500;
const RETRY_AMOUNT = 60;
const PROCESS_TIMEOUT = 30000;

export class Server extends AbstractService {
	public static create(options: ServerOptions = {}): Server {
		options.dir = options.dir ? path.resolve(options.dir) : process.cwd(); // Use directory relative to cwd
		options.pactFileWriteMode = options.pactFileWriteMode || "overwrite";

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

		// consumer name check
		if (options.consumer) {
			checkTypes.assert.string(options.consumer);
		}

		// provider name check
		if (options.provider) {
			checkTypes.assert.string(options.provider);
		}

		// pactFileWriteMode check
		checkTypes.assert.includes(["overwrite", "update", "merge"], options.pactFileWriteMode);

		return new Server(options);
	}

	public readonly options: ServerOptions;
	protected readonly __argMapping = {
		"port": "--port",
		"host": "--host",
		"log": "--log",
		"ssl": "--ssl",
		"sslcert": "--sslcert",
		"sslkey": "--sslkey",
		"cors": "--cors",
		"dir": "--pact_dir",
		"spec": "--pact_specification_version",
		"pactFileWriteMode": "--pact-file-write-mode",
		"consumer": "--consumer",
		"provider": "--provider"
	};

	constructor(options: ServerOptions) {
		super(options);
	}

	protected spawnBinary(): ChildProcess {
		return pactUtil.spawnBinary(`${pact.mockServicePath} service`, this.options, this.__argMapping);
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
	pactFileWriteMode?: "overwrite" | "update" | "merge";
}
