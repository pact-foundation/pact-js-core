import * as path from 'path';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import logger from '../logger';
import { validateOptions } from './validateOptions';
import { ConsumerVersionSelector, VerifierOptions } from './types';

const { expect } = chai;
chai.use(chaiAsPromised);

describe('Verifier argument validator', function() {
  // This spec largely tests the validation capabilties of the verifier
  // It's a slightly modified version of the spec we had with the ruby
  // verifier. I'd like to update it so that it better tests the behaviour
  // of the verifier rather than just checking for errors.
  const currentDir =
    process && process.mainModule ? process.mainModule.filename : '';

  const expectSuccessWith = (options: VerifierOptions) => {
    expect(validateOptions(options)).to.deep.equal(options);
  };

  beforeEach(function() {
    sinon.restore();
  });

  context('when automatically finding pacts from a broker', function() {
    context('when not given --pact-urls and only --pact-broker-url', function() {
      it('should fail with an error because provider is missing', function() {
        expect(() =>
          validateOptions({
            providerBaseUrl: 'http://localhost',
            pactBrokerUrl: 'http://foo.com',
          })
        ).to.throw(/pactBrokerUrl requires the following properties/);
      });
    });

    context('when given valid arguments', function() {
      it('should return a Verifier object', function() {
        expectSuccessWith({
          providerBaseUrl: 'http://localhost',
          pactBrokerUrl: 'http://foo.com',
          pactUrls: ['http://idontexist'],
          provider: 'someprovider',
        });
      });
    });

    context('when given an unknown array argument', function() {
      it('should return a Verifier object', function() {
        expectSuccessWith({
          madeupArg: [''],
          providerBaseUrl: 'http://localhost',
          pactBrokerUrl: 'http://foo.com',
          pactUrls: ['http://idontexist'],
          provider: 'someprovider',
        } as VerifierOptions);
      });
    });
  });

  context('when not given --pact-urls or --provider-base-url', function() {
    it('should fail with an error', function() {
      expect(() => validateOptions({} as VerifierOptions)).to.throw(Error);
    });
  });

  context('when given an invalid timeout', function() {
    it('should fail with an error', function() {
      expect(() => {
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          timeout: -10,
        });
      }).to.throw(Error);
    });
  });

  context("when given remote Pact URLs that don't exist", function() {
    it('should pass through to the Pact Verifier regardless', function() {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
        })
      ).to.not.throw(Error);
    });
  });

  context('when given local Pact URLs that do exist', function() {
    it('should not fail', function() {
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
    function() {
      context('and specifies a provider version', function() {
        it('should pass through to the Pact Verifier', function() {
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

      context('and does not specify provider version', function() {
        it('should fail with an error', function() {
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

  context('when given the correct arguments', function() {
    it('should return a Verifier object', function() {
      expectSuccessWith({
        providerBaseUrl: 'http://localhost',
        pactUrls: ['http://idontexist'],
      });
    });
  });

  context('when using includeWipPactsSince', function() {
    it('should accept a non-empty string', function() {
      expectSuccessWith({
        providerBaseUrl: 'http://localhost',
        pactUrls: ['http://idontexist'],
        includeWipPactsSince: 'thisshouldactuallybeadate',
      });
    });

    it('should not accept an empty string', function() {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          includeWipPactsSince: '',
        })
      ).to.throw(Error);
    });
  });

  context('when an using format option', function() {
    it("should work with either 'json' or 'xml'", function() {
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

    it('should work with a case insensitive string', function() {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          format: 'XML',
        } as unknown as VerifierOptions)
      ).to.not.throw(Error);
    });
  });

  context('when pactBrokerUrl is not provided', function() {
    it('should not fail', function() {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          provider: 'provider',
          pactUrls: [path.dirname(currentDir)],
        })
      ).to.not.throw(Error);
    });
  });

  context('when pactBrokerUrl is provided', function() {
    it('should not fail', function() {
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

  context('when consumerVersionTags is not provided', function() {
    it('should not fail', function() {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
        })
      ).to.not.throw(Error);
    });
  });

  context('when consumerVersionTags is provided as an array', function() {
    it('should not fail', function() {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
          consumerVersionTags: ['tag-1'],
        })
      ).to.not.throw(Error);
    });
  });

  context('when providerVersionTags is not provided', function() {
    it('should not fail', function() {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
        })
      ).to.not.throw(Error);
    });
  });

  context('when providerVersionTags is provided as an array', function() {
    it('should not fail', function() {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
          providerVersionTags: ['tag-1'],
        })
      ).to.not.throw(Error);
    });
  });

  context('when using a bearer token', function() {
    context('and specifies a username or password', function() {
      it('should fail with an error', function() {
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

    it('should not fail', function() {
      expectSuccessWith({
        providerBaseUrl: 'http://localhost',
        pactUrls: ['http://idontexist'],
        pactBrokerToken: '1234',
      });
    });
  });

  context('when providing consumerVersionSelectors', function() {
    context('and an unsupported selector is specified', function() {
      it('should log out a warning that the selector is unknown', function() {
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

  context('and the tag of "latest" is specified', function() {
    it('should log out a warning that using this selector is not recommended', function() {
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

  context('and valid selectors are specified', function() {
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
      )}`, function() {
        expectSuccessWith({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          consumerVersionSelectors: [consumerVersionSelector],
        });
      });
    });
  });

  context('when given customProviderHeaders', function() {
    context('using the object notation', function() {
      it('should pass through to the Pact Verifier', function() {
        expect(() =>
          validateOptions({
            providerBaseUrl: 'http://localhost',
            customProviderHeaders: { my: 'header' },
          })
        ).to.not.throw(Error);
      });
    });

    context('using the legacy array notation', function() {
      it('should pass through to the Pact Verifier', function() {
        expect(() =>
          validateOptions({
            providerBaseUrl: 'http://localhost',
            customProviderHeaders: ['My: Header'],
          })
        ).to.not.throw(Error);
      });

      context('and the format is incorrect', function() {
        it('should throw an error', function() {
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

  context('when given providerBranch', function() {
    it('should not throw an error', function() {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          providerVersionBranch: 'blah',
        })
      ).to.not.throw(Error);
    });
  });

  context('when given unknown properties', function() {
    it('should ignore them and not throw an error', function() {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          randomobjectwithnorules: 'poop',
        } as any as VerifierOptions)
      ).to.not.throw(Error);
    });
  });
});
