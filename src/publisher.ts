import q = require("q");
import logger from "./logger";
import pactUtil, {DEFAULT_ARG, SpawnArguments} from "./pact-util";
import pactStandalone from "../standalone/pact-standalone";
const checkTypes = require("check-types");

export class Publisher {

	public static create(options: PublisherOptions): Publisher {
		options = options || {};
		// Setting defaults
		options.tags = options.tags || [];
		options.timeout = options.timeout || 60000;

		checkTypes.assert.nonEmptyString(options.pactBroker, "Must provide the pactBroker argument");
		checkTypes.assert.nonEmptyString(options.consumerVersion, "Must provide the consumerVersion argument");
		checkTypes.assert.arrayLike(options.pactFilesOrDirs, "Must provide the pactFilesOrDirs argument");
		checkTypes.assert.nonEmptyArray(options.pactFilesOrDirs, "Must provide the pactFilesOrDirs argument with an array");

		if (options.pactFilesOrDirs) {
			checkTypes.assert.array.of.string(options.pactFilesOrDirs);
		}

		if (options.pactBroker) {
			checkTypes.assert.string(options.pactBroker);
		}

		if (options.pactBrokerUsername) {
			checkTypes.assert.string(options.pactBrokerUsername);
		}

		if (options.pactBrokerPassword) {
			checkTypes.assert.string(options.pactBrokerPassword);
		}

		if ((options.pactBrokerUsername && !options.pactBrokerPassword) || (options.pactBrokerPassword && !options.pactBrokerUsername)) {
			throw new Error("Must provide both Pact Broker username and password. None needed if authentication on Broker is disabled.");
		}

		return new Publisher(options);
	}

	public readonly options: PublisherOptions;
	private readonly __argMapping = {
		"pactFilesOrDirs": DEFAULT_ARG,
		"pactBroker": "--broker-base-url",
		"pactBrokerUsername": "--broker-username",
		"pactBrokerPassword": "--broker-password",
		"tags": "--tag",
		"consumerVersion": "--consumer-app-version",
		"verbose": "--verbose"
	};

	constructor(options: PublisherOptions) {
		this.options = options;
	}

	public publish(): q.Promise<string[]> {
		logger.info(`Publishing pacts to broker at: ${this.options.pactBroker}`);
		const deferred = q.defer<string[]>();
		const instance = pactUtil.spawnBinary(`${pactStandalone.brokerPath} publish`, this.options, this.__argMapping);
		const output: any[] = [];
		instance.stdout.on("data", (l) => output.push(l));
		instance.stderr.on("data", (l) => output.push(l));
		instance.once("close", (code) => {
			const o = output.join("\n");
			const pactUrls = /^https?:\/\/.*\/pacts\/.*$/igm.exec(o);
			if (code !== 0 || !pactUrls) {
				logger.error(`Could not publish pact:\n${o}`);
				return deferred.reject(new Error(o));
			}

			logger.info(o);
			return deferred.resolve(pactUrls);
		});

		return deferred.promise
			.timeout(this.options.timeout as number, `Timeout waiting for verification process to complete (PID: ${instance.pid})`);
	}
}

export default Publisher.create;

export interface PublisherOptions extends SpawnArguments {
	pactFilesOrDirs: string[];
	pactBroker: string;
	consumerVersion: string;
	pactBrokerUsername?: string;
	pactBrokerPassword?: string;
	tags?: string[];
	verbose?: boolean;
	timeout?: number;
}
