import { VerifierOptions } from './types';
import { verifierLib } from './ffiVerifier';
import logger from '../logger';
import { argMapping } from './arguments';
import { argumentMapper } from './argumentMapper';

const VERIFICATION_SUCCESSFUL = 0;
const VERIFICATION_FAILED = 1;
// 2 - null string passed
// 3 - method panicked
const INVALID_ARGUMENTS = 4;

const pactCrashMessage = (
  extraMessage: string
) => `!!!!!!!!! PACT CRASHED !!!!!!!!!

${extraMessage}

This is almost certainly a bug in pact-js-core. It would be great if you could
open a bug report at: https://github.com/pact-foundation/pact-js-core/issues
so that we can fix it.

There is additional debugging information above. If you open a bug report, 
please rerun with logLevel: 'debug' set in the VerifierOptions, and include the
full output.

SECURITY WARNING: Before including your log in the issue tracker, make sure you
have removed sensitive info such as login credentials and urls that you don't want
to share with the world.

Lastly, we're sorry about this!
`;

export const verify = (opts: VerifierOptions): Promise<string> => {
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
        logger.error(
          pactCrashMessage(
            'The underlying pact core returned an error through the ffi interface'
          )
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
            logger.error(
              pactCrashMessage(
                'The underlying pact core was invoked incorrectly.'
              )
            );
            reject(new Error('Verification was unable to run'));
            break;
          default:
            logger.error(
              pactCrashMessage(
                'The underlying pact core crashed in an unexpected way.'
              )
            );
            reject(new Error('Pact core crashed'));
            break;
        }
      }
    });
  });
};
