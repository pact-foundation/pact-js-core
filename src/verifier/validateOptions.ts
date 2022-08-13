import checkTypes = require('check-types');
import logger, { logErrorAndThrow } from '../logger';
import { LogLevel } from '../logger/types';
import { pick } from 'underscore';
import {
  ConsumerVersionSelector,
  InternalPactVerifierOptions,
  VerifierOptions,
} from './types';

export const deprecatedFunction =
  () =>
  (_: any, property: string): boolean => {
    logger.warn(`${property} is deprecated and no longer has any effect`);

    return true;
  };

export const incompatibleWith =
  (keys: (keyof InternalPactVerifierOptions)[]) =>
  (options: InternalPactVerifierOptions) =>
  (_: any, property: string): boolean => {
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
  (_: any, property: string): boolean => {
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
  (_: any, property: string): boolean => {
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

export type AssertFunction = (a: any, ...args: any) => boolean;

export const wrapCheckType = (fn: AssertFunction) => (): AssertFunction => fn;

const LogLevels: LogLevel[] = ['debug', 'error', 'info', 'trace', 'warn'];

const logLevelValidator =
  () =>
  (l: LogLevel): boolean => {
    if (LogLevels.includes(l.toLowerCase() as LogLevel)) {
      l = l.toLowerCase() as LogLevel;
    } else {
      throw new Error(
        `The logLevel '${l}' is not a valid logLevel. The valid options are: ${LogLevels.join(
          ', '
        )}`
      );
    }
    return true;
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
    providerBaseUrl: [wrapCheckType(checkTypes.assert.nonEmptyString)],
    buildUrl: [wrapCheckType(checkTypes.assert.nonEmptyString)],
    consumerVersionSelectors: [consumerVersionSelectorValidator],
    consumerVersionTags: [consumerVersionTagsValidator],
    customProviderHeaders: [customProviderHeadersValidator],
    disableSslVerification: [wrapCheckType(checkTypes.assert.boolean)],
    enablePending: [wrapCheckType(checkTypes.assert.boolean)],
    format: [deprecatedFunction],
    includeWipPactsSince: [wrapCheckType(checkTypes.assert.nonEmptyString)],
    provider: [wrapCheckType(checkTypes.assert.nonEmptyString)],
    pactUrls: [wrapCheckType(checkTypes.assert.nonEmptyString)],
    pactBrokerUrl: [
      wrapCheckType(checkTypes.assert.nonEmptyString),
      requires(['provider']),
      requiresOneOf([
        'pactUrls',
        'consumerVersionSelectors',
        'consumerVersionTags',
      ]),
    ],
    pactBrokerUsername: [
      wrapCheckType(checkTypes.assert.nonEmptyString),
      incompatibleWith(['pactBrokerToken']),
      requires(['pactBrokerPassword']),
    ],
    pactBrokerPassword: [
      wrapCheckType(checkTypes.assert.nonEmptyString),
      incompatibleWith(['pactBrokerToken']),
      requires(['pactBrokerUsername']),
    ],
    pactBrokerToken: [
      wrapCheckType(checkTypes.assert.nonEmptyString),
      incompatibleWith(['pactBrokerUsername', 'pactBrokerPassword']),
    ],
    providerVersionTags: [wrapCheckType(checkTypes.assert.nonEmptyString)],
    providerBranch: [wrapCheckType(checkTypes.assert.nonEmptyString)],
    providerStatesSetupUrl: [wrapCheckType(checkTypes.assert.nonEmptyString)],
    providerStatesSetupTeardown: [wrapCheckType(checkTypes.assert.boolean)],
    providerStatesSetupBody: [wrapCheckType(checkTypes.assert.boolean)],
    publishVerificationResult: [
      wrapCheckType(checkTypes.assert.boolean),
      requires(['providerVersion']),
    ],
    providerVersion: [wrapCheckType(checkTypes.assert.nonEmptyString)],
    timeout: [wrapCheckType(checkTypes.assert.positive)],
    logLevel: [logLevelValidator],
    out: [deprecatedFunction],
    verbose: [deprecatedFunction],
    monkeypatch: [deprecatedFunction],
    logDir: [deprecatedFunction],
    consumerFilters: [wrapCheckType(checkTypes.assert.nonEmptyString)],
  };

export const validateOptions = (options: VerifierOptions): VerifierOptions => {
  (
    Object.keys(options).concat('providerBaseUrl') as Array<
      keyof InternalPactVerifierOptions
    >
  ).map((k) => {
    const rules = validationRules[k];

    // get type of parameter (if an array, we apply the rule to each item of the array instead)
    if (Array.isArray(options[k])) {
      (options[k] as Array<any>).map((item) => {
        rules.map((rule) => {
          // rule(item)  // If the messages aren't clear, we can do this
          rule(options)(item, k);
        });
      });
    } else {
      rules.map((rule) => {
        rule(options)(options[k], k);
      });
    }
  });

  return options;
};
