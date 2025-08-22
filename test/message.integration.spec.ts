import chai = require('chai');
import * as path from 'path';
import chaiAsPromised = require('chai-as-promised');
import * as rimraf from 'rimraf';
import zlib = require('zlib');
import { load } from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';
import { ConsumerMessagePact, makeConsumerMessagePact } from '../src';
import { FfiSpecificationVersion } from '../src/ffi/types';
import { setLogLevel } from '../src/logger';

chai.use(chaiAsPromised);
const { expect } = chai;

const getFeature = async (address: string, protoFile: string) => {
  const def = await load(protoFile);
  const { routeguide } = grpc.loadPackageDefinition(def);

  const client = new routeguide['RouteGuide'](
    address,
    grpc.credentials.createInsecure()
  );

  return new Promise<any>((resolve, reject) => {
    client.GetFeature(
      {
        latitude: 180,
        longitude: 200,
      },
      (e: Error, feature: any) => {
        if (e) {
          reject(e);
        } else {
          resolve(feature);
        }
      }
    );
  });
};

describe('FFI integration test for the Message Consumer API', () => {
  setLogLevel('error');

  let pact: ConsumerMessagePact;
  const secret = 'this is an encoded string';
  const bytes: Buffer = zlib.gzipSync(secret);

  before(() => {
    rimraf.sync(path.join(__dirname, '__testoutput__', 'message-consumer*'));
  });

  beforeEach(() => {
    pact = makeConsumerMessagePact(
      'message-consumer',
      'message-provider',
      FfiSpecificationVersion['SPECIFICATION_VERSION_V4']
    );
  });

  describe('Asynchronous Messages', () => {
    describe('with JSON data', () => {
      it('generates a pact with success', () => {
        pact.addMetadata('pact-node', 'meta-key', 'meta-val');
        const message = pact.newAsynchronousMessage('');
        message.expectsToReceive('a product event');
        message.given('some state');
        message.givenWithParam('some state 2', 'state2 key', 'state2 val');
        message.withContents(
          JSON.stringify({ foo: 'bar' }),
          'application/json'
        );
        message.withMetadata('meta-key', 'meta-val');

        const reified = message.reifyMessage();

        expect(JSON.parse(reified).contents.content).to.have.property(
          'foo',
          'bar'
        );

        pact.writePactFile(path.join(__dirname, '__testoutput__'));
      });
    });

    describe('with binary data', () => {
      it('generates a pact with success', () => {
        const message = pact.newAsynchronousMessage('');
        message.expectsToReceive('a binary event');
        message.given('some state');
        message.givenWithParam('some state 2', 'state2 key', 'state2 val');
        message.withBinaryContents(bytes, 'application/gzip');
        message.withMetadata('meta-key', 'meta-val');

        const reified = message.reifyMessage();
        const { contents } = JSON.parse(reified);

        // Check the base64 encoded contents can be decoded, unzipped and equals the secret
        const buf = Buffer.from(contents.content, 'base64');
        const deflated = zlib.gunzipSync(buf).toString('utf8');
        expect(deflated).to.equal(secret);

        pact.writePactFile(path.join(__dirname, '__testoutput__'));
      });
    });
  });

  describe('Synchronous Messages', () => {
    describe('with JSON data', () => {
      it('generates a pact with success', () => {
        pact.addMetadata('pact-node', 'meta-key', 'meta-val');
        const message = pact.newSynchronousMessage('A synchronous message');
        message.given('some state');
        message.givenWithParam('some state 2', 'state2 key', 'state2 val');
        message.withRequestContents(
          JSON.stringify({ foo: 'bar' }),
          'application/json'
        );
        message.withResponseContents(
          JSON.stringify({ baz: 'bat' }),
          'application/json'
        );
        message.withResponseContents(
          JSON.stringify({ qux: 'quux' }),
          'application/json'
        );
        message.withMetadata('meta-key', 'meta-val');
        const request = message.getRequestContents().toString();
        const response = message.getResponseContents()[0].toString();
        const response2 = message.getResponseContents()[1].toString();
        expect(JSON.parse(request)).to.deep.eq({ foo: 'bar' });
        expect(JSON.parse(response)).to.deep.eq({ baz: 'bat' });
        expect(JSON.parse(response2)).to.deep.eq({ qux: 'quux' });

        pact.writePactFile(path.join(__dirname, '__testoutput__'));
      });
    });

    const skipPluginTests = process.env['SKIP_PLUGIN_TESTS'] === 'true';
    (skipPluginTests ? describe.skip : describe)(
      'with plugin contents (gRPC)',
      () => {
        let protoFile = `${__dirname}/integration/grpc/route_guide.proto`;
        if (process.platform === 'win32') {
          const escapedProtoFile = protoFile.replace(/\\/g, '\\\\');
          protoFile = escapedProtoFile;
        }

        let port: number;

        afterEach(() => {
          pact.cleanupPlugins();
        });

        beforeEach(() => {
          const grpcInteraction = `{
          "pact:proto": "${protoFile}",
          "pact:proto-service": "RouteGuide/GetFeature",
          "pact:content-type": "application/protobuf",
          "request": {
            "latitude": "matching(number, 180)",
            "longitude": "matching(number, 200)"
          },
          "response": {
            "name": "matching(type, 'Big Tree')",
            "location": {
              "latitude": "matching(number, 180)",
              "longitude": "matching(number, 200)"
            }
          }
        }`;

          pact.addMetadata('pact-node', 'meta-key', 'meta-val');
          pact.addPlugin('protobuf', '0.3.15');

          const message = pact.newSynchronousMessage('a grpc test 1');
          message.given('some state 1');
          message.withPluginRequestResponseInteractionContents(
            'application/protobuf',
            grpcInteraction
          );
          message.withMetadata('meta-key 1', 'meta-val 2');

          port = pact.pactffiCreateMockServerForTransport(
            '127.0.0.1',
            'grpc',
            ''
          );
        });

        it('generates a pact with success', async () => {
          const feature: any = await getFeature(`127.0.0.1:${port}`, protoFile);
          expect(feature.name).to.eq('Big Tree');

          const res = pact.mockServerMatchedSuccessfully(port);
          expect(res).to.eq(true);

          const mismatches = pact.mockServerMismatches(port);
          expect(mismatches.length).to.eq(0);

          pact.writePactFile(path.join(__dirname, '__testoutput__'));
        });
      }
    );
  });
});
