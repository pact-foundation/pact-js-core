import path = require("path");
import url = require("url");
import brokerFactory, {BrokerOptions} from "./broker";
import logger from "./logger";
import pactUtil, {DEFAULT_ARG, SpawnArguments} from "./pact-util";
import q = require("q");
import pactStandalone from "./pact-standalone";
const _ = require("underscore");
const checkTypes = require("check-types");
const unixify = require("unixify");

import fs = require("fs");
import {deprecate} from "util";

export class Verifier {
	public static create = deprecate(
		(options: VerifierOptions) => new Verifier(options),
		"Create function will be removed in future release, please use the default export function or use `new Verifier()`");

	public readonly options: VerifierOptions;
	private readonly __argMapping = {
		"pactUrls": DEFAULT_ARG,
		"providerBaseUrl": "--provider-base-url",
		"providerStatesSetupUrl": "--provider-states-setup-url",
		"pactBrokerUsername": "--broker-username",
		"pactBrokerPassword": "--broker-password",
		"publishVerificationResult": "--publish-verification-results",
		"providerVersion": "--provider-app-version",
		"customProviderHeaders": "--custom-provider-header",
		"format": "--format",
		"out": "--out",
	};

	constructor(options: VerifierOptions) {
		options = options || {};
		options.pactBrokerUrl = options.pactBrokerUrl || "";
		options.tags = options.tags || [];
		options.pactUrls = options.pactUrls || [];
		options.provider = options.provider || "";
		options.providerStatesSetupUrl = options.providerStatesSetupUrl || "";
		options.timeout = options.timeout || 30000;

		options.pactUrls = _.chain(options.pactUrls)
			.map((uri: string) => {
				// only check local files
				if (!/https?:/.test(url.parse(uri).protocol || "")) { // If it's not a URL, check if file is available
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

		if (options.format) {
			checkTypes.assert.string(options.format);
			checkTypes.assert.match(options.format, /^(xml|json)$/i);
			options.format = options.format.toLowerCase() === "xml" ? "RspecJunitFormatter" : "json";
		}

		if (options.out) {
			checkTypes.assert.string(options.out);
		}

		checkTypes.assert.positive(options.timeout);

		if (options.monkeypatch) {
			checkTypes.assert.string(options.monkeypatch);
			try {
				fs.statSync(path.normalize(options.monkeypatch)).isFile();
			} catch (e) {
				throw new Error(`Monkeypatch ruby file not found at path: ${options.monkeypatch}`);
			}
		}

		this.options = options;
	}

	public verify(): q.Promise<string> {
		logger.info("Verifying Pact Files");
		return q(this.options.pactUrls)
			// TODO: fix this promise type issue by using regular old es6 promises, remove Q
			.then((uris): any => {
				if (!uris || uris.length === 0) {
					return brokerFactory({
						brokerUrl: this.options.pactBrokerUrl,
						provider: this.options.provider,
						username: this.options.pactBrokerUsername,
						password: this.options.pactBrokerPassword,
						tags: this.options.tags
					} as BrokerOptions).findConsumers();
				}
				return uris;
			})
			.then((data: string[]): PromiseLike<string> => {
				const deferred = q.defer<string>();
				this.options.pactUrls = data;
				const instance = pactUtil.spawnBinary(pactStandalone.verifierRelativePath, this.options, this.__argMapping);
				const output: any[] = [];
				instance.stdout.on("data", (l) => output.push(l));
				instance.stderr.on("data", (l) => output.push(l));
				instance.once("close", (code) => {
					const o = output.join("\n");
					code === 0 ? deferred.resolve(o) : deferred.reject(new Error(o));
				});

				return deferred.promise
					.timeout(this.options.timeout as number, `Timeout waiting for verification process to complete (PID: ${instance.pid})`)
					.tap(() => logger.info("Pact Verification succeeded.")) as PromiseLike<string>;
			});
	}
}

// Creates a new instance of the pact server with the specified option
export default (options: VerifierOptions) => new Verifier(options);

export interface VerifierOptions extends SpawnArguments {
	providerBaseUrl: string;
	provider?: string;
	pactUrls?: string[];
	providerStatesSetupUrl?: string;
	pactBrokerUsername?: string;
	pactBrokerPassword?: string;
	customProviderHeaders?: string[];
	publishVerificationResult?: boolean;
	providerVersion?: string;
	pactBrokerUrl?: string;
	tags?: string[];
	timeout?: number;
	monkeypatch?: string;
	format?: "json" | "RspecJunitFormatter";
	out?: string;
}
