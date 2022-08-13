import path = require('path');
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import * as sinon from 'sinon';
import logger from '../logger';
import { validateOptions } from './validateOptions';
import { ConsumerVersionSelector, VerifierOptions } from './types';

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
    expect(validateOptions(options)).to.deep.equal(options);
  };

  beforeEach(() => {
    sinon.restore();
  });

  context('when automatically finding pacts from a broker', () => {
    context('when not given --pact-urls and only --pact-broker-url', () => {
      it('should fail with an error because provider is missing', () => {
        expect(() =>
          validateOptions({
            providerBaseUrl: 'http://localhost',
            pactBrokerUrl: 'http://foo.com',
          })
        ).to.throw(/pactBrokerUrl requires the following properties/);
      });
    });

    context('when given valid arguments', () => {
      it('should return a Verifier object', () => {
        expectSuccessWith({
          providerBaseUrl: 'http://localhost',
          pactBrokerUrl: 'http://foo.com',
          pactUrls: ['http://idontexist'],
          provider: 'someprovider',
        });
      });
    });
  });

  context('when not given --pact-urls or --provider-base-url', () => {
    it('should fail with an error', () => {
      expect(() => validateOptions({} as VerifierOptions)).to.throw(Error);
    });
  });

  context('when given an invalid timeout', () => {
    it('should fail with an error', () => {
      expect(() => {
        validateOptions({
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
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
        })
      ).to.not.throw(Error);
    });
  });

  context('when given local Pact URLs that do exist', () => {
    it('should not fail', () => {
      expect(() =>
        validateOptions({
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
            validateOptions({
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
            validateOptions({
              providerBaseUrl: 'http://localhost',
              pactUrls: ['http://idontexist'],
              publishVerificationResult: true,
            })
          ).to.throw(
            /publishVerificationResult requires the following properties/
          );
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
        validateOptions({
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
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          format: 'xml',
        } as VerifierOptions)
      ).to.not.throw(Error);
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          format: 'json',
        } as VerifierOptions)
      ).to.not.throw(Error);
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          format: 'progress',
        } as VerifierOptions)
      ).to.not.throw(Error);
    });

    it('should work with a case insensitive string', () => {
      expect(() =>
        validateOptions({
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
        validateOptions({
          providerBaseUrl: 'http://localhost',
          provider: 'provider',
          pactUrls: [path.dirname(currentDir)],
        })
      ).to.not.throw(Error);
    });
  });

  context('when pactBrokerUrl is provided', () => {
    it('should not fail', () => {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
          pactBrokerUrl: 'http://localhost',
          provider: 'provider',
        })
      ).to.not.throw(Error);
    });
  });

  context('when consumerVersionTags is not provided', () => {
    it('should not fail', () => {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
        })
      ).to.not.throw(Error);
    });
  });

  context('when consumerVersionTags is provided as an array', () => {
    it('should not fail', () => {
      expect(() =>
        validateOptions({
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
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
        })
      ).to.not.throw(Error);
    });
  });

  context('when providerVersionTags is provided as an array', () => {
    it('should not fail', () => {
      expect(() =>
        validateOptions({
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
          validateOptions({
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

  context('when providing consumerVersionSelectors', () => {
    context('and an unsupported selector is specified', () => {
      it('should log out a warning that the selector is unknown', () => {
        const warnSpy = sinon.spy(logger, 'warn');

        expectSuccessWith({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          consumerVersionSelectors: [
            { unsupportedFlag: true } as ConsumerVersionSelector,
          ],
        });

        expect(
          warnSpy.calledWithMatch(
            "The consumer version selector 'unsupportedFlag'"
          )
        ).to.be.ok;
      });
    });
  });

  context('and the tag of "latest" is specified', () => {
    it('should log out a warning that using this selector is not recommended', () => {
      const warnSpy = sinon.spy(logger, 'warn');

      expectSuccessWith({
        providerBaseUrl: 'http://localhost',
        pactUrls: ['http://idontexist'],
        consumerVersionSelectors: [{ tag: 'latest' }],
      });

      expect(
        warnSpy.calledWith(
          "Using the tag 'latest' is not recommended and probably does not do what you intended."
        )
      ).to.be.ok;
    });
  });

  context('and valid selectors are specified', () => {
    [
      { tag: 'a-tag' },
      { latest: true },
      { consumer: 'the-consumer' },
      { deployedOrReleased: true },
      { deployed: true },
      { released: true },
      { environment: 'an-environment' },
      { fallbackTag: 'a-fallback-tag' },
      { branch: 'the-branch' },
      { mainBranch: false },
      { matchingBranch: true },
    ].forEach((consumerVersionSelector) => {
      it(`should not fail when consumerVersionSelectors is ${JSON.stringify(
        consumerVersionSelector
      )}`, () => {
        expectSuccessWith({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          consumerVersionSelectors: [consumerVersionSelector],
        });
      });
    });
  });

  context.only('when given customProviderHeaders', () => {
    context('using the object notation', () => {
      it('should pass through to the Pact Verifier', () => {
        expect(() =>
          validateOptions({
            providerBaseUrl: 'http://localhost',
            customProviderHeaders: { my: 'header' },
          })
        ).to.not.throw(Error);
      });
    });

    context('using the legacy array notation', () => {
      it('should pass through to the Pact Verifier', () => {
        expect(() =>
          validateOptions({
            providerBaseUrl: 'http://localhost',
            customProviderHeaders: ['My: Header'],
          })
        ).to.not.throw(Error);
      });

      context('and the format is incorrect', () => {
        it('should throw an error', () => {
          expect(() =>
            validateOptions({
              providerBaseUrl: 'http://localhost',
              customProviderHeaders: [1 as unknown as string],
            })
          ).to.throw(Error);
        });
      });
    });
  });
});
