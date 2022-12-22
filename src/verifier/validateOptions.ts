import checkTypes = require('check-types');
import { pick } from 'underscore';
import logger, { logErrorAndThrow } from '../logger';
import { LogLevel } from '../logger/types';
import {
  ConsumerVersionSelector,
  InternalPactVerifierOptions,
  VerifierOptions,
} from './types';

export const deprecatedFunction =
  () =>
  (_: unknown, property: string): boolean => {
    logger.warn(`${property} is deprecated and no longer has any effect`);

    return true;
  };

export const deprecatedBy =
  (preferredOption: string) =>
  () =>
  (_: unknown, property: string): boolean => {
    logger.warn(`${property} is deprecated, use ${preferredOption} instead`);

    return true;
  };

export const incompatibleWith =
  (keys: (keyof InternalPactVerifierOptions)[]) =>
  (options: InternalPactVerifierOptions) =>
  (_: unknown, property: string): boolean => {
    const incompatibilities = pick(options, keys);

    if (Object.keys(incompatibilities).length > 0) {
      logErrorAndThrow(
        `${property} is incompatible with the following properties: ${keys.join(
          ','
        )}`
      );
      return false;
    }

    return true;
  };

export const requires =
  (keys: (keyof InternalPactVerifierOptions)[]) =>
  (options: InternalPactVerifierOptions) =>
  (_: unknown, property: string): boolean => {
    const required = pick(options, keys);

    if (keys.length !== Object.keys(required).length) {
      logErrorAndThrow(
        `${property} requires the following properties: ${keys.join(',')}`
      );
      return false;
    }

    return true;
  };

export const requiresOneOf =
  (keys: (keyof InternalPactVerifierOptions)[]) =>
  (options: InternalPactVerifierOptions) =>
  (_: unknown, property: string): boolean => {
    const required = pick(options, keys);

    if (Object.keys(required).length === 0) {
      logErrorAndThrow(
        `${property} requires one of the following properties: ${keys.join(
          ','
        )}`
      );
      return false;
    }

    return true;
  };

type AssertFunction = (a: unknown, property: string) => boolean;

const assertNonEmptyString =
  (): AssertFunction => (a: unknown, property: string) =>
    checkTypes.assert.nonEmptyString(a as string, property);

const assertBoolean = (): AssertFunction => (a: unknown, property: string) =>
  checkTypes.assert.boolean(a as boolean, property);

const assertPositive = (): AssertFunction => (a: unknown, property: string) =>
  checkTypes.assert.positive(a as number, property);

const LogLevels: LogLevel[] = ['debug', 'error', 'info', 'trace', 'warn'];

const logLevelValidator =
  () =>
  (l: unknown): boolean => {
    if (typeof l === 'string') {
      if (LogLevels.includes(l.toLowerCase() as LogLevel)) {
        return true;
      }
    }
    throw new Error(
      `The logLevel '${l}' is not a valid logLevel. The valid options are: ${LogLevels.join(
        ', '
      )}`
    );
  };

const consumerVersionSelectorValidator =
  (options: InternalPactVerifierOptions) => (): boolean => {
    if (
      options.consumerVersionSelectors &&
      Array.isArray(options.consumerVersionSelectors)
    ) {
      const PROPS: Array<keyof ConsumerVersionSelector> = [
        'tag',
        'latest',
        'consumer',
        'deployedOrReleased',
        'deployed',
        'released',
        'environment',
        'fallbackTag',
        'branch',
        'mainBranch',
        'matchingBranch',
      ];
      options.consumerVersionSelectors.forEach((selector) => {
        if (selector.tag === 'latest') {
          logger.warn(
            "Using the tag 'latest' is not recommended and probably does not do what you intended."
          );
          logger.warn(
            '    See https://docs.pact.io/pact_broker/tags/#latest-pacts'
          );
          logger.warn('    If you need to specify latest, try:');
          logger.warn('       consumerVersionSelectors: [{ lastest: true }]');
        }
        Object.keys(selector).forEach((key) => {
          if (!PROPS.includes(key as keyof ConsumerVersionSelector)) {
            logger.warn(
              `The consumer version selector '${key}' is unknown but will be sent through to the validation. Allowed properties are ${PROPS.join(
                ', '
              )})`
            );
          }
        });
      });
    }

    return true;
  };

const consumerVersionTagsValidator =
  (options: InternalPactVerifierOptions) => (): boolean => {
    if (options.consumerVersionTags) {
      if (
        !checkTypes.string(options.consumerVersionTags) &&
        !checkTypes.array.of.string(options.consumerVersionTags)
      ) {
        throw new Error(
          'consumerVersionTags should be a string or an array of strings'
        );
      }
      if (options.consumerVersionTags.includes('latest')) {
        logger.warn(
          "Using the tag 'latest' is not recommended and probably does not do what you intended."
        );
        logger.warn(
          '    See https://docs.pact.io/pact_broker/tags/#latest-pacts'
        );
        logger.warn('    If you need to specify latest, try:');
        logger.warn('       consumerVersionSelectors: [{ lastest: true }]');
      }
    }

    return true;
  };

const customProviderHeadersValidator =
  (options: InternalPactVerifierOptions) => (): boolean => {
    if (options.customProviderHeaders) {
      if (Array.isArray(options.customProviderHeaders)) {
        checkTypes.assert.array.of.string(options.customProviderHeaders);
      } else {
        checkTypes.assert.nonEmptyObject(options.customProviderHeaders);
      }
    }

    return true;
  };

export type ArgumentValidationRules<T> = {
  [Key in keyof T]-?: ((options: T) => AssertFunction)[];
};

export const validationRules: ArgumentValidationRules<InternalPactVerifierOptions> =
  {
    providerBaseUrl: [assertNonEmptyString],
    buildUrl: [assertNonEmptyString],
    consumerVersionSelectors: [consumerVersionSelectorValidator],
    consumerVersionTags: [consumerVersionTagsValidator],
    customProviderHeaders: [customProviderHeadersValidator],
    disableSslVerification: [assertBoolean],
    enablePending: [assertBoolean],
    format: [deprecatedFunction],
    includeWipPactsSince: [assertNonEmptyString],
    provider: [assertNonEmptyString],
    pactUrls: [assertNonEmptyString],
    pactBrokerUrl: [
      assertNonEmptyString,
      requires(['provider']),
      requiresOneOf([
        'pactUrls',
        'consumerVersionSelectors',
        'consumerVersionTags',
      ]),
    ],
    pactBrokerUsername: [
      assertNonEmptyString,
      incompatibleWith(['pactBrokerToken']),
      requires(['pactBrokerPassword']),
    ],
    pactBrokerPassword: [
      assertNonEmptyString,
      incompatibleWith(['pactBrokerToken']),
      requires(['pactBrokerUsername']),
    ],
    pactBrokerToken: [
      assertNonEmptyString,
      incompatibleWith(['pactBrokerUsername', 'pactBrokerPassword']),
    ],
    providerVersionTags: [assertNonEmptyString],
    providerBranch: [
      assertNonEmptyString,
      deprecatedBy('providerVersionBranch'),
    ],
    providerVersionBranch: [assertNonEmptyString],
    providerStatesSetupUrl: [assertNonEmptyString],
    providerStatesSetupTeardown: [assertBoolean],
    providerStatesSetupBody: [assertBoolean],
    publishVerificationResult: [assertBoolean, requires(['providerVersion'])],
    providerVersion: [assertNonEmptyString],
    timeout: [assertPositive],
    logLevel: [logLevelValidator],
    out: [deprecatedFunction],
    verbose: [deprecatedFunction],
    monkeypatch: [deprecatedFunction],
    logDir: [deprecatedFunction],
    consumerFilters: [assertNonEmptyString],
    failIfNoPactsFound: [assertBoolean],
    transports: [],
  };

export const validateOptions = (options: VerifierOptions): VerifierOptions => {
  (
    Object.keys(options).concat('providerBaseUrl') as Array<
      keyof InternalPactVerifierOptions
    >
  ).forEach((k) => {
    const rules = validationRules[k];

    // get type of parameter (if an array, we apply the rule to each item of the array instead)
    if (Array.isArray(options[k])) {
      options[k].forEach((item: unknown) => {
        rules.forEach((rule) => {
          // rule(item)  // If the messages aren't clear, we can do this
          rule(options)(item, k);
        });
      });
    } else {
      (rules || []).forEach((rule) => {
        rule(options)(options[k], k);
      });
    }
  });

  return options;
};
