import pact from './pact';

describe('Pact Spec', () => {
  describe('Set Log Level', () => {
    let originalLogLevel: any;
    // Reset log level after the tests
    beforeAll(() => {
      originalLogLevel = pact.logLevel();
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
