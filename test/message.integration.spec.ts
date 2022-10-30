import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import * as rimraf from 'rimraf';
import zlib = require('zlib');
import { ConsumerMessagePact, makeConsumerMessagePact } from '../src/consumer';
import { FfiSpecificationVersion } from '../src/ffi/types';
import { setLogLevel } from '../src/logger';
import { load } from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';

chai.use(chaiAsPromised);
const expect = chai.expect;

const isWin = process.platform === 'win32';
const isOSX = process.platform === 'darwin';
const isCI = process.env.CI === 'true';

describe('FFI integration test for the Message Consumer API', () => {
  setLogLevel('trace');

  let pact: ConsumerMessagePact;
  const secret = 'this is an encoded string';
  const bytes: Buffer = zlib.gzipSync(secret);

  beforeEach(() => {
    rimraf.sync('/tmp/pact/*.json');
  });

  describe('Asynchronous Messages', () => {
    describe('with JSON data', () => {
      beforeEach(() => {
        pact = makeConsumerMessagePact(
          'message-consumer',
          'message-provider',
          FfiSpecificationVersion.SPECIFICATION_VERSION_V3
        );
      });

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

        expect(JSON.parse(reified).contents).to.have.property('foo', 'bar');

        pact.writePactFile('/tmp/pact');
      });
    });

    // See https://github.com/pact-foundation/pact-reference/issues/171 for why we have an OS switch here
    // Windows: does not have magic mime matcher, uses content-type
    // OSX on CI: does not magic mime matcher, uses content-type
    // OSX: has magic mime matcher, sniffs content
    // Linux: has magic mime matcher, sniffs content
    describe('with binary data', () => {
      it('generates a pact with success', () => {
        const message = pact.newAsynchronousMessage('');
        message.expectsToReceive('a binary event');
        message.given('some state');
        message.givenWithParam('some state 2', 'state2 key', 'state2 val');
        message.withBinaryContents(
          bytes,
          isWin || (isOSX && isCI)
            ? 'application/octet-stream'
            : 'application/gzip'
        );
        message.withMetadata('meta-key', 'meta-val');

        const reified = message.reifyMessage();
        const contents = JSON.parse(reified).contents;

        // Check the base64 encoded contents can be decoded, unzipped and equals the secret
        const buf = Buffer.from(contents, 'base64');
        const deflated = zlib.gunzipSync(buf).toString('utf8');
        expect(deflated).to.equal(secret);

        pact.writePactFile('/tmp/pact');
      });
    });
  });
  describe('Synchronous Messages', () => {
    beforeEach(() => {
      pact = makeConsumerMessagePact(
        'message-consumer',
        'message-provider',
        FfiSpecificationVersion.SPECIFICATION_VERSION_V4
      );
    });
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
          JSON.stringify({ foo: 'bar' }),
          'application/json'
        );
        message.withMetadata('meta-key', 'meta-val');

        // const reified = message.reifyMessage();

        // expect(JSON.parse(reified).contents).to.have.property('foo', 'bar');

        pact.writePactFile('/tmp/pact');
      });
    });

    describe.skip('with plugin contents (gRPC)', async () => {
      const protoFile = `${__dirname}/integration/grpc/route_guide.proto`;

      let port: number;

      afterEach(() => {
        pact.cleanupPlugins();
      });

      beforeEach(() => {
        const grpcInteraction =
          `{
          "pact:proto": "` +
          protoFile +
          `",
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
        pact.addPlugin('protobuf', '0.1.14');

        const message = pact.newSynchronousMessage('a grpc test');
        message.given('some state');
        message.givenWithParam('some state 2', 'state2 key', 'state2 val');
        message.withPluginRequestResponseInteractionContents(
          'application/protobuf',
          grpcInteraction
        );
        message.withMetadata('meta-key', 'meta-val');

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

        pact.writePactFile('/tmp/pact');
      });
    });
  });
});

const getFeature = async (address: string, protoFile: string) => {
  const def = await load(protoFile);
  const routeguide: any = grpc.loadPackageDefinition(def).routeguide;

  const client = new routeguide.RouteGuide(
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
