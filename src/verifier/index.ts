import logger from '../logger';

import { VerifierOptions } from './types';
import { verify } from './nativeVerifier';
import { validateOptions } from './validateOptions';

const applyDefaults = (options: VerifierOptions): VerifierOptions => ({
  timeout: 30000,
  logLevel: 'info',
  ...options,
});

export class Verifier {
  public readonly options: VerifierOptions;

  constructor(options: VerifierOptions) {
    this.options = validateOptions(applyDefaults(options));
  }

  public verify(): Promise<string> {
    logger.info('Verifying Pact Files');

    return verify(this.options);
  }
}

// Creates a new instance of the pact server with the specified option
export default (options: VerifierOptions): Verifier => new Verifier(options);
