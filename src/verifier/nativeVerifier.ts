import { VerifierOptions } from './types';
import { getVerifierLib } from '../ffi/verifier';
import logger from '../logger';
import { argMapping } from './arguments';
import { argumentMapper } from '../ffi/argumentMapper';

const VERIFICATION_SUCCESSFUL = 0;
const VERIFICATION_FAILED = 1;
// 2 - null string passed
// 3 - method panicked
const INVALID_ARGUMENTS = 4;

export const verify = (opts: VerifierOptions): Promise<string> => {
  const verifierLib = getVerifierLib();
  // Todo: probably separate out the sections of this logic into separate promises
  return new Promise<string>((resolve, reject) => {
    // Todo: Does this need to be a specific log level?
    // PACT_LOG_LEVEL
    // LOG_LEVEL
    // < .. >
    verifierLib.init('LOG_LEVEL');

    const request = argumentMapper(argMapping, opts).join('\n');

    logger.debug('sending arguments to FFI:');
    logger.debug(request);

    verifierLib.verify.async(request, (err: Error, res: number) => {
      logger.debug(`response from verifier: ${err}, ${res}`);
      if (err) {
        logger.error(err);
        logger.pactCrash(
          'The underlying pact core returned an error through the ffi interface'
        );
        reject(err);
      } else {
        switch (res) {
          case VERIFICATION_SUCCESSFUL:
            logger.info('Verification successful');
            resolve(`finished: ${res}`);
            break;
          case VERIFICATION_FAILED:
            logger.error('Verification unsuccessful');
            reject(new Error('Verfication failed'));
            break;
          case INVALID_ARGUMENTS:
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
