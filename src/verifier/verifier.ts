import logger from '../logger';
import { timeout, TimeoutError } from 'promise-timeout';

import { VerifierOptions } from './types';
import { verify } from './nativeVerifier';

const applyDefaults = (options: VerifierOptions): VerifierOptions => ({
  timeout: 30000,
  ...options,
});

export class Verifier {
  public readonly options: VerifierOptions;

  constructor(options: VerifierOptions) {
    this.options = applyDefaults(options);
  }

  public verify(): Promise<string> {
    logger.info('Verifying Pact Files');

    return timeout(verify(this.options), this.options.timeout as number).catch(
      (err: Error) => {
        if (err instanceof TimeoutError) {
          throw new Error(
            `Timeout waiting for verification process to complete`
          );
        }
        throw err;
      }
    );
  }
}

// Creates a new instance of the pact server with the specified option
export default (options: VerifierOptions): Verifier => new Verifier(options);

// A ConsumerVersionSelector is a way we specify which pacticipants and
// versions we want to use when configuring verifications.
//
// See https://docs.pact.io/selectors for more
