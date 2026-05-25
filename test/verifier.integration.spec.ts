import type * as http from 'node:http';
import * as path from 'node:path';
import type { LogLevel } from '../src/logger/types';
import verifierFactory from '../src/verifier';
import type { VerifierOptions } from '../src/verifier/types';
import providerMock from './integration/provider-mock';

describe('Verifier Integration Spec', () => {
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

  beforeAll(() =>
    providerMock(PORT).then((s) => {
      console.log(`Pact Broker Mock listening on port: ${PORT}`);
      server = s;
    }),
  );

  afterAll(() => server.close());

  describe('when given a successful contract', () => {
    describe('with spaces in the file path', () => {
      it('should return a successful promise', async () => {
        await verifierFactory({
          ...DEFAULT_ARGS,
          providerBaseUrl,
          pactUrls: [
            path.resolve(
              __dirname,
              'integration/me-they-weird path-success.json',
            ),
          ],
        }).verify();
      });

      describe('with some broker args but no broker URL', () => {
        it('should return a successful promise', async () => {
          await verifierFactory({
            ...DEFAULT_ARGS,
            providerBaseUrl,
            pactUrls: [
              path.resolve(
                __dirname,
                'integration/me-they-weird path-success.json',
              ),
            ],
            // These don't mean anything without a broker URL, but should not fail the verification
            enablePending: true,
            consumerVersionSelectors: [{ latest: true }],
            consumerVersionTags: ['main'],
            publishVerificationResult: true,
          }).verify();
        });
      });
    });

    describe('without provider states', () => {
      it('should return a successful promise with detailed JSON results', async () => {
        const results = await verifierFactory({
          providerBaseUrl,
          pactUrls: [
            path.resolve(__dirname, 'integration/me-they-success.json'),
          ],
        }).verify();
        const parsed = JSON.parse(results);
        expect(parsed).toHaveProperty('result', true);
        expect(parsed).toHaveProperty('interactionResults');
      });
    });

    describe('with Provider States', () => {
      it('should return a successful promise with detailed JSON results', async () => {
        const results = await verifierFactory({
          providerBaseUrl,
          pactUrls: [
            path.resolve(__dirname, 'integration/me-they-states.json'),
          ],
          providerStatesSetupUrl,
        }).verify();
        const parsed = JSON.parse(results);
        expect(parsed).toHaveProperty('result', true);
      });
    });

    describe('with POST data', () => {
      it('should return a successful promise', async () => {
        await verifierFactory({
          providerBaseUrl,
          pactUrls: [
            path.resolve(__dirname, 'integration/me-they-post-success.json'),
          ],
        }).verify();
      });
    });

    describe('with POST data and regex validation', () => {
      it('should return a successful promise', async () => {
        await verifierFactory({
          providerBaseUrl,
          pactUrls: [
            path.resolve(
              __dirname,
              'integration/me-they-post-regex-success.json',
            ),
          ],
        }).verify();
      });
    });

    describe('with monkeypatch file specified', () => {
      it('should return a successful promise', async () => {
        await verifierFactory({
          providerBaseUrl,
          pactUrls: [
            path.resolve(__dirname, 'integration/me-they-success.json'),
          ],
          monkeypatch: monkeypatchFile,
        } as VerifierOptions).verify();
      });
    });
  });

  describe('when given a failing contract', () => {
    it('should return a rejected promise with detailed JSON results in the error message', async () => {
      const err = await verifierFactory({
        providerBaseUrl,
        pactUrls: [path.resolve(__dirname, 'integration/me-they-fail.json')],
      })
        .verify()
        .catch((e: Error) => e);
      expect(err).toBeInstanceOf(Error);
      const parsed = JSON.parse((err as Error).message);
      expect(parsed).toHaveProperty('result', false);
      expect(parsed).toHaveProperty('errors');
    });
  });

  describe('when given multiple successful API calls in a contract', () => {
    it('should return a successful promise', async () => {
      await verifierFactory({
        providerBaseUrl,
        pactUrls: [path.resolve(__dirname, 'integration/me-they-multi.json')],
        providerStatesSetupUrl,
      }).verify();
    });
  });

  describe('when given multiple contracts', () => {
    describe('from a local file', () => {
      it('should return a successful promise', async () => {
        await verifierFactory({
          providerBaseUrl,
          pactUrls: [
            path.resolve(__dirname, 'integration/me-they-success.json'),
            path.resolve(__dirname, 'integration/me-they-multi.json'),
          ],
          providerStatesSetupUrl,
        }).verify();
      });
    });

    // Tests failing due to rust panic:
    //
    // thread '<unnamed>' panicked at 'Cannot drop a runtime in a context where blocking is not allowed. This happens when a runtime is dropped from within an asynchronous context
    // with RUST_BACKTRACE=1 it seems that it relates to fetching from the broker, and something bad
    // is happening in reqwest
    describe('from a Pact Broker', () => {
      describe('without authentication', () => {
        it('should return a successful promise', async () => {
          await verifierFactory({
            providerBaseUrl,
            pactUrls: [
              `${pactBrokerBaseUrl}/noauth/pacts/provider/they/consumer/me/latest`,
              `${pactBrokerBaseUrl}/noauth/pacts/provider/they/consumer/anotherclient/latest`,
            ],
            providerStatesSetupUrl,
          }).verify();
        });
      });

      describe('with authentication', () => {
        describe('and a valid user/password', () => {
          it('should return a successful promise', async () => {
            await verifierFactory({
              providerBaseUrl,
              pactUrls: [
                `${pactBrokerBaseUrl}/pacts/provider/they/consumer/me/latest`,
                `${pactBrokerBaseUrl}/pacts/provider/they/consumer/anotherclient/latest`,
              ],
              providerStatesSetupUrl,
              pactBrokerUsername: 'foo',
              pactBrokerPassword: 'bar',
            }).verify();
          });
        });

        describe('and an invalid user/password', () => {
          it('should return a rejected promise', async () => {
            await expect(
              verifierFactory({
                providerBaseUrl,
                pactUrls: [
                  `${pactBrokerBaseUrl}/pacts/provider/they/consumer/me/latest`,
                  `${pactBrokerBaseUrl}/pacts/provider/they/consumer/anotherclient/latest`,
                ],
                providerStatesSetupUrl,
                pactBrokerUsername: 'foo',
                pactBrokerPassword: 'baaoeur',
              }).verify(),
            ).rejects.toBeDefined();
          });

          it('should return the verifier error output in the returned promise', async () => {
            await expect(
              verifierFactory({
                providerBaseUrl,
                pactUrls: [
                  `${pactBrokerBaseUrl}/pacts/provider/they/consumer/me/latest`,
                  `${pactBrokerBaseUrl}/pacts/provider/they/consumer/anotherclient/latest`,
                ],
                providerStatesSetupUrl,
                pactBrokerUsername: 'foo',
                pactBrokerPassword: 'baaoeur',
              }).verify(),
            ).rejects.toBeDefined();
          });
        });
      });
    });
  });

  describe('when publishing verification results to a Pact Broker', () => {
    describe('and there is a valid Pact file with spaces in the path', () => {
      it('should return a successful promise', async () => {
        await verifierFactory({
          providerBaseUrl,
          pactUrls: [
            path.resolve(
              __dirname,
              'integration/publish-verification-example weird path-success.json',
            ),
          ],
          providerStatesSetupUrl,
        }).verify();
      });
    });

    describe('and there is a valid verification HAL link in the Pact file', () => {
      it('should return a successful promise', async () => {
        await verifierFactory({
          providerBaseUrl,
          pactUrls: [
            path.resolve(
              __dirname,
              'integration/publish-verification-example-success.json',
            ),
          ],
          providerStatesSetupUrl,
        }).verify();
      });
    });

    describe('and there is an invalid verification HAL link in the Pact file', () => {
      it('should fail with an error', async () => {
        await verifierFactory({
          providerBaseUrl,
          pactUrls: [
            path.resolve(
              __dirname,
              'integration/publish-verification-example-fail.json',
            ),
          ],
          providerStatesSetupUrl,
        }).verify();
      });
    });
  });
});
