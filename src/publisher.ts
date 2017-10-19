import checkTypes = require("check-types");
import q = require("q");
import logger from "./logger";
import pactStandalone = require("@pact-foundation/pact-standalone");
import pactUtil, {DEFAULT_ARG, SpawnArguments} from "./pact-util";

export class Publisher {

	public static create(options: PublisherOptions): Publisher {
		options = options || {};
		// Setting defaults
		options.pactBroker = options.pactBroker || "";
		options.pactUrls = options.pactUrls || [];
		options.tags = options.tags || [];
		options.timeout = options.timeout || 60000;

		if (options.pactUrls) {
			checkTypes.assert.array.of.string(options.pactUrls);
		}

		checkTypes.assert.nonEmptyString(options.pactBroker, "Must provide the pactBroker argument");
		checkTypes.assert.nonEmptyString(options.consumerVersion, "Must provide the consumerVersion argument");
		checkTypes.assert.not.emptyArray(options.pactUrls, "Must provide the pactUrls argument");

		if (options.pactBrokerUsername) {
			checkTypes.assert.string(options.pactBrokerUsername);
		}

		if (options.pactBrokerPassword) {
			checkTypes.assert.string(options.pactBrokerPassword);
		}

		if ((options.pactBrokerUsername && !options.pactBrokerPassword) || (options.pactBrokerPassword && !options.pactBrokerUsername)) {
			throw new Error("Must provide both Pact Broker username and password. None needed if authentication on Broker is disabled.");
		}

		if (options.pactBroker) {
			checkTypes.assert.string(options.pactBroker);
		}

		return new Publisher(options);
	}

	public readonly options: PublisherOptions;
	private readonly __argMapping = {
		"pactUrls": DEFAULT_ARG,
		"pactBroker": "--broker-base-url",
		"pactBrokerUsername": "--broker-username",
		"pactBrokerPassword": "--broker-password",
		"tags": "--tag",
		"consumerVersion": "--consumer-app-version",
		"verbose": "--verbose"
	};

	constructor(options: PublisherOptions = {}) {
		this.options = options;
	}

	public publish(): q.Promise<string> {
		logger.info(`Publishing pacts to broker at: ${this.options.pactBroker}`);
		const deferred = q.defer<string>();
		const instance = pactUtil.spawnBinary(pactStandalone.publisherPath, this.options, this.__argMapping);
		const output = [];
		instance.stdout.on("data", (l) => output.push(l));
		instance.stderr.on("data", (l) => output.push(l));
		instance.once("close", (code) => {
			const o = output.join("\n");
			code === 0 ? deferred.resolve(o) : deferred.reject(new Error(o));
		});

		return deferred.promise
			.timeout(this.options.timeout, `Timeout waiting for verification process to complete (PID: ${instance.pid})`)
			.tap(() => logger.info("Pact Verification succeeded."));
	}
}

export default Publisher.create;

export interface PublisherOptions extends SpawnArguments {
	pactUrls?: string[];
	pactBroker?: string;
	consumerVersion?: string;
	pactBrokerUsername?: string;
	pactBrokerPassword?: string;
	tags?: string[];
	verbose?: boolean;
	timeout?: number;
}

export interface PublishData {
	consumer: { name: string };
	provider: { name: string };
}
