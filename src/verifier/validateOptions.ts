import checkTypes = require('check-types');
import { LogLevel } from '../logger';
import { VerifierOptions } from './types';

const LogLevels: LogLevel[] = ['debug', 'error', 'info', 'trace', 'warn'];

export const validateOptions = (o: VerifierOptions): VerifierOptions => {
  // This is the old validator from the ruby binaries. It's a bit
  // verbose and hard to reason about. It would be great to replace
  // it with some sort of validation library in the future.

  const options = { ...o };

  if (options.logLevel) {
    if (LogLevels.includes(options.logLevel.toLowerCase() as LogLevel)) {
      options.logLevel = options.logLevel.toLowerCase() as LogLevel;
    } else {
      throw new Error(
        `The logLevel '${
          options.logLevel
        }' is not a valid logLevel. The valid options are: ${LogLevels.join(
          ', '
        )}`
      );
    }
  }

  if (options.providerVersionTags) {
    if (
      !checkTypes.string(options.providerVersionTags) &&
      !checkTypes.array.of.string(options.providerVersionTags)
    ) {
      throw new Error(
        'providerVersionTags should be a string or an array of strings'
      );
    }
  }

  if (options.includeWipPactsSince !== undefined) {
    checkTypes.assert.nonEmptyString(
      options.includeWipPactsSince,
      'includeWipPactsSince should be a non-empty string'
    );
  }

  checkTypes.assert.nonEmptyString(
    options.providerBaseUrl,
    'providerBaseUrl must be a non-empty string'
  );

  if (
    (!options.pactUrls ||
      checkTypes.emptyArray(options.pactUrls as string[])) &&
    !options.pactBrokerUrl
  ) {
    throw new Error(
      'Must provide the pactUrls argument if no pactBrokerUrl provided'
    );
  }

  if (
    (!options.pactBrokerUrl || !options.provider) &&
    (!options.pactUrls || checkTypes.emptyArray(options.pactUrls as string[]))
  ) {
    throw new Error(
      'Must provide both provider and pactBrokerUrl if pactUrls not provided.'
    );
  }

  if (options.providerStatesSetupUrl) {
    checkTypes.assert.string(
      options.providerStatesSetupUrl,
      'providerStatesSetupUrl must be a non-empty string'
    );
  }

  if (options.pactBrokerUsername) {
    checkTypes.assert.string(
      options.pactBrokerUsername,
      'pactBrokerUsername must be a non-empty string'
    );
  }

  if (options.pactBrokerPassword) {
    checkTypes.assert.string(
      options.pactBrokerPassword,
      'pactBrokerPassword must be a string'
    );
  }

  if (
    options.pactBrokerToken &&
    (options.pactBrokerUsername || options.pactBrokerPassword)
  ) {
    throw new Error(
      'Must provide pactBrokerToken or pactBrokerUsername/pactBrokerPassword but not both.'
    );
  }

  if (options.pactBrokerUrl) {
    checkTypes.assert.string(
      options.pactBrokerUrl,
      'pactBrokerUrl must be a string'
    );
  }

  if (options.pactUrls) {
    checkTypes.assert.array.of.string(
      options.pactUrls,
      'pactUrls must be an array of strings'
    );
  }

  if (options.providerBaseUrl) {
    checkTypes.assert.string(
      options.providerBaseUrl,
      'providerBaseUrl must be a string'
    );
  }

  if (options.publishVerificationResult) {
    checkTypes.assert.boolean(
      options.publishVerificationResult,
      'publishVerificationResult must be a boolean'
    );
  }

  if (options.publishVerificationResult && !options.providerVersion) {
    throw new Error(
      'Must provide both or none of publishVerificationResult and providerVersion.'
    );
  }

  if (options.providerVersion) {
    checkTypes.assert.string(
      options.providerVersion,
      'providerVersion must be a string'
    );
  }

  if (options.enablePending !== undefined) {
    checkTypes.assert.boolean(
      options.enablePending,
      'enablePending must be a boolean'
    );
  }

  if (options.timeout) {
    checkTypes.assert.positive(
      options.timeout as number,
      'timeout must be a positive number'
    );
  }
  return options;
};
