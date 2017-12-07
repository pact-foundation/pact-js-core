// tslint:disable:no-string-literal
import pactUtil, { DEFAULT_ARG, SpawnArguments } from "./pact-util";
import { AbstractService } from "./service";
import { ChildProcess } from "child_process";
const pact = require("@pact-foundation/pact-standalone");
const checkTypes = require("check-types");

export class Stub extends AbstractService {
	public static create(options: StubOptions = {}): Stub {
		options.pactUrls = options.pactUrls || [];

		if (options.pactUrls) {
			checkTypes.assert.array.of.string(options.pactUrls);
		}

		checkTypes.assert.not.emptyArray(options.pactUrls, "Must provide the pactUrls argument");

		return new Stub(options);
	}

	public readonly options: StubOptions;
	protected readonly __argMapping = {
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
		super(options);
	}

	protected spawnBinary(): ChildProcess {
		return pactUtil.spawnBinary(`${pact.stubPath}`, this.options, this.__argMapping);
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
