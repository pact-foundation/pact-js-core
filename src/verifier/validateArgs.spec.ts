import path = require('path');
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { validateArgs } from './validateArgs';
import { VerifierOptions } from './types';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Verifier argument validator', () => {
  // This spec largely tests the validation capabilties of the verifier
  // It's a slightly modified version of the spec we had with the ruby
  // verifier. I'd like to update it so that it better tests the behaviour
  // of the verifier rather than just checking for errors.
  const currentDir =
    process && process.mainModule ? process.mainModule.filename : '';

  const expectSuccessWith = (options: VerifierOptions) => {
    expect(validateArgs(options)).to.deep.equal(options);
  };

  context('when automatically finding pacts from a broker', () => {
    context('when not given --pact-urls and only --provider', () => {
      it('should fail with an error because pactUrls or pactBrokerUrl is required', () => {
        expect(() =>
          validateArgs({
            providerBaseUrl: 'http://localhost',
            provider: 'someprovider',
          })
        ).to.throw(Error);
      });
    });

    context('when not given --pact-urls and only --pact-broker-url', () => {
      it('should fail with an error because provider is missing', () => {
        expect(() =>
          validateArgs({
            providerBaseUrl: 'http://localhost',
            pactBrokerUrl: 'http://foo.com',
          })
        ).to.throw(Error);
      });
    });

    context('when given valid arguments', () => {
      it('should return a Verifier object', () => {
        expectSuccessWith({
          providerBaseUrl: 'http://localhost',
          pactBrokerUrl: 'http://foo.com',
          provider: 'someprovider',
        });
      });
    });
  });

  context('when not given --pact-urls or --provider-base-url', () => {
    it('should fail with an error', () => {
      expect(() => validateArgs({} as VerifierOptions)).to.throw(Error);
    });
  });

  context('when given --provider-states-setup-url', () => {
    it('should fail with an error', () => {
      expect(() =>
        validateArgs({
          providerStatesSetupUrl: 'http://foo/provider-states/setup',
        } as VerifierOptions)
      ).to.throw(Error);
    });
  });

  context('when given an invalid timeout', () => {
    it('should fail with an error', () => {
      expect(() => {
        validateArgs({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          timeout: -10,
        });
      }).to.throw(Error);
    });
  });

  context("when given remote Pact URLs that don't exist", () => {
    it('should pass through to the Pact Verifier regardless', () => {
      expect(() =>
        validateArgs({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
        })
      ).to.not.throw(Error);
    });
  });

  context('when given local Pact URLs that do exist', () => {
    it('should not fail', () => {
      expect(() =>
        validateArgs({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
        })
      ).to.not.throw(Error);
    });
  });

  context(
    'when requested to publish verification results to a Pact Broker',
    () => {
      context('and specifies a provider version', () => {
        it('should pass through to the Pact Verifier', () => {
          expect(() =>
            validateArgs({
              providerBaseUrl: 'http://localhost',
              pactUrls: ['http://idontexist'],
              publishVerificationResult: true,
              providerVersion: '1.0.0',
            })
          ).to.not.throw(Error);
        });
      });
    }
  );

  context(
    'when requested to publish verification results to a Pact Broker',
    () => {
      context('and does not specify provider version', () => {
        it('should fail with an error', () => {
          expect(() =>
            validateArgs({
              providerBaseUrl: 'http://localhost',
              pactUrls: ['http://idontexist'],
              publishVerificationResult: true,
            })
          ).to.throw(Error);
        });
      });
    }
  );

  context('when given the correct arguments', () => {
    it('should return a Verifier object', () => {
      expectSuccessWith({
        providerBaseUrl: 'http://localhost',
        pactUrls: ['http://idontexist'],
      });
    });
  });

  context('when using includeWipPactsSince', () => {
    it('should accept a non-empty string', () => {
      expectSuccessWith({
        providerBaseUrl: 'http://localhost',
        pactUrls: ['http://idontexist'],
        includeWipPactsSince: 'thisshouldactuallybeadate',
      });
    });

    it('should not accept an empty string', () => {
      expect(() =>
        validateArgs({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          includeWipPactsSince: '',
        })
      ).to.throw(Error);
    });
  });

  context('when an using format option', () => {
    it("should work with either 'json' or 'xml'", () => {
      expect(() =>
        validateArgs({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          format: 'xml',
        } as VerifierOptions)
      ).to.not.throw(Error);
      expect(() =>
        validateArgs({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          format: 'json',
        } as VerifierOptions)
      ).to.not.throw(Error);
      expect(() =>
        validateArgs({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          format: 'progress',
        })
      ).to.not.throw(Error);
    });

    it('should work with a case insensitive string', () => {
      expect(() =>
        validateArgs({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          format: 'XML',
        } as unknown as VerifierOptions)
      ).to.not.throw(Error);
    });
  });

  context('when pactBrokerUrl is not provided', () => {
    it('should not fail', () => {
      expect(() =>
        validateArgs({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
        })
      ).to.not.throw(Error);
    });
  });

  context('when pactBrokerUrl is provided', () => {
    it('should not fail', () => {
      expect(() =>
        validateArgs({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
          pactBrokerUrl: 'http://localhost',
        })
      ).to.not.throw(Error);
    });
  });

  context('when consumerVersionTags is not provided', () => {
    it('should not fail', () => {
      expect(() =>
        validateArgs({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
        })
      ).to.not.throw(Error);
    });
  });

  context('when consumerVersionTags is provided as a string', () => {
    it('should not fail', () => {
      expect(() =>
        validateArgs({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
          consumerVersionTags: 'tag-1',
        })
      ).to.not.throw(Error);
    });
  });

  context('when consumerVersionTags is provided as an array', () => {
    it('should not fail', () => {
      expect(() =>
        validateArgs({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
          consumerVersionTags: ['tag-1'],
        })
      ).to.not.throw(Error);
    });
  });

  context('when providerVersionTags is not provided', () => {
    it('should not fail', () => {
      expect(() =>
        validateArgs({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
        })
      ).to.not.throw(Error);
    });
  });

  context('when providerVersionTags is provided as a string', () => {
    it('should not fail', () => {
      expect(() =>
        validateArgs({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
          providerVersionTags: 'tag-1',
        })
      ).to.not.throw(Error);
    });
  });

  context('when providerVersionTags is provided as an array', () => {
    it('should not fail', () => {
      expect(() =>
        validateArgs({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
          providerVersionTags: ['tag-1'],
        })
      ).to.not.throw(Error);
    });
  });

  context('when using a bearer token', () => {
    context('and specifies a username or password', () => {
      it('should fail with an error', () => {
        expect(() =>
          validateArgs({
            providerBaseUrl: 'http://localhost',
            pactUrls: ['http://idontexist'],
            pactBrokerToken: '1234',
            pactBrokerUsername: 'username',
            pactBrokerPassword: '5678',
          })
        ).to.throw(Error);
      });
    });
    it('should not fail', () => {
      expectSuccessWith({
        providerBaseUrl: 'http://localhost',
        pactUrls: ['http://idontexist'],
        pactBrokerToken: '1234',
      });
    });
  });
});
