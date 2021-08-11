import verifierFactory from '../src/verifier';
import chai = require('chai');
import path = require('path');
import chaiAsPromised = require('chai-as-promised');
import providerMock from './integration/provider-mock';
import * as http from 'http';
import { VerifierOptions } from '../src/verifier/types';
import { LogLevel } from '../src/logger/types';

const expect = chai.expect;
chai.use(chaiAsPromised);

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

  before(() =>
    providerMock(PORT).then((s) => {
      console.log(`Pact Broker Mock listening on port: ${PORT}`);
      server = s;
    })
  );

  after(() => server.close());

  context('when given a successful contract', () => {
    context('with spaces in the file path', () => {
      it('should return a successful promise', () =>
        expect(
          verifierFactory({
            ...DEFAULT_ARGS,
            providerBaseUrl: providerBaseUrl,
            pactUrls: [
              path.resolve(
                __dirname,
                'integration/me-they-weird path-success.json'
              ),
            ],
          }).verify()
        ).to.eventually.be.fulfilled);
    });

    context('without provider states', () => {
      it('should return a successful promise', () =>
        expect(
          verifierFactory({
            providerBaseUrl: providerBaseUrl,
            pactUrls: [
              path.resolve(__dirname, 'integration/me-they-success.json'),
            ],
          }).verify()
        ).to.eventually.be.fulfilled);
    });

    context('with Provider States', () => {
      it('should return a successful promise', () =>
        expect(
          verifierFactory({
            providerBaseUrl: providerBaseUrl,
            pactUrls: [
              path.resolve(__dirname, 'integration/me-they-states.json'),
            ],
            providerStatesSetupUrl: providerStatesSetupUrl,
          }).verify()
        ).to.eventually.be.fulfilled);
    });

    context('with POST data', () => {
      it('should return a successful promise', () =>
        expect(
          verifierFactory({
            providerBaseUrl: providerBaseUrl,
            pactUrls: [
              path.resolve(__dirname, 'integration/me-they-post-success.json'),
            ],
          }).verify()
        ).to.eventually.be.fulfilled);
    });

    context('with POST data and regex validation', () => {
      it('should return a successful promise', () =>
        expect(
          verifierFactory({
            providerBaseUrl: providerBaseUrl,
            pactUrls: [
              path.resolve(
                __dirname,
                'integration/me-they-post-regex-success.json'
              ),
            ],
          }).verify()
        ).to.eventually.be.fulfilled);
    });

    context('with monkeypatch file specified', () => {
      it('should return a successful promise', () =>
        expect(
          verifierFactory({
            providerBaseUrl: providerBaseUrl,
            pactUrls: [
              path.resolve(__dirname, 'integration/me-they-success.json'),
            ],
            monkeypatch: monkeypatchFile,
          } as VerifierOptions).verify()
        ).to.eventually.be.fulfilled);
    });
  });

  context('when given a failing contract', () => {
    it('should return a rejected promise', () =>
      expect(
        verifierFactory({
          providerBaseUrl: providerBaseUrl,
          pactUrls: [path.resolve(__dirname, 'integration/me-they-fail.json')],
        }).verify()
      ).to.eventually.be.rejected);
  });

  context('when given multiple successful API calls in a contract', () => {
    it('should return a successful promise', () =>
      expect(
        verifierFactory({
          providerBaseUrl: providerBaseUrl,
          pactUrls: [path.resolve(__dirname, 'integration/me-they-multi.json')],
          providerStatesSetupUrl: providerStatesSetupUrl,
        }).verify()
      ).to.eventually.be.fulfilled);
  });

  context('when given multiple contracts', () => {
    context('from a local file', () => {
      it('should return a successful promise', () =>
        expect(
          verifierFactory({
            providerBaseUrl: providerBaseUrl,
            pactUrls: [
              path.resolve(__dirname, 'integration/me-they-success.json'),
              path.resolve(__dirname, 'integration/me-they-multi.json'),
            ],
            providerStatesSetupUrl: providerStatesSetupUrl,
          }).verify()
        ).to.eventually.be.fulfilled);
    });

    context('from a Pact Broker', () => {
      context('without authentication', () => {
        it('should return a successful promise', () =>
          expect(
            verifierFactory({
              providerBaseUrl: providerBaseUrl,
              pactUrls: [
                `${pactBrokerBaseUrl}/noauth/pacts/provider/they/consumer/me/latest`,
                `${pactBrokerBaseUrl}/noauth/pacts/provider/they/consumer/anotherclient/latest`,
              ],
              providerStatesSetupUrl: providerStatesSetupUrl,
            }).verify()
          ).to.eventually.be.fulfilled);
      });

      context('with authentication', () => {
        context('and a valid user/password', () => {
          it('should return a successful promise', () =>
            expect(
              verifierFactory({
                providerBaseUrl: providerBaseUrl,
                pactUrls: [
                  `${pactBrokerBaseUrl}/pacts/provider/they/consumer/me/latest`,
                  `${pactBrokerBaseUrl}/pacts/provider/they/consumer/anotherclient/latest`,
                ],
                providerStatesSetupUrl: providerStatesSetupUrl,
                pactBrokerUsername: 'foo',
                pactBrokerPassword: 'bar',
              }).verify()
            ).to.eventually.be.fulfilled);
        });

        context('and an invalid user/password', () => {
          it('should return a rejected promise', () =>
            expect(
              verifierFactory({
                providerBaseUrl: providerBaseUrl,
                pactUrls: [
                  `${pactBrokerBaseUrl}/pacts/provider/they/consumer/me/latest`,
                  `${pactBrokerBaseUrl}/pacts/provider/they/consumer/anotherclient/latest`,
                ],
                providerStatesSetupUrl: providerStatesSetupUrl,
                pactBrokerUsername: 'foo',
                pactBrokerPassword: 'baaoeur',
              }).verify()
            ).to.eventually.be.rejected);

          it('should return the verifier error output in the returned promise', () =>
            expect(
              verifierFactory({
                providerBaseUrl: providerBaseUrl,
                pactUrls: [
                  `${pactBrokerBaseUrl}/pacts/provider/they/consumer/me/latest`,
                  `${pactBrokerBaseUrl}/pacts/provider/they/consumer/anotherclient/latest`,
                ],
                providerStatesSetupUrl: providerStatesSetupUrl,
                pactBrokerUsername: 'foo',
                pactBrokerPassword: 'baaoeur',
              }).verify()
            ).to.eventually.be.rejected);
        });
      });
    });
  });

  context('when publishing verification results to a Pact Broker', () => {
    context('and there is a valid Pact file with spaces in the path', () => {
      it('should return a successful promise', () =>
        expect(
          verifierFactory({
            providerBaseUrl: providerBaseUrl,
            pactUrls: [
              path.resolve(
                __dirname,
                'integration/publish-verification-example weird path-success.json'
              ),
            ],
            providerStatesSetupUrl: providerStatesSetupUrl,
          }).verify()
        ).to.eventually.be.fulfilled);
    });

    context(
      'and there is a valid verification HAL link in the Pact file',
      () => {
        it('should return a successful promise', () =>
          expect(
            verifierFactory({
              providerBaseUrl: providerBaseUrl,
              pactUrls: [
                path.resolve(
                  __dirname,
                  'integration/publish-verification-example-success.json'
                ),
              ],
              providerStatesSetupUrl: providerStatesSetupUrl,
            }).verify()
          ).to.eventually.be.fulfilled);
      }
    );

    context(
      'and there is an invalid verification HAL link in the Pact file',
      () => {
        it('should fail with an error', () =>
          expect(
            verifierFactory({
              providerBaseUrl: providerBaseUrl,
              pactUrls: [
                path.resolve(
                  __dirname,
                  'integration/publish-verification-example-fail.json'
                ),
              ],
              providerStatesSetupUrl: providerStatesSetupUrl,
            }).verify()
          ).to.eventually.be.fulfilled);
      }
    );
  });
});
