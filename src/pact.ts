import verifierFactory from './verifier';
import { VerifierOptions } from './verifier/types';
import logger, { setLogLevel, getLogLevel } from './logger';
import { LogLevel } from './logger/types';

export class Pact {
  public logLevel(): LogLevel;
  public logLevel(level: LogLevel): void;
  public logLevel(level?: LogLevel): LogLevel | void {
    if (level === undefined) {
      return getLogLevel();
    }
    setLogLevel(level);
  }

  // Run the Pact Verification process
  public verifyPacts(options: VerifierOptions): Promise<string> {
    logger.info('Verifying Pacts.');
    return verifierFactory(options).verify();
  }
}

export default new Pact();
