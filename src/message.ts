import fs = require("fs");
import q = require("q");
import logger from "./logger";
import pactUtil, {DEFAULT_ARG, SpawnArguments} from "./pact-util";
import pactStandalone from "./pact-standalone";
import path = require("path");
const mkdirp = require("mkdirp");
const checkTypes = require("check-types");

export class Message {
	public readonly options: MessageOptions;
	private readonly __argMapping = {
		"content": DEFAULT_ARG,
		"pactFileWriteMode": DEFAULT_ARG,
		"dir": "--pact_dir",
		"consumer": "--consumer",
		"provider": "--provider",
	};

	constructor(options: MessageOptions) {
		options = options || {};
		options.pactFileWriteMode = options.pactFileWriteMode || "update";

		checkTypes.assert.nonEmptyString(options.consumer, "Must provide the consumer name");
		checkTypes.assert.nonEmptyString(options.provider, "Must provide the provider name");
		checkTypes.assert.nonEmptyString(options.content, "Must provide message content");
		checkTypes.assert.nonEmptyString(options.dir, "Must provide pact output dir");

		if (options.dir) {
			try {
				fs.statSync(path.normalize(options.dir)).isDirectory();
			} catch (e) {
				mkdirp.sync(path.normalize(options.dir));
			}
		}

		if (options.content) {
			try {
				JSON.parse(options.content);
			} catch (e) {
				throw new Error("Unable to parse message content to JSON, invalid json supplied");
			}
		}

		if (options.consumer) {
			checkTypes.assert.string(options.consumer);
		}

		if (options.provider) {
			checkTypes.assert.string(options.provider);
		}

		checkTypes.assert.includes(["overwrite", "update", "merge"], options.pactFileWriteMode);

		if ((options.pactBrokerUsername && !options.pactBrokerPassword) || (options.pactBrokerPassword && !options.pactBrokerUsername)) {
			throw new Error("Must provide both Pact Broker username and password. None needed if authentication on Broker is disabled.");
		}

		this.options = options;
	}

	public createMessage(): q.Promise<any> {
		logger.info(`Creating message pact`);
		const deferred = q.defer<any>();
		const instance = pactUtil.spawnBinary(`${pactStandalone.messagePath}`, this.options, this.__argMapping);
		const output: any[] = [];
		instance.stdout.on("data", (l) => output.push(l));
		instance.stderr.on("data", (l) => output.push(l));
		instance.once("close", (code) => {
			const o = output.join("\n");
			logger.info(o);

			if (code === 0) {
				return deferred.resolve(o);
			} else {
				return deferred.reject(o);
			}

		});

		return deferred.promise;
	}
}

export default (options: MessageOptions) => new Message(options);

export interface MessageOptions extends SpawnArguments {
	content?: string;
	dir?: string;
	consumer?: string;
	provider?: string;
	pactFileWriteMode?: "overwrite" | "update" | "merge";
}
