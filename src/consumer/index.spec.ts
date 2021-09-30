import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { makeConsumerPact } from '.';
import { FfiSpecificationVersion } from '../ffi/types';
import axios from 'axios';
import path = require('path');
import { setLogLevel } from '../logger';
import { ConsumerPact } from './types';

chai.use(chaiAsPromised);
const expect = chai.expect;

const HOST = '127.0.0.1';

describe('Integration like test for the consumer API', () => {
  setLogLevel('trace');
  let port: number;
  let pact: ConsumerPact;

  beforeEach(() => {
    const like = (value: unknown) => {
      return {
        'pact:matcher:type': 'type',
        value,
      };
    };

    pact = makeConsumerPact(
      'foo-consumer',
      'bar-provider',
      FfiSpecificationVersion.SPECIFICATION_VERSION_V3
    );

    const interaction = pact.newInteraction('some description');

    interaction.uponReceiving('a request to get a dog');
    interaction.given('fido exists');
    interaction.withRequest('GET', '/dogs/1234');
    interaction.withRequestHeader('x-special-header', 0, 'header');
    interaction.withQuery('someParam', 0, 'someValue');
    interaction.withResponseBody(
      JSON.stringify({
        name: like('fido'),
        age: like(23),
        alive: like(true),
      }),
      'application/json'
    );
    interaction.withResponseHeader('x-special-header', 0, 'header');
    interaction.withStatus(200);

    port = pact.createMockServer(HOST);
  });

  it('Generates a pact with success', () => {
    return axios
      .request({
        baseURL: `http://${HOST}:${port}`,
        headers: { Accept: 'application/json', 'x-special-header': 'header' },
        params: {
          someParam: 'someValue',
        },
        method: 'GET',
        url: '/dogs/1234',
      })
      .then((res) => {
        expect(res.data).to.deep.equal({
          name: 'fido',
          age: 23,
          alive: true,
        });
      })
      .then(() => {
        expect(pact.mockServerMatchedSuccessfully(port)).to.be.true;
      })
      .then(() => {
        // You don't have to call this, it's just here to check it works
        const mismatches = pact.mockServerMismatches(port);
        expect(mismatches).to.have.length(0);
      })
      .then(() => {
        pact.writePactFile(port, path.join(__dirname, '__testoutput__'));
      })
      .then(() => {
        pact.cleanupMockServer(port);
      });
  });
  it('Generates a pact with failure', () => {
    return axios
      .request({
        baseURL: `http://${HOST}:${port}`,
        headers: {
          Accept: 'application/json',
          'x-special-header': 'WrongHeader',
        },
        params: {
          someParam: 'wrongValue',
        },
        method: 'GET',
        url: '/dogs/1234',
      })
      .then(
        () => {
          throw new Error(
            'This call is not supposed to succeed during testing'
          );
        },
        (err) => {
          expect(err.message).to.equal('Request failed with status code 500');
        }
      )
      .then(() => {
        const mismatches = pact.mockServerMismatches(port);
        expect(mismatches[0]).to.deep.equal({
          method: 'GET',
          mismatches: [
            {
              actual: 'wrongValue',
              expected: 'someValue',
              mismatch: "Expected 'someValue' to be equal to 'wrongValue'",
              parameter: 'someParam',
              type: 'QueryMismatch',
            },
            {
              actual: 'WrongHeader',
              expected: 'header',
              key: 'x-special-header',
              mismatch:
                "Mismatch with header 'x-special-header': Expected 'header' to be equal to 'WrongHeader'",
              type: 'HeaderMismatch',
            },
          ],
          path: '/dogs/1234',
          type: 'request-mismatch',
        });
      })
      .then(() => {
        // Yes, this writes the pact file.
        // Yes, even though the tests have failed
        pact.writePactFile(port, path.join(__dirname, '__testoutput__'));
      })
      .then(() => {
        pact.cleanupMockServer(port);
      });
  });
});
