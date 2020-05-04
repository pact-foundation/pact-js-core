import path = require('path');
import url = require('url');
import logger from './logger';
import spawn from './spawn';
import { DEFAULT_ARG } from './spawn';
import q = require('q');
import pactStandalone from './pact-standalone';
import _ = require('underscore');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const checkTypes = require('check-types');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const unixify = require('unixify');

import fs = require('fs');
import { deprecate } from 'util';

export class Verifier {
	public static create = deprecate(
		(options: VerifierOptions) => new Verifier(options),
		'Create function will be removed in future release, please use the default export function or use `new Verifier()`',
	);

	public readonly options: VerifierOptions;
	private readonly __argMapping = {
		pactUrls: DEFAULT_ARG,
		providerBaseUrl: '--provider-base-url',
		pactBrokerUrl: '--pact-broker-base-url',
		providerStatesSetupUrl: '--provider-states-setup-url',
		pactBrokerUsername: '--broker-username',
		pactBrokerPassword: '--broker-password',
		pactBrokerToken: '--broker-token',
		consumerVersionTag: '--consumer-version-tag',
		providerVersionTag: '--provider-version-tag',
		consumerVersionTags: '--consumer-version-tag',
		providerVersionTags: '--provider-version-tag',
		consumerVersionSelectors: '--consumer-version-selector',
		publishVerificationResult: '--publish-verification-results',
		providerVersion: '--provider-app-version',
		provider: '--provider',
		enablePending: '--enable-pending',
		customProviderHeaders: '--custom-provider-header',
		verbose: '--verbose',
		includeWipPactsSince: '--include-wip-pacts-since',
		monkeypatch: '--monkeypatch',
		format: '--format',
		out: '--out',
	};

	constructor(options: VerifierOptions) {
		options = options || {};
		options.pactBrokerUrl = options.pactBrokerUrl || '';
		options.pactUrls = options.pactUrls || [];
		options.provider = options.provider || '';
		options.providerStatesSetupUrl = options.providerStatesSetupUrl || '';
		options.timeout = options.timeout || 30000;
		options.consumerVersionTag = options.consumerVersionTag || [];
		options.providerVersionTag = options.providerVersionTag || [];
		options.consumerVersionTags = options.consumerVersionTags || [];
		options.providerVersionTags = options.providerVersionTags || [];
		options.consumerVersionSelectors = options.consumerVersionSelectors || [];

		if (
			!_.isEmpty(options.consumerVersionTag) &&
			!_.isEmpty(options.consumerVersionTags)
		) {
			throw new Error(
				"Must not use both 'consumerVersionTags' and 'consumerVersionTag'. Please use 'consumerVersionTags' instead",
			);
		}

		if (
			!_.isEmpty(options.providerVersionTag) &&
			!_.isEmpty(options.providerVersionTags)
		) {
			throw new Error(
				"Must not use both 'providerVersionTags' and 'providerVersionTag'. Please use 'providerVersionTags' instead",
			);
		}

		if (
			options.consumerVersionTags &&
			checkTypes.string(options.consumerVersionTags)
		) {
			options.consumerVersionTags = [options.consumerVersionTags as string];
		}
		checkTypes.assert.array.of.string(options.consumerVersionTags);

		if (
			options.providerVersionTags &&
			checkTypes.string(options.providerVersionTags)
		) {
			options.providerVersionTags = [options.providerVersionTags as string];
		}
		checkTypes.assert.array.of.string(options.providerVersionTags);

		if (
			options.consumerVersionTag &&
			checkTypes.string(options.consumerVersionTag)
		) {
			options.consumerVersionTag = [options.consumerVersionTag as string];
		}
		checkTypes.assert.array.of.string(options.consumerVersionTag);

		if (
			options.providerVersionTag &&
			checkTypes.string(options.providerVersionTag)
		) {
			options.providerVersionTag = [options.providerVersionTag as string];
		}
		checkTypes.assert.array.of.string(options.providerVersionTag);

		if (
			!_.isEmpty(options.consumerVersionTag) ||
			!_.isEmpty(options.providerVersionTag)
		) {
			logger.warn(
				"'consumerVersionTag' and 'providerVersionTag' have been deprecated, please use 'consumerVersionTags' or 'providerVersionTags' instead",
			);
		}

		if (options.includeWipPactsSince !== undefined) {
			checkTypes.assert.nonEmptyString(options.includeWipPactsSince);
		}

		options.pactUrls = _.chain(options.pactUrls)
			.map((uri: string) => {
				// only check local files
				if (!/https?:/.test(url.parse(uri).protocol || '')) {
					// If it's not a URL, check if file is available
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

		checkTypes.assert.nonEmptyString(options.providerBaseUrl);

		if (
			checkTypes.emptyArray(options.pactUrls as string[]) &&
			!options.pactBrokerUrl
		) {
			throw new Error(
				'Must provide the pactUrls argument if no pactBrokerUrl provided',
			);
		}

		if (
			(!options.pactBrokerUrl || _.isEmpty(options.provider)) &&
			checkTypes.emptyArray(options.pactUrls as string[])
		) {
			throw new Error(
				'Must provide both provider and pactBrokerUrl if pactUrls not provided.',
			);
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

		if (
			options.pactBrokerToken &&
			(options.pactBrokerUsername || options.pactBrokerPassword)
		) {
			throw new Error(
				'Must provide pactBrokerToken or pactBrokerUsername/pactBrokerPassword but not both.',
			);
		}

		if (options.pactBrokerUrl) {
			checkTypes.assert.string(options.pactBrokerUrl);
		}

		if (options.pactUrls) {
			checkTypes.assert.array.of.string(options.pactUrls);
		}

		if (options.providerBaseUrl) {
			checkTypes.assert.string(options.providerBaseUrl);
		}

		if (options.publishVerificationResult) {
			checkTypes.assert.boolean(options.publishVerificationResult);
		}

		if (options.publishVerificationResult && !options.providerVersion) {
			throw new Error(
				'Must provide both or none of publishVerificationResults and providerVersion.',
			);
		}

		if (options.providerVersion) {
			checkTypes.assert.string(options.providerVersion);
		}

		if (options.format) {
			checkTypes.assert.string(options.format);
			if (options.format.toLowerCase() === 'xml') {
				options.format = 'RspecJunitFormatter';
			}
		}

		if (options.out) {
			checkTypes.assert.string(options.out);
		}

		if (options.enablePending !== undefined) {
			checkTypes.assert.boolean(options.enablePending);
		}

		if (options.tags) {
			logger.warn(
				"'tags' has been deprecated as at v8.0.0, please use 'consumerVersionTags' instead",
			);
		}

		checkTypes.assert.positive(options.timeout as number);

		if (options.monkeypatch) {
			checkTypes.assert.string(options.monkeypatch);
			try {
				fs.statSync(path.normalize(options.monkeypatch)).isFile();
			} catch (e) {
				throw new Error(
					`Monkeypatch ruby file not found at path: ${options.monkeypatch}`,
				);
			}
		}

		this.options = options;
	}

	public verify(): q.Promise<string> {
		logger.info('Verifying Pact Files');
		const deferred = q.defer<string>();
		const instance = spawn.spawnBinary(
			pactStandalone.verifierPath,
			this.options,
			this.__argMapping,
		);
		const output: Array<string | Buffer> = [];
		instance.stdout.on('data', l => output.push(l));
		instance.stderr.on('data', l => output.push(l));
		instance.once('close', code => {
			const o = output.join('\n');
			code === 0 ? deferred.resolve(o) : deferred.reject(new Error(o));
		});

		return deferred.promise
			.timeout(
				this.options.timeout as number,
				`Timeout waiting for verification process to complete (PID: ${instance.pid})`,
			)
			.tap(() => logger.info('Pact Verification succeeded.'));
	}
}

// Creates a new instance of the pact server with the specified option
export default (options: VerifierOptions): Verifier => new Verifier(options);

// A ConsumerVersionSelector is a way we specify which pacticipants and
// versions we want to use when configuring verifications.
//
// See https://docs.pact.io/selectors for more
export interface ConsumerVersionSelector {
	pacticipant?: string;
	tag?: string;
	version?: string;
	latest?: boolean;
	all?: boolean;
}

interface CurrentVerifierOptions {
	providerBaseUrl: string;
	provider?: string;
	pactUrls?: string[];
	pactBrokerUrl?: string;
	pactBrokerUsername?: string;
	pactBrokerPassword?: string;
	pactBrokerToken?: string;
	consumerVersionTags?: string | string[];
	providerVersionTags?: string | string[];
	consumerVersionSelectors?: ConsumerVersionSelector[];
	customProviderHeaders?: string[];
	publishVerificationResult?: boolean;
	providerVersion?: string;
	enablePending?: boolean;
	timeout?: number;
	verbose?: boolean;
	includeWipPactsSince?: string;
	monkeypatch?: string;
	format?: 'json' | 'xml' | 'progress' | 'RspecJunitFormatter';
	out?: string;
}

interface DeprecatedVerifierOptions {
	consumerVersionTag?: string | string[];
	providerStatesSetupUrl?: string;
	providerVersionTag?: string | string[];
	tags?: string[];
}

export type VerifierOptions = CurrentVerifierOptions &
	DeprecatedVerifierOptions;
