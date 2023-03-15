import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import pact from './pact';

chai.use(chaiAsPromised);

describe('Pact Spec', () => {
  describe('Set Log Level', () => {
    let originalLogLevel: any;
    // Reset log level after the tests
    before(() => {
      originalLogLevel = pact.logLevel();
    });
    after(() => pact.logLevel(originalLogLevel));

    context('when setting a log level', () => {
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
