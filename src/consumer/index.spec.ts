import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { makeConsumerPact } from '.';
import { FfiSpecificationVersion } from '../ffi/types';
import axios from 'axios';
import path = require('path');
import { setLogLevel } from '../logger';
import { ConsumerPact, MatchingResultRequestMismatch } from './types';
import zlib = require('zlib');
import FormData = require('form-data');
import fs = require('fs');

chai.use(chaiAsPromised);
const expect = chai.expect;

const HOST = '127.0.0.1';

describe('Integration like test for the consumer API', () => {
  setLogLevel('trace');

  let port: number;
  let pact: ConsumerPact;
  const bytes: Buffer = zlib.gzipSync('this is an encoded string');
  const like = (value: unknown) => {
    return {
      'pact:matcher:type': 'type',
      value,
    };
  };

  describe('with JSON data', () => {
    beforeEach(() => {
      pact = makeConsumerPact(
        'foo-consumer',
        'bar-provider',
        FfiSpecificationVersion.SPECIFICATION_VERSION_V3
      );

      const interaction = pact.newInteraction('some description');

      interaction.uponReceiving('a request to get a create with JSON data');
      interaction.given('fido exists');
      interaction.withRequest('POST', '/dogs/1234');
      interaction.withRequestHeader('x-special-header', 0, 'header');
      interaction.withQuery(
        'someParam',
        0,
        JSON.stringify({
          'pact:matcher:type': 'type',
          'pact:generator:type': 'ProviderState',
          expression: '${accountNumber}',
          value: '100',
        })
      );
      interaction.withResponseBody(
        JSON.stringify({
          id: like(1234),
        }),
        'application/json'
      );
      interaction.withResponseBody(
        JSON.stringify({
          name: like('fido'),
          age: like(23),
          alive: like(true),
        }),
        'application/json'
      );
      interaction.withResponseHeader('x-special-response-header', 0, 'header');
      interaction.withStatus(200);

      port = pact.createMockServer(HOST);
    });

    it('generates a pact with success', () => {
      return axios
        .request({
          baseURL: `http://${HOST}:${port}`,
          headers: {
            'content-type': 'application/octet-stream',
            Accept: 'application/json',
            'x-special-header': 'header',
          },
          params: {
            someParam: 'someValue',
          },
          data: {
            id: 1234,
          },
          method: 'POST',
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

    it('generates a pact with failure', () => {
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
          method: 'POST',
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
          const requestMismatches =
            mismatches[0] as MatchingResultRequestMismatch;

          expect(mismatches[0].type).to.equal('request-mismatch');
          expect(requestMismatches.method).to.equal('POST');
          expect(requestMismatches.path).to.equal('/dogs/1234');
          expect(requestMismatches.mismatches).to.deep.include({
            actual: 'wrongValue',
            expected: 'someValue',
            mismatch: "Expected 'someValue' to be equal to 'wrongValue'",
            parameter: 'someParam',
            type: 'QueryMismatch',
          });
          expect(requestMismatches.mismatches).to.deep.include({
            actual: 'WrongHeader',
            expected: 'header',
            key: 'x-special-header',
            mismatch:
              "Mismatch with header 'x-special-header': Expected 'header' to be equal to 'WrongHeader'",
            type: 'HeaderMismatch',
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

  // binary data is flakey on CI. If I set everything to application/gzip, it complains about it not being application/octet-stream and vice-versa
  // Haven't looked to hard to get to the bottom of it, but it might be axios sending different headers across OS/node versions or it might be the
  //  way rust sniffs binary payloads?
  // e.g. https://github.com/pact-foundation/pact-js-core/runs/4812910376?check_suite_focus=true#step:4:360
  describe.skip('with binary data', () => {
    beforeEach(() => {
      pact = makeConsumerPact(
        'foo-consumer',
        'bar-provider',
        FfiSpecificationVersion.SPECIFICATION_VERSION_V3
      );

      const interaction = pact.newInteraction('some description');

      interaction.uponReceiving('a request to create a dog with binary data');
      interaction.given('fido exists');
      interaction.withRequest('POST', '/dogs/1234');
      interaction.withRequestHeader('x-special-header', 0, 'header');
      interaction.withQuery('someParam', 0, 'someValue');
      interaction.withRequestBinaryBody(bytes, 'application/gzip');
      interaction.withResponseBody(
        JSON.stringify({
          name: like('fido'),
          age: like(23),
          alive: like(true),
        }),
        'application/json'
      );
      interaction.withResponseHeader('x-special-response-header', 0, 'header');
      interaction.withStatus(200);

      port = pact.createMockServer(HOST);
    });

    it('generates a pact with success', () => {
      return axios
        .request({
          baseURL: `http://${HOST}:${port}`,
          headers: {
            'content-type': 'application/octet-stream',
            Accept: 'application/json',
            'x-special-header': 'header',
          },
          params: {
            someParam: 'someValue',
          },
          data: bytes,
          method: 'POST',
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
  });

  describe('with multipart data', () => {
    const form = new FormData();
    const f: string = path.resolve(__dirname, '../../test/monkeypatch.rb');
    form.append('my_file', fs.createReadStream(f));
    const formHeaders = form.getHeaders();

    beforeEach(() => {
      const pact = makeConsumerPact(
        'foo-consumer',
        'bar-provider',
        FfiSpecificationVersion.SPECIFICATION_VERSION_V3
      );

      const interaction = pact.newInteraction('some description');

      interaction.uponReceiving('a request to get a dog with multipart data');
      interaction.given('fido exists');
      interaction.withRequest('POST', '/dogs/1234');
      interaction.withRequestHeader('x-special-header', 0, 'header');
      interaction.withQuery('someParam', 0, 'someValue');
      interaction.withRequestMultipartBody('text/plain', f, 'my_file');
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

    it('generates a pact with success', () => {
      return axios
        .request({
          baseURL: `http://${HOST}:${port}`,
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
            'x-special-header': 'header',
            ...formHeaders,
          },
          params: {
            someParam: 'someValue',
          },
          data: form,
          method: 'POST',
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
          // You don't have to call this, it's just here to check it works
          const mismatches = pact.mockServerMismatches(port);
          console.dir(mismatches, { depth: 10 });
          expect(mismatches).to.have.length(0);
        })
        .then(() => {
          expect(pact.mockServerMatchedSuccessfully(port)).to.be.true;
        })
        .then(() => {
          pact.writePactFile(port, path.join(__dirname, '__testoutput__'));
        })
        .then(() => {
          pact.cleanupMockServer(port);
        });
    });
  });
});
