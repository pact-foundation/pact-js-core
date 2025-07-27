import * as chai from 'chai';
import * as path from 'path';
import chaiAsPromised from 'chai-as-promised';
import * as http from 'http';
import providerMock from './integration/provider-mock';
import verifierFactory from '../src/verifier';
import { VerifierOptions } from '../src/verifier/types';
import { LogLevel } from '../src/logger/types';

const { expect } = chai;
chai.use(chaiAsPromised);

describe('Verifier Integration Spec', function () {
  let server: http.Server;
  const PORT = 9123;
  const providerBaseUrl = `http://localhost:${PORT}`;
  const providerStatesSetupUrl = `${providerBaseUrl}/provider-state`;
  const pactBrokerBaseUrl = `http://localhost:${PORT}`;
  const monkeypatchFile: string = path.resolve(__dirname, 'monkeypatch.rb');
  const DEFAULT_ARGS = {
    logLevel: 'debug' as LogLevel,
    providerVersion: 'VERSION',
  };

  before(function () {
    return providerMock(PORT).then((s) => {
      console.log(`Pact Broker Mock listening on port: ${PORT}`);
      server = s;
    });
  });

  after(function () {
    return server.close();
  });

  context('when given a successful contract', function () {
    context('with spaces in the file path', function () {
      it('should return a successful promise', function () {
        return expect(
          verifierFactory({
            ...DEFAULT_ARGS,
            providerBaseUrl,
            pactUrls: [
              path.resolve(
                __dirname,
                'integration/me-they-weird path-success.json'
              ),
            ],
          }).verify()
        ).to.eventually.be.fulfilled;
      });

      context('with some broker args but no broker URL', function () {
        it('should return a successful promise', function () {
          return expect(
            verifierFactory({
              ...DEFAULT_ARGS,
              providerBaseUrl,
              pactUrls: [
                path.resolve(
                  __dirname,
                  'integration/me-they-weird path-success.json'
                ),
              ],
              // These don't mean anything without a broker URL, but should not fail the verification
              enablePending: true,
              consumerVersionSelectors: [{ latest: true }],
              consumerVersionTags: ['main'],
              publishVerificationResult: true,
            }).verify()
          ).to.eventually.be.fulfilled;
        });
      });
    });

    context('without provider states', function () {
      it('should return a successful promise', function () {
        return expect(
          verifierFactory({
            providerBaseUrl,
            pactUrls: [
              path.resolve(__dirname, 'integration/me-they-success.json'),
            ],
          }).verify()
        ).to.eventually.be.fulfilled;
      });
    });

    context('with Provider States', function () {
      it('should return a successful promise', function () {
        return expect(
          verifierFactory({
            providerBaseUrl,
            pactUrls: [
              path.resolve(__dirname, 'integration/me-they-states.json'),
            ],
            providerStatesSetupUrl,
          }).verify()
        ).to.eventually.be.fulfilled;
      });
    });

    context('with POST data', function () {
      it('should return a successful promise', function () {
        return expect(
          verifierFactory({
            providerBaseUrl,
            pactUrls: [
              path.resolve(__dirname, 'integration/me-they-post-success.json'),
            ],
          }).verify()
        ).to.eventually.be.fulfilled;
      });
    });

    context('with POST data and regex validation', function () {
      it('should return a successful promise', function () {
        return expect(
          verifierFactory({
            providerBaseUrl,
            pactUrls: [
              path.resolve(
                __dirname,
                'integration/me-they-post-regex-success.json'
              ),
            ],
          }).verify()
        ).to.eventually.be.fulfilled;
      });
    });

    context('with monkeypatch file specified', function () {
      it('should return a successful promise', function () {
        return expect(
          verifierFactory({
            providerBaseUrl,
            pactUrls: [
              path.resolve(__dirname, 'integration/me-they-success.json'),
            ],
            monkeypatch: monkeypatchFile,
          } as VerifierOptions).verify()
        ).to.eventually.be.fulfilled;
      });
    });
  });

  context('when given a failing contract', function () {
    it('should return a rejected promise', function () {
      return expect(
        verifierFactory({
          providerBaseUrl,
          pactUrls: [path.resolve(__dirname, 'integration/me-they-fail.json')],
        }).verify()
      ).to.eventually.be.rejected;
    });
  });

  context(
    'when given multiple successful API calls in a contract',
    function () {
      it('should return a successful promise', function () {
        return expect(
          verifierFactory({
            providerBaseUrl,
            pactUrls: [
              path.resolve(__dirname, 'integration/me-they-multi.json'),
            ],
            providerStatesSetupUrl,
          }).verify()
        ).to.eventually.be.fulfilled;
      });
    }
  );

  context('when given multiple contracts', function () {
    context('from a local file', function () {
      it('should return a successful promise', function () {
        return expect(
          verifierFactory({
            providerBaseUrl,
            pactUrls: [
              path.resolve(__dirname, 'integration/me-they-success.json'),
              path.resolve(__dirname, 'integration/me-they-multi.json'),
            ],
            providerStatesSetupUrl,
          }).verify()
        ).to.eventually.be.fulfilled;
      });
    });

    // Tests failing due to rust panic:
    //
    // thread '<unnamed>' panicked at 'Cannot drop a runtime in a context where blocking is not allowed. This happens when a runtime is dropped from within an asynchronous context
    // with RUST_BACKTRACE=1 it seems that it relates to fetching from the broker, and something bad
    // is happening in reqwest
    context('from a Pact Broker', function () {
      context('without authentication', function () {
        it('should return a successful promise', function () {
          return expect(
            verifierFactory({
              providerBaseUrl,
              pactUrls: [
                `${pactBrokerBaseUrl}/noauth/pacts/provider/they/consumer/me/latest`,
                `${pactBrokerBaseUrl}/noauth/pacts/provider/they/consumer/anotherclient/latest`,
              ],
              providerStatesSetupUrl,
            }).verify()
          ).to.eventually.be.fulfilled;
        });
      });

      context('with authentication', function () {
        context('and a valid user/password', function () {
          it('should return a successful promise', function () {
            return expect(
              verifierFactory({
                providerBaseUrl,
                pactUrls: [
                  `${pactBrokerBaseUrl}/pacts/provider/they/consumer/me/latest`,
                  `${pactBrokerBaseUrl}/pacts/provider/they/consumer/anotherclient/latest`,
                ],
                providerStatesSetupUrl,
                pactBrokerUsername: 'foo',
                pactBrokerPassword: 'bar',
              }).verify()
            ).to.eventually.be.fulfilled;
          });
        });

        context('and an invalid user/password', function () {
          it('should return a rejected promise', function () {
            return expect(
              verifierFactory({
                providerBaseUrl,
                pactUrls: [
                  `${pactBrokerBaseUrl}/pacts/provider/they/consumer/me/latest`,
                  `${pactBrokerBaseUrl}/pacts/provider/they/consumer/anotherclient/latest`,
                ],
                providerStatesSetupUrl,
                pactBrokerUsername: 'foo',
                pactBrokerPassword: 'baaoeur',
              }).verify()
            ).to.eventually.be.rejected;
          });

          it('should return the verifier error output in the returned promise', function () {
            return expect(
              verifierFactory({
                providerBaseUrl,
                pactUrls: [
                  `${pactBrokerBaseUrl}/pacts/provider/they/consumer/me/latest`,
                  `${pactBrokerBaseUrl}/pacts/provider/they/consumer/anotherclient/latest`,
                ],
                providerStatesSetupUrl,
                pactBrokerUsername: 'foo',
                pactBrokerPassword: 'baaoeur',
              }).verify()
            ).to.eventually.be.rejected;
          });
        });
      });
    });
  });

  context('when publishing verification results to a Pact Broker', function () {
    context(
      'and there is a valid Pact file with spaces in the path',
      function () {
        it('should return a successful promise', function () {
          return expect(
            verifierFactory({
              providerBaseUrl,
              pactUrls: [
                path.resolve(
                  __dirname,
                  'integration/publish-verification-example weird path-success.json'
                ),
              ],
              providerStatesSetupUrl,
            }).verify()
          ).to.eventually.be.fulfilled;
        });
      }
    );

    context(
      'and there is a valid verification HAL link in the Pact file',
      function () {
        it('should return a successful promise', function () {
          return expect(
            verifierFactory({
              providerBaseUrl,
              pactUrls: [
                path.resolve(
                  __dirname,
                  'integration/publish-verification-example-success.json'
                ),
              ],
              providerStatesSetupUrl,
            }).verify()
          ).to.eventually.be.fulfilled;
        });
      }
    );

    context(
      'and there is an invalid verification HAL link in the Pact file',
      function () {
        it('should fail with an error', function () {
          return expect(
            verifierFactory({
              providerBaseUrl,
              pactUrls: [
                path.resolve(
                  __dirname,
                  'integration/publish-verification-example-fail.json'
                ),
              ],
              providerStatesSetupUrl,
            }).verify()
          ).to.eventually.be.fulfilled;
        });
      }
    );
  });
});
