import fs = require('fs');
import url = require('url');
import { URL } from 'url';
import logger from '../../logger';

import { FnMapping, FnValidationStatus } from './types';
import { InternalPactVerifierOptions } from '../types';

import { FfiVerificationFunctions } from '../../ffi/types';

const DEFAULT_TIMEOUT = 30000;

const objArrayToStringArray = (obj: unknown[]) =>
  obj.map((o) => JSON.stringify(o));

type IgnoredFfiFunctions = {
  pactffiVerifierNewForApplication: 1;
  pactffiVerifierExecute: 1;
  pactffiVerifierShutdown: 1;
};

type MergedFfiSourceFunctions = {
  pactffiVerifierAddFileSource: 1;
  pactffiVerifierUrlSource: 1;
};

type RequiredFfiVerificationFunctions = Omit<
  FfiVerificationFunctions,
  keyof (IgnoredFfiFunctions & MergedFfiSourceFunctions)
>;

type OrderedExecution = {
  [Key in keyof RequiredFfiVerificationFunctions]: number;
};

export const orderOfExecution: OrderedExecution = {
  pactffiVerifierSetProviderInfo: 1,
  pactffiVerifierSetFilterInfo: 2,
  pactffiVerifierSetProviderState: 3,
  pactffiVerifierSetVerificationOptions: 4,
  pactffiVerifierSetPublishOptions: 5,
  pactffiVerifierSetConsumerFilters: 6,
  pactffiVerifierSetFailIfNoPactsFound: 7,
  pactffiVerifierAddCustomHeader: 8,
  pactffiVerifierAddDirectorySource: 9,
  pactffiVerifierBrokerSourceWithSelectors: 10,
  pactffiVerifierAddProviderTransport: 11,
};

export const ffiFnMapping: FnMapping<
  RequiredFfiVerificationFunctions,
  InternalPactVerifierOptions
> = {
  pactffiVerifierAddCustomHeader: {
    validateAndExecute(ffi, handle, options) {
      const messages: string[] = [];

      if (options.customProviderHeaders) {
        if (Array.isArray(options.customProviderHeaders)) {
          options.customProviderHeaders.forEach((item) => {
            const parts = item.split(':');
            if (parts.length !== 2) {
              messages.push(
                `${item} is not a valid custom header. Must be in the format 'Header-Name: Value'`
              );
            } else {
              ffi.pactffiVerifierAddCustomHeader(handle, parts[0], parts[1]);
            }
          });
        } else if (options.customProviderHeaders) {
          Object.entries(options.customProviderHeaders).forEach(
            ([key, value]) => {
              ffi.pactffiVerifierAddCustomHeader(handle, key, value);
            }
          );
        }
        if (messages.length > 0) {
          return { status: FnValidationStatus.FAIL, messages };
        }

        return { status: FnValidationStatus.SUCCESS };
      }

      return {
        status: FnValidationStatus.IGNORE,
        messages: ['No customProviderHeaders option provided'],
      };
    },
  },
  pactffiVerifierAddDirectorySource: {
    validateAndExecute(ffi, handle, options) {
      const messages: string[] = [];

      if (options.pactUrls) {
        options.pactUrls.forEach((file) => {
          logger.debug(`checking source type of given pactUrl: ${file}`);

          if (/https?:/.test(url.parse(file).protocol || '')) {
            try {
              const u = new URL(file);

              if (u.hostname) {
                logger.debug(`adding ${file} as a Url source`);
                ffi.pactffiVerifierUrlSource(
                  handle,
                  file,
                  options.pactBrokerUsername ||
                    process.env['PACT_BROKER_USERNAME'] ||
                    '',
                  options.pactBrokerPassword ||
                    process.env['PACT_BROKER_PASSWORD'] ||
                    '',
                  options.pactBrokerToken ||
                    process.env['PACT_BROKER_TOKEN'] ||
                    ''
                );
              }
            } catch {
              messages.push(`${file} is not a valid URL`);
            }
          } else {
            try {
              const f = fs.lstatSync(file);

              if (f.isDirectory()) {
                logger.debug(`adding ${file} as Directory source`);
                ffi.pactffiVerifierAddDirectorySource(handle, file);
              } else if (f.isFile() || f.isSymbolicLink()) {
                logger.debug(`adding ${file} as File source`);
                ffi.pactffiVerifierAddFileSource(handle, file);
              }
            } catch {
              messages.push(
                `'${file}' does not exist, or is not a file or directory`
              );
            }
          }
        });

        if (messages.length > 0) {
          return { status: FnValidationStatus.FAIL, messages };
        }

        return { status: FnValidationStatus.SUCCESS };
      }

      return {
        status: FnValidationStatus.IGNORE,
        messages: ['No pactUrls option provided'],
      };
    },
  },
  pactffiVerifierBrokerSourceWithSelectors: {
    validateAndExecute(ffi, handle, opts) {
      const brokerUrl =
        opts.pactBrokerUrl || process.env['PACT_BROKER_BASE_URL'];

      if (brokerUrl && opts.provider) {
        ffi.pactffiVerifierBrokerSourceWithSelectors(
          handle,
          brokerUrl,
          opts.pactBrokerUsername || process.env['PACT_BROKER_USERNAME'] || '',
          opts.pactBrokerPassword || process.env['PACT_BROKER_PASSWORD'] || '',
          opts.pactBrokerToken || process.env['PACT_BROKER_TOKEN'] || '',
          opts.enablePending || false,
          opts.includeWipPactsSince || '',
          opts.providerVersionTags || [],
          opts.providerVersionBranch || opts.providerBranch || '',
          opts.consumerVersionSelectors
            ? objArrayToStringArray(opts.consumerVersionSelectors)
            : [],
          opts.consumerVersionTags || []
        );
        return { status: FnValidationStatus.SUCCESS };
      }
      return {
        status: FnValidationStatus.IGNORE,
        messages: [
          'No pactBrokerUrl option / PACT_BROKER_BASE_URL set, or no provider option set',
        ],
      };
    },
  },
  pactffiVerifierSetConsumerFilters: {
    validateAndExecute(ffi, handle, options) {
      if (options.consumerFilters && options.consumerFilters.length > 0) {
        ffi.pactffiVerifierSetConsumerFilters(handle, options.consumerFilters);
        return { status: FnValidationStatus.SUCCESS };
      }
      return {
        status: FnValidationStatus.IGNORE,
        messages: [
          'Either no consumerFilters option provided, or the array was empty',
        ],
      };
    },
  },
  pactffiVerifierSetFailIfNoPactsFound: {
    validateAndExecute(ffi, handle, options) {
      if (options.failIfNoPactsFound !== undefined) {
        ffi.pactffiVerifierSetFailIfNoPactsFound(
          handle,
          options.failIfNoPactsFound
        );
        return { status: FnValidationStatus.SUCCESS };
      }
      return {
        status: FnValidationStatus.IGNORE,
        messages: ['No failIfNoPactsFound option provided'],
      };
    },
  },
  pactffiVerifierSetFilterInfo: {
    validateAndExecute(ffi, handle) {
      if (
        process.env['PACT_DESCRIPTION'] ||
        process.env['PACT_PROVIDER_STATE'] ||
        process.env['PACT_PROVIDER_NO_STATE']
      ) {
        const filterDescription = process.env['PACT_DESCRIPTION'] || '';
        const filterState = process.env['PACT_PROVIDER_STATE'] || '';
        const filterNoState = !!process.env['PACT_PROVIDER_NO_STATE'];

        ffi.pactffiVerifierSetFilterInfo(
          handle,
          filterDescription,
          filterState,
          filterNoState
        );

        return { status: FnValidationStatus.SUCCESS };
      }

      return {
        status: FnValidationStatus.IGNORE,
        messages: [
          'None of PACT_DESCRIPTION, PACT_PROVIDER_STATE or PACT_PROVIDER_NO_STATE were set in the environment',
        ],
      };
    },
  },
  pactffiVerifierSetProviderInfo: {
    validateAndExecute(ffi, handle, options) {
      const uri = new URL(options.providerBaseUrl);

      ffi.pactffiVerifierSetProviderInfo(
        handle,
        options.provider || '',
        uri.protocol.split(':')[0],
        uri.hostname,
        parseInt(uri.port, 10),
        uri.pathname
      );

      return { status: FnValidationStatus.SUCCESS };
    },
  },
  pactffiVerifierSetProviderState: {
    validateAndExecute(ffi, handle, options) {
      if (options.providerStatesSetupUrl) {
        ffi.pactffiVerifierSetProviderState(
          handle,
          options.providerStatesSetupUrl,
          true,
          true
        );
        return { status: FnValidationStatus.SUCCESS };
      }

      return {
        status: FnValidationStatus.IGNORE,
        messages: ['No failIfNoPactsFound option provided'],
      };
    },
  },
  pactffiVerifierSetPublishOptions: {
    validateAndExecute(ffi, handle, options) {
      if (
        (options.publishVerificationResult ||
          process.env['PACT_BROKER_PUBLISH_VERIFICATION_RESULTS']) &&
        options.providerVersion
      ) {
        ffi.pactffiVerifierSetPublishOptions(
          handle,
          options.providerVersion,
          options.buildUrl || '',
          options.providerVersionTags || [],
          options.providerVersionBranch || options.providerBranch || ''
        );
        return { status: FnValidationStatus.SUCCESS };
      }
      return {
        status: FnValidationStatus.IGNORE,
        messages: [
          'No publishVerificationResult option / PACT_BROKER_PUBLISH_VERIFICATION_RESULTS set, or no providerVersion option',
        ],
      };
    },
  },
  pactffiVerifierSetVerificationOptions: {
    validateAndExecute(ffi, handle, opts) {
      if (opts.disableSslVerification || opts.timeout) {
        ffi.pactffiVerifierSetVerificationOptions(
          handle,
          opts.disableSslVerification || false,
          opts.timeout || DEFAULT_TIMEOUT
        );
        return { status: FnValidationStatus.SUCCESS };
      }

      return {
        status: FnValidationStatus.IGNORE,
        messages: ['No disableSslVerification or timeout set'],
      };
    },
  },
  pactffiVerifierAddProviderTransport: {
    validateAndExecute(ffi, handle, options) {
      if (Array.isArray(options.transports)) {
        options.transports.forEach((transport) => {
          ffi.pactffiVerifierAddProviderTransport(
            handle,
            transport.protocol,
            transport.port,
            transport.path || '',
            transport.scheme || ''
          );
        });
        return { status: FnValidationStatus.SUCCESS };
      }
      return {
        status: FnValidationStatus.IGNORE,
        messages: ['No additional provider transports provided'],
      };
    },
  },
};
