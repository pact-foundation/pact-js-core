import { VerifierOptions } from './types';
import { getVerifierLib } from '../ffi/verifier';
import logger from '../logger';
import { argMapping, ignoredArguments } from './arguments';
import { argumentMapper } from '../ffi/argumentMapper';

const VERIFICATION_SUCCESSFUL = 0;
const VERIFICATION_FAILED = 1;
// 2 - null string passed
// 3 - method panicked
const INVALID_ARGUMENTS = 4;

const LOG_ENV_VAR_NAME = 'PACT_LOG_LEVEL';

export const verify = (opts: VerifierOptions): Promise<string> => {
  const verifierLib = getVerifierLib();
  // Todo: probably separate out the sections of this logic into separate promises
  return new Promise<string>((resolve, reject) => {
    process.env[LOG_ENV_VAR_NAME] = opts.logLevel;
    verifierLib.init(LOG_ENV_VAR_NAME);

    const request = argumentMapper(argMapping, opts, ignoredArguments)
      .map((s) => s.replace('\n', ''))
      .join('\n');

    logger.debug('sending arguments to FFI:');
    logger.debug(request);

    verifierLib.verify.async(request, (err: Error, res: number) => {
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
