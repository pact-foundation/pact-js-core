import q = require("q");
import logger from "./logger";
import pactUtil, {SpawnArguments} from "./pact-util";
import {deprecate} from "util";
import pactStandalone from "./pact-standalone";
const _ = require("underscore");
const checkTypes = require("check-types");

export class CanDeploy {
	public static create = deprecate(
		(options: CanDeployOptions) => new CanDeploy(options),
		"Create function will be removed in future release, please use the default export function or use `new CanDeploy()`");

	public static convertForSpawnBinary(options: CanDeployOptions) {
			return _.flatten(_.zip(
				_.map(options.pacticipants, (x: string) => ({pacticipant: x})),
				_.map(options.versions, (x: string) => ({version: x}))
			)).concat(
				[_.omit(options,"pacticipants","versions")]);
	}

	public readonly options: CanDeployOptions;
	private readonly __argMapping = {
		"pacticipant": "--pacticipant",
		"version": "--version",
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
		options.pacticipants = options.pacticipants || [];
		options.versions = options.versions || [];

		checkTypes.assert.nonEmptyString(options.pactBroker, "Must provide the pactBroker argument");
		checkTypes.assert.arrayLike(options.pacticipants, "Must provide the pacticipants argument");
		checkTypes.assert.arrayLike(options.versions, "Must provide the versions argument");
		checkTypes.assert.equal(options.pacticipants.length, options.versions.length, "Must provide the same number of pacticipants and versions");
		checkTypes.assert.nonEmptyArray(options.pacticipants, "Pacticipants array must not be empty");
		checkTypes.assert.nonEmptyArray(options.versions, "Versions array must not be empty");

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
	pacticipants: string[];
	versions: string[];
	pactBroker: string;
	pactBrokerUsername?: string;
	pactBrokerPassword?: string;
	tags?: string[];
	verbose?: boolean;
	timeout?: number;
}
