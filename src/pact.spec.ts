import type { LogLevel } from './logger/types';
import pact from './pact';

describe('Pact Spec', () => {
  describe('Set Log Level', () => {
    let originalLogLevel: LogLevel | undefined;
    // Reset log level after the tests
    beforeAll(() => {
      // logLevel() returns void — the current level cannot be read via the public API;
      // afterAll will restore to undefined (default).
      pact.logLevel();
    });

    afterAll(() => pact.logLevel(originalLogLevel));

    describe('when setting a log level', () => {
      it("should be able to set log level 'trace'", () => {
        pact.logLevel('trace');
        pact.logLevel();
      });

      it("should be able to set log level 'debug'", () => {
        pact.logLevel('debug');
        pact.logLevel();
      });

      it("should be able to set log level 'info'", () => {
        pact.logLevel('info');
        pact.logLevel();
      });

      it("should be able to set log level 'warn'", () => {
        pact.logLevel('warn');
        pact.logLevel();
      });

      it("should be able to set log level 'error'", () => {
        pact.logLevel('error');
        pact.logLevel();
      });
    });
  });
});
