import * as path from 'node:path';
import * as sinon from 'sinon';
import logger from '../logger';
import type { ConsumerVersionSelector, VerifierOptions } from './types';
import { validateOptions } from './validateOptions';

describe('Verifier argument validator', () => {
  // This spec largely tests the validation capabilties of the verifier
  // It's a slightly modified version of the spec we had with the ruby
  // verifier. I'd like to update it so that it better tests the behaviour
  // of the verifier rather than just checking for errors.
  const currentDir = process?.mainModule ? process.mainModule.filename : '';

  const expectSuccessWith = (options: VerifierOptions) => {
    expect(validateOptions(options)).toEqual(options);
  };

  beforeEach(() => {
    sinon.restore();
  });

  describe('when automatically finding pacts from a broker', () => {
    describe('when not given --pact-urls and only --pact-broker-url', () => {
      it('should fail with an error because provider is missing', () => {
        expect(() =>
          validateOptions({
            providerBaseUrl: 'http://localhost',
            pactBrokerUrl: 'http://foo.com',
          }),
        ).toThrow(/pactBrokerUrl requires the following properties/);
      });
    });

    describe('when given valid arguments', () => {
      it('should return a Verifier object', () => {
        expectSuccessWith({
          providerBaseUrl: 'http://localhost',
          pactBrokerUrl: 'http://foo.com',
          pactUrls: ['http://idontexist'],
          provider: 'someprovider',
        });
      });
    });

    describe('when given an unknown array argument', () => {
      it('should return a Verifier object', () => {
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

  describe('when not given --pact-urls or --provider-base-url', () => {
    it('should fail with an error', () => {
      expect(() => validateOptions({} as VerifierOptions)).toThrow(Error);
    });
  });

  describe('when given an invalid timeout', () => {
    it('should fail with an error', () => {
      expect(() => {
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          timeout: -10,
        });
      }).toThrow(Error);
    });
  });

  describe("when given remote Pact URLs that don't exist", () => {
    it('should pass through to the Pact Verifier regardless', () => {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
        }),
      ).not.toThrow(Error);
    });
  });

  describe('when given local Pact URLs that do exist', () => {
    it('should not fail', () => {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
        }),
      ).not.toThrow(Error);
    });
  });

  describe('when requested to publish verification results to a Pact Broker', () => {
    describe('and specifies a provider version', () => {
      it('should pass through to the Pact Verifier', () => {
        expect(() =>
          validateOptions({
            providerBaseUrl: 'http://localhost',
            pactUrls: ['http://idontexist'],
            publishVerificationResult: true,
            providerVersion: '1.0.0',
          }),
        ).not.toThrow(Error);
      });
    });

    describe('and does not specify provider version', () => {
      it('should fail with an error', () => {
        expect(() =>
          validateOptions({
            providerBaseUrl: 'http://localhost',
            pactUrls: ['http://idontexist'],
            publishVerificationResult: true,
          }),
        ).toThrow(
          /publishVerificationResult requires the following properties/,
        );
      });
    });
  });

  describe('when given the correct arguments', () => {
    it('should return a Verifier object', () => {
      expectSuccessWith({
        providerBaseUrl: 'http://localhost',
        pactUrls: ['http://idontexist'],
      });
    });
  });

  describe('when using includeWipPactsSince', () => {
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
        }),
      ).toThrow(Error);
    });
  });

  describe('when an using format option', () => {
    it("should work with either 'json' or 'xml'", () => {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          format: 'xml',
        } as VerifierOptions),
      ).not.toThrow(Error);
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          format: 'json',
        } as VerifierOptions),
      ).not.toThrow(Error);
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          format: 'progress',
        } as VerifierOptions),
      ).not.toThrow(Error);
    });

    it('should work with a case insensitive string', () => {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          format: 'XML',
        } as unknown as VerifierOptions),
      ).not.toThrow(Error);
    });
  });

  describe('when pactBrokerUrl is not provided', () => {
    it('should not fail', () => {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          provider: 'provider',
          pactUrls: [path.dirname(currentDir)],
        }),
      ).not.toThrow(Error);
    });
  });

  describe('when pactBrokerUrl is provided', () => {
    it('should not fail', () => {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
          pactBrokerUrl: 'http://localhost',
          provider: 'provider',
        }),
      ).not.toThrow(Error);
    });
  });

  describe('when consumerVersionTags is not provided', () => {
    it('should not fail', () => {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
        }),
      ).not.toThrow(Error);
    });
  });

  describe('when consumerVersionTags is provided as an array', () => {
    it('should not fail', () => {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
          consumerVersionTags: ['tag-1'],
        }),
      ).not.toThrow(Error);
    });
  });

  describe('when providerVersionTags is not provided', () => {
    it('should not fail', () => {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
        }),
      ).not.toThrow(Error);
    });
  });

  describe('when providerVersionTags is provided as an array', () => {
    it('should not fail', () => {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          pactUrls: [path.dirname(currentDir)],
          providerVersionTags: ['tag-1'],
        }),
      ).not.toThrow(Error);
    });
  });

  describe('when using a bearer token', () => {
    describe('and specifies a username or password', () => {
      it('should fail with an error', () => {
        expect(() =>
          validateOptions({
            providerBaseUrl: 'http://localhost',
            pactUrls: ['http://idontexist'],
            pactBrokerToken: '1234',
            pactBrokerUsername: 'username',
            pactBrokerPassword: '5678',
          }),
        ).toThrow(Error);
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

  describe('when providing consumerVersionSelectors', () => {
    describe('and an unsupported selector is specified', () => {
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
            "The consumer version selector 'unsupportedFlag'",
          ),
        ).toBeTruthy();
      });
    });
  });

  describe('and the tag of "latest" is specified', () => {
    it('should log out a warning that using this selector is not recommended', () => {
      const warnSpy = sinon.spy(logger, 'warn');

      expectSuccessWith({
        providerBaseUrl: 'http://localhost',
        pactUrls: ['http://idontexist'],
        consumerVersionSelectors: [{ tag: 'latest' }],
      });

      expect(
        warnSpy.calledWith(
          "Using the tag 'latest' is not recommended and probably does not do what you intended.",
        ),
      ).toBeTruthy();
    });
  });

  describe('and valid selectors are specified', () => {
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
        consumerVersionSelector,
      )}`, () => {
        expectSuccessWith({
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
          consumerVersionSelectors: [consumerVersionSelector],
        });
      });
    });
  });

  describe('when given customProviderHeaders', () => {
    describe('using the object notation', () => {
      it('should pass through to the Pact Verifier', () => {
        expect(() =>
          validateOptions({
            providerBaseUrl: 'http://localhost',
            customProviderHeaders: { my: 'header' },
          }),
        ).not.toThrow(Error);
      });
    });

    describe('using the legacy array notation', () => {
      it('should pass through to the Pact Verifier', () => {
        expect(() =>
          validateOptions({
            providerBaseUrl: 'http://localhost',
            customProviderHeaders: ['My: Header'],
          }),
        ).not.toThrow(Error);
      });

      describe('and the format is incorrect', () => {
        it('should throw an error', () => {
          expect(() =>
            validateOptions({
              providerBaseUrl: 'http://localhost',
              customProviderHeaders: [1 as unknown as string],
            }),
          ).toThrow(Error);
        });
      });
    });
  });

  describe('when given providerBranch', () => {
    it('should not throw an error', () => {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          providerVersionBranch: 'blah',
        }),
      ).not.toThrow(Error);
    });
  });

  describe('when given unknown properties', () => {
    it('should ignore them and not throw an error', () => {
      expect(() =>
        validateOptions({
          providerBaseUrl: 'http://localhost',
          randomobjectwithnorules: 'poop',
        } as any as VerifierOptions),
      ).not.toThrow(Error);
    });
  });
});
