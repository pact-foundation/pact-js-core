import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import pact from './pact';
import { LogLevel } from './logger/types';

chai.use(chaiAsPromised);

describe('Pact Spec', function () {
  describe('Set Log Level', function () {
    let originalLogLevel: LogLevel;
    // Reset log level after the tests
    before(function () {
      originalLogLevel = pact.logLevel();
    });

    after(function () {
      return pact.logLevel(originalLogLevel);
    });

    context('when setting a log level', function () {
      it("should be able to set log level 'trace'", function () {
        pact.logLevel('trace');
        pact.logLevel();
      });

      it("should be able to set log level 'debug'", function () {
        pact.logLevel('debug');
        pact.logLevel();
      });

      it("should be able to set log level 'info'", function () {
        pact.logLevel('info');
        pact.logLevel();
      });

      it("should be able to set log level 'warn'", function () {
        pact.logLevel('warn');
        pact.logLevel();
      });

      it("should be able to set log level 'error'", function () {
        pact.logLevel('error');
        pact.logLevel();
      });
    });
  });
});
