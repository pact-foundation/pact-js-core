import { VerifierOptions } from './types';
import logger, { setLogLevel } from '../logger';
import { getFfiLib } from '../ffi';
import { VERIFY_PROVIDER_RESPONSE } from '../ffi/types';

import { setupVerification } from './argumentMapper';

// TODO: Replace this hack with https://www.npmjs.com/package/@npmcli/package-json
// TODO: abstract this so it's not repeated in src/logger.ts
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');

export const verify = (opts: VerifierOptions): Promise<string> => {
  const ffi = getFfiLib(opts.logLevel, opts.logFile);
  if (opts.logLevel) {
    setLogLevel(opts.logLevel);
  }

  const handle = ffi.pactffiVerifierNewForApplication(
    pkg.name.split('/')[1],
    pkg.version
  );

  setupVerification(ffi, handle, opts);

  return new Promise<string>((resolve, reject) => {
    ffi.pactffiVerifierExecute(handle, (err: Error, res: number) => {
      logger.debug(`shutting down verifier with handle ${handle}`);

      ffi.pactffiVerifierShutdown(handle);

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
