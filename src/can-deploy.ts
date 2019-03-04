import q = require("q");
import logger from "./logger";
import pactUtil, {SpawnArguments} from "./pact-util";
import pactStandalone from "./pact-standalone";
import * as _ from "underscore";

const checkTypes = require("check-types");

export class CanDeploy {

	public static convertForSpawnBinary(options: CanDeployOptions):SpawnArguments[] {
		// This is the order that the arguments must be in, everything else is afterwards
		const keys = ["participant", "participantVersion", "latest", "to"];
		// Create copy of options, while omitting the arguments specified above
		const args:SpawnArguments[] = [_.omit(options, keys)];

		// Go backwards in the keys as we are going to unshift them into the array
		keys.reverse().forEach((key) => {
			const val = options[key];
			if(options[key] !== undefined) {
				const obj = {};
				obj[key] = val;
				args.unshift(obj);
			}
		});

		return args;
	}

	public readonly options: CanDeployOptions;
	private readonly __argMapping = {
		"participant": "--pacticipant",
		"participantVersion": "--version",
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

		checkTypes.assert.nonEmptyString(options.participant, "Must provide the participant argument");
		checkTypes.assert.nonEmptyString(options.participantVersion, "Must provide the participant version argument");
		checkTypes.assert.nonEmptyString(options.pactBroker, "Must provide the pactBroker argument");
		options.latest !== undefined && checkTypes.assert.nonEmptyString(options.latest.toString());
		options.to  !== undefined && checkTypes.assert.nonEmptyString(options.to);
		options.pactBrokerUsername !== undefined && checkTypes.assert.string(options.pactBrokerUsername);
		options.pactBrokerPassword !== undefined && checkTypes.assert.string(options.pactBrokerPassword);

		if ((options.pactBrokerUsername && !options.pactBrokerPassword) || (options.pactBrokerPassword && !options.pactBrokerUsername)) {
			throw new Error("Must provide both Pact Broker username and password. None needed if authentication on Broker is disabled.");
		}

		this.options = options;
	}

	public canDeploy(): q.Promise<any> {
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
	participant?: string;
	participantVersion?: string;
	to?: string;
	latest?: boolean | string;
	pactBroker: string;
	pactBrokerUsername?: string;
	pactBrokerPassword?: string;
	output?: "json" | "table";
	verbose?: boolean;
	retryWhileUnknown?: number;
	retryInterval?: number;
}
