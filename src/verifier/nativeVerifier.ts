import { VerifierOptions } from './types';
import logger, { setLogLevel } from '../logger';
import { argumentMapper } from './argumentMapper';
import { getFfiLib } from '../ffi';
import { VERIFY_PROVIDER_RESPONSE } from '../ffi/types';

export const verify = (opts: VerifierOptions): Promise<string> => {
  const ffi = getFfiLib(opts.logLevel);
  if (opts.logLevel) {
    setLogLevel(opts.logLevel);
  }

  // Todo: probably separate out the sections of this logic into separate promises
  return new Promise<string>((resolve, reject) => {
    const request = argumentMapper(opts)
      .map((s) => s.replace('\n', ''))
      .join('\n');

    logger.debug('sending arguments to FFI:');
    logger.debug(request);

    ffi.pactffiVerify(request, (err: Error, res: number) => {
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
