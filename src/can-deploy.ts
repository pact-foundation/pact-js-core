import q = require("q");
import logger from "./logger";
import pactUtil, {SpawnArguments} from "./pact-util";
import pactStandalone from "./pact-standalone";

const _ = require("underscore");
const checkTypes = require("check-types");

export class CanDeploy {

	public static convertForSpawnBinary(options: CanDeployOptions) {
		return _.flatten(
			_.zip.apply(_,
				_.compact([
					_.map(options.pacticipant, (x: string) => ({pacticipant: x})),
					_.map(options.pacticipantVersion, (x: string) => ({pacticipantVersion: x})),
					_.map(options.latest, (x: string) => ({latest: x})),
					_.map(options.to, (x: string) => ({to: x}))
				])
			)
		)
			.concat([_.omit(options, "pacticipant", "pacticipantVersion", "latest", "to")]);
	}

	public readonly options: CanDeployOptions;
	private readonly __argMapping = {
		"pacticipant": "--pacticipant",
		"pacticipantVersion": "--version",
		"latest": "--latest",
		"to": "--to",
		"pactBroker": "--broker-base-url",
		"pactBrokerUsername": "--broker-username",
		"pactBrokerPassword": "--broker-password",
		"output": "--output",
		"verbose": "--verbose",
		"retryWhileUnknown": "--retry-while-unknown",
		"retryInterval": "--retry-interval",
	};

	constructor(options: CanDeployOptions) {
		options = options || {};
		// Setting defaults
		options.timeout = options.timeout || 60000;
		options.pacticipant = options.pacticipant || options.participant || [];
		options.pacticipantVersion = options.pacticipantVersion || options.participantVersion || [];
		options.latest = options.latest || [];
		options.to = options.to || [];

		checkTypes.assert.nonEmptyString(options.pactBroker, "Must provide the pactBroker argument");
		checkTypes.assert.arrayLike(options.pacticipant, "Must provide the pacticipant argument");
		checkTypes.assert.arrayLike(options.pacticipantVersion, "Must provide the pacticipant version argument");
		checkTypes.assert.nonEmptyArray(options.pacticipant, "Pacticipant array must not be empty");
		checkTypes.assert.equal(options.pacticipant.length, options.pacticipantVersion.length + options.latest.length,
			"Must provide the same number of pacticipant and version");

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

		this.options = options;
	}

	public canDeploy(): q.Promise<string[]> {
		logger.info(`Asking broker at ${this.options.pactBroker} if it is possible to deploy`);
		const deferred = q.defer<string[]>();
		const instance = pactUtil.spawnBinary(`${pactStandalone.brokerPath} can-i-deploy`, CanDeploy.convertForSpawnBinary(this.options), this.__argMapping);
		const output: any[] = [];
		instance.stdout.on("data", (l) => output.push(l));
		instance.stderr.on("data", (l) => output.push(l));
		instance.once("close", (code) => {
			const o = output.join("\n");
			const success = /All verification results are published and successful/igm.exec(o);
			if (code !== 0 || !success) {
				logger.error(`can-i-deploy did not return success message:\n${o}`);
				return deferred.reject(new Error(o));
			}

			logger.info(o);
			return deferred.resolve();
		});

		return deferred.promise
			.timeout(this.options.timeout as number, `Timeout waiting for verification process to complete (PID: ${instance.pid})`);
	}
}

export default (options: CanDeployOptions) => new CanDeploy(options);

export interface CanDeployOptions extends SpawnArguments {
	pacticipant?: string[];
	participant?: string[];
	pacticipantVersion?: string[];
	participantVersion?: string[];
	pactBroker: string;
	pactBrokerUsername?: string;
	pactBrokerPassword?: string;
	tags?: string[];
	output?: "json" | "table";
	verbose?: boolean;
	retryWhileUnknown?: number;
	retryInterval?: number;
	to?: string[];
	latest?: string[];
}
