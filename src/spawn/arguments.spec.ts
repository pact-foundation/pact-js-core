import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import argsHelper, { DEFAULT_ARG } from './arguments';

const expect = chai.expect;

chai.use(chaiAsPromised);

describe('Pact Util Spec', () => {
  describe('toArgumentsArray', () => {
    describe('when called with an object', () => {
      it('should return an array of all arguments', () => {
        const result = argsHelper.toArgumentsArray(
          { providerBaseUrl: 'http://localhost' },
          { providerBaseUrl: '--provider-base-url' }
        );
        expect(result).to.be.an('array').that.includes('--provider-base-url');
        expect(result.length).to.be.equal(2);
      });

      it('should wrap its argument values in quotes', () => {
        const result = argsHelper.toArgumentsArray(
          {
            providerBaseUrl: 'http://localhost',
            pactUrls: ['http://idontexist'],
          },
          {
            providerBaseUrl: '--provider-base-url',
            pactUrls: '--pact-urls',
          }
        );
        expect(result).to.include('--provider-base-url');
        expect(result).to.include('http://localhost');
        expect(result).to.include('--pact-urls');
        expect(result).to.include('http://idontexist');
      });
      describe("and the argument's value is also an object", () => {
        it('should serialise the argument value to a JSON string', () => {
          const result = argsHelper.toArgumentsArray(
            {
              consumerVersionSelectors: [
                {
                  latest: true,
                  tag: 'prod',
                },
                {
                  tag: 'bar',
                },
              ],
            },
            { consumerVersionSelectors: '--consumer-version-selector' }
          );

          expect(result)
            .to.be.an('array')
            .that.includes('--consumer-version-selector')
            .and.includes('{"latest":true,"tag":"prod"}')
            .and.includes('{"tag":"bar"}');
          expect(result.length).to.be.equal(4);
        });
      });
    });
    describe('when called with an array', () => {
      describe('with one element', () => {
        it('should return an array of all arguments', () => {
          const result = argsHelper.toArgumentsArray(
            [{ providerBaseUrl: 'http://localhost' }],
            {
              providerBaseUrl: '--provider-base-url',
            }
          );
          expect(result).to.be.an('array').that.includes('--provider-base-url');
          expect(result.length).to.be.equal(2);
        });

        it('should produce correct arguments array', () => {
          const result = argsHelper.toArgumentsArray(
            [
              {
                providerBaseUrl: 'http://localhost',
                pactUrls: ['http://idontexist'],
              },
            ],
            {
              providerBaseUrl: '--provider-base-url',
              pactUrls: '--pact-urls',
            }
          );
          expect(result).to.include('--provider-base-url');
          expect(result).to.include('http://localhost');
          expect(result).to.include('--pact-urls');
          expect(result).to.include('http://idontexist');
        });
      });
      describe('with multiple elements', () => {
        it('should produce correct arguments array', () => {
          const result = argsHelper.toArgumentsArray(
            [
              { participant: 'one' },
              { version: 'v1' },
              { participant: 'two' },
              { version: 'v2' },
            ],
            { version: '--version', participant: '--participant' }
          );

          expect(result).to.be.an('array');
          expect(result).to.eql([
            '--participant',
            'one',
            '--version',
            'v1',
            '--participant',
            'two',
            '--version',
            'v2',
          ]);
        });
      });
      describe("and an argument's value is an object", () => {
        it('should serialise the argument value to a JSON string', () => {
          const result = argsHelper.toArgumentsArray(
            [
              {
                consumerVersionSelectors: [
                  {
                    latest: true,
                    tag: 'prod',
                  },
                ],
              },
              {
                consumerVersionSelectors: [
                  {
                    tag: 'foo',
                  },
                ],
              },
            ],
            { consumerVersionSelectors: '--consumer-version-selector' }
          );

          expect(result)
            .to.be.an('array')
            .that.includes('--consumer-version-selector')
            .and.includes('{"latest":true,"tag":"prod"}')
            .and.includes('{"tag":"foo"}');
          expect(result.length).to.be.equal(4);
        });
      });
    });

    it('should make DEFAULT values first, everything else after', () => {
      const result = argsHelper.toArgumentsArray(
        {
          providerBaseUrl: 'http://localhost',
          pactUrls: ['http://idontexist'],
        },
        {
          providerBaseUrl: '--provider-base-url',
          pactUrls: DEFAULT_ARG,
        }
      );
      expect(result.length).to.be.equal(3);
      expect(result[0]).to.be.equal('http://idontexist');
    });
  });
});
