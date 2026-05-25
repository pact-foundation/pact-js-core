import logger, { setLogLevel } from './logger';
import type { LogLevel } from './logger/types';
import verifierFactory from './verifier';
import type { VerifierOptions } from './verifier/types';

export class Pact {
  public logLevel(level?: LogLevel): void {
    setLogLevel(level);
  }

  // Run the Pact Verification process
  public verifyPacts(options: VerifierOptions): Promise<string> {
    logger.info('Verifying Pacts.');
    return verifierFactory(options).verify();
  }
}

export default new Pact();
