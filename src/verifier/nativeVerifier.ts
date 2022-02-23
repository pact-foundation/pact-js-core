import { VerifierOptions } from './types';
import logger, { setLogLevel } from '../logger';
import { getFfiLib } from '../ffi';
import { VERIFY_PROVIDER_RESPONSE } from '../ffi/types';
import { URL } from 'url';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');

import fs = require('fs');

const objArrayToStringArray = (obj: unknown[]) => {
  return obj.map((o) => JSON.stringify(o));
};

export const verify = (opts: VerifierOptions): Promise<string> => {
  const ffi = getFfiLib(opts.logLevel);
  if (opts.logLevel) {
    setLogLevel(opts.logLevel);
  }

  const handle = ffi.pactffiVerifierNewForApplication(
    pkg.name.split('/')[1],
    pkg.version
  );
  const uri = new URL(opts.providerBaseUrl);

  ffi.pactffiVerifierSetProviderInfo(
    handle,
    opts.provider || '',
    uri.protocol.split(':')[0],
    uri.hostname,
    parseInt(uri.port, 10),
    uri.pathname
  );

  if (opts.providerStatesSetupUrl) {
    ffi.pactffiVerifierSetProviderState(
      handle,
      opts.providerStatesSetupUrl,
      opts.providerStatesSetupTeardown || true,
      opts.providerStatesSetupBody || true
    );
  }

  if (opts.pactUrls) {
    opts.pactUrls.forEach((file) => {
      logger.debug(`checking source type of given pactUrl: ${file}`);
      try {
        new URL(file);
        logger.debug(`adding ${file} as a Url source`);

        ffi.pactffiVerifierUrlSource(
          handle,
          file,
          opts.pactBrokerUsername || '',
          opts.pactBrokerPassword || '',
          opts.pactBrokerToken || ''
        );
      } catch {
        logger.debug(`${file} is not a URI`);
      }

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
        logger.debug(`${file} is not a file`);
      }
    });
  }

  // TODO: extract these options into its own subtype, and check keyof
  if (opts.disableSslVerification || opts.timeout) {
    ffi.pactffiVerifierSetVerificationOptions(
      handle,
      opts.disableSslVerification || false,
      opts.timeout || 30000
    );
  }

  // TODO: extract these options into its own subtype, and check keyof
  if (
    opts.publishVerificationResult ||
    opts.providerVersion ||
    opts.publishVerificationResult ||
    opts.buildUrl ||
    opts.disableSslVerification ||
    opts.timeout ||
    opts.providerVersionTags
  ) {
    ffi.pactffiVerifierSetPublishOptions(
      handle,
      opts.providerVersion || '',
      opts.buildUrl || '',
      opts.providerVersionTags || [],
      opts.providerBranch || ''
    );
  }

  if (opts.pactBrokerUrl && opts.provider) {
    ffi.pactffiVerifierBrokerSourceWithSelectors(
      handle,
      opts.pactBrokerUrl,
      opts.provider,
      opts.pactBrokerUsername || '',
      opts.pactBrokerPassword || '',
      opts.pactBrokerToken || '',
      opts.enablePending || false,
      opts.includeWipPactsSince || '',
      opts.providerVersionTags || [],
      opts.providerBranch || '',
      opts.consumerVersionSelectors
        ? objArrayToStringArray(opts.consumerVersionSelectors)
        : [],
      opts.consumerVersionTags || []
    );
  }

  // Todo: probably separate out the sections of this logic into separate promises
  return new Promise<string>((resolve, reject) => {
    ffi.pactffiVerifierExecute(handle, (err: Error, res: number) => {
      logger.debug(`response from verifier: ${err}, ${res}`);
      if (err) {
        if (typeof err === 'string') {
          // It might not really be an `Error`, because it comes from native code.
          logger.error(err);
        } else if (err.message) {
          logger.error(err.message);
        }
        logger.pactCrash(
          'The underlying pact core returned an error through the ffi interface'
        );
        reject(err);
      } else {
        switch (res) {
          case VERIFY_PROVIDER_RESPONSE.VERIFICATION_SUCCESSFUL:
            logger.info('Verification successful');
            resolve(`finished: ${res}`);
            break;
          case VERIFY_PROVIDER_RESPONSE.VERIFICATION_FAILED:
            logger.error('Verification unsuccessful');
            reject(new Error('Verfication failed'));
            break;
          case VERIFY_PROVIDER_RESPONSE.INVALID_ARGUMENTS:
            logger.pactCrash(
              'The underlying pact core was invoked incorrectly.'
            );
            reject(new Error('Verification was unable to run'));
            break;
          default:
            logger.pactCrash(
              'The underlying pact core crashed in an unexpected way.'
            );
            reject(new Error('Pact core crashed'));
            break;
        }
      }
    });
  });
};
