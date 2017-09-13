// tslint:disable:no-string-literal

import checkTypes = require("check-types");
import _ = require("underscore");
import path = require("path");
import fs = require("fs");
import cp = require("child_process");
import q = require("q");
import unixify = require("unixify");
import url = require("url");
import verifierPath = require("@pact-foundation/pact-provider-verifier");
import Broker from "./broker";
import logger from "./logger";
import pactUtil from "./pact-util";
import {ChildProcess, SpawnOptions} from "child_process";

const isWindows = process.platform === "win32";

export class Verifier {
	public static create(options: VerifierOptions): Verifier {
		options.pactBrokerUrl = options.pactBrokerUrl || "";
		options.tags = options.tags || [];
		options.pactUrls = options.pactUrls || [];
		options.provider = options.provider || "";
		options.providerStatesSetupUrl = options.providerStatesSetupUrl || "";
		options.timeout = options.timeout || 30000;

		options.pactUrls = _.chain(options.pactUrls)
			.map((uri) => {
				// only check local files
				if (!/https?:/.test(url.parse(uri).protocol)) { // If it"s not a URL, check if file is available
					try {
						fs.statSync(path.normalize(uri)).isFile();

						// Unixify the paths. Pact in multiple places uses URI and matching and
						// hasn"t really taken Windows into account. This is much easier, albeit
						// might be a problem on non root-drives
						// options.pactUrls.push(uri);
						return unixify(uri);
					} catch (e) {
						throw new Error(`Pact file: ${uri} doesn"t exist`);
					}
				}
				// HTTP paths are OK
				return uri;
			})
			.compact()
			.value();

		checkTypes.assert.nonEmptyString(options.providerBaseUrl, "Must provide the providerBaseUrl argument");

		if (checkTypes.emptyArray(options.pactUrls) && !options.pactBrokerUrl) {
			throw new Error("Must provide the pactUrls argument if no brokerUrl provided");
		}

		if ((!options.pactBrokerUrl || _.isEmpty(options.provider)) && checkTypes.emptyArray(options.pactUrls)) {
			throw new Error("Must provide both provider and brokerUrl or if pactUrls not provided.");
		}

		if (options.providerStatesSetupUrl) {
			checkTypes.assert.string(options.providerStatesSetupUrl);
		}

		if (options.pactBrokerUsername) {
			checkTypes.assert.string(options.pactBrokerUsername);
		}

		if (options.pactBrokerPassword) {
			checkTypes.assert.string(options.pactBrokerPassword);
		}

		if (options.pactUrls) {
			checkTypes.assert.array.of.string(options.pactUrls);
		}

		if (options.tags) {
			checkTypes.assert.array.of.string(options.tags);
		}

		if (options.providerBaseUrl) {
			checkTypes.assert.string(options.providerBaseUrl);
		}

		if (options.publishVerificationResult) {
			checkTypes.assert.boolean(options.publishVerificationResult);
		}

		if (options.publishVerificationResult && !options.providerVersion) {
			throw new Error("Must provide both or none of publishVerificationResults and providerVersion.");
		}

		if (options.providerVersion) {
			checkTypes.assert.string(options.providerVersion);
		}

		checkTypes.assert.positive(options.timeout);

		return new Verifier(options);
	}

	private __options: VerifierOptions;
	private __instance: ChildProcess;

	constructor(options: VerifierOptions) {
		this.__options = options;
	}

	public verify(): q.Promise<string> {
		logger.info("Verifier verify()");
		let retrievePactsPromise;

		if (this.__options.pactUrls.length > 0) {
			retrievePactsPromise = q(this.__options.pactUrls);
		} else {
			// If no pactUrls provided, we must fetch them from the broker!
			retrievePactsPromise = new Broker({
				brokerUrl: this.__options.pactBrokerUrl,
				provider: this.__options.provider,
				username: this.__options.pactBrokerUsername,
				password: this.__options.pactBrokerPassword,
				tags: this.__options.tags
			}).findConsumers();
		}

		return retrievePactsPromise.then((data) => {
			this.__options.pactUrls = data;

			const deferred = q.defer();
			let output = ""; // Store output here in case of error
			function outputHandler(log) {
				logger.info(log);
				output += log;
			}

			const envVars = JSON.parse(JSON.stringify(process.env)); // Create copy of environment variables
			// Remove environment variable if there
			// This is a hack to prevent some weird Travelling Ruby behaviour with Gems
			// https://github.com/pact-foundation/pact-mock-service-npm/issues/16
			delete envVars["RUBYGEMS_GEMDEPS"];

			let file: string;
			let opts: SpawnOptions = {
				cwd: verifierPath.cwd,
				detached: !isWindows,
				env: envVars
			};
			let args: string[] = pactUtil.createArguments(this.__options, {
				"providerBaseUrl": "--provider-base-url",
				"pactUrls": "--pact-urls",
				"providerStatesSetupUrl": "--provider-states-setup-url",
				"pactBrokerUsername": "--broker-username",
				"pactBrokerPassword": "--broker-password",
				"publishVerificationResult": "--publish-verification-results",
				"providerVersion": "--provider-app-version"
			});

			let cmd = [verifierPath.file].concat(args).join(" ");

			if (isWindows) {
				file = "cmd.exe";
				args = ["/s", "/c", cmd];
				(opts as any).windowsVerbatimArguments = true;
			} else {
				cmd = `./${cmd}`;
				file = "/bin/sh";
				args = ["-c", cmd];
			}

			this.__instance = cp.spawn(file, args, opts);

			this.__instance.stdout.setEncoding("utf8");
			this.__instance.stdout.on("data", outputHandler);
			this.__instance.stderr.setEncoding("utf8");
			this.__instance.stderr.on("data", outputHandler);
			this.__instance.on("error", logger.error.bind(logger));

			this.__instance.once("close", (code) => code === 0 ? deferred.resolve(output) : deferred.reject(new Error(output)));

			logger.info(`Created Pact Verifier process with PID: ${this.__instance.pid}`);
			return deferred.promise.timeout(this.__options.timeout, `Timeout waiting for verification process to complete (PID: ${this.__instance.pid})`)
				.tap(() => logger.info("Pact Verification succeeded."));
		});
	}
}

// Creates a new instance of the pact server with the specified option
export default Verifier.create;

export interface VerifierOptions {
	providerBaseUrl: string;
	provider?: string;
	pactUrls?: string[];
	providerStatesSetupUrl?: string;
	pactBrokerUsername?: string;
	pactBrokerPassword?: string;
	publishVerificationResult?: boolean;
	providerVersion?: string;
	pactBrokerUrl?: string;
	tags?: string[];
	timeout?: number;
}
