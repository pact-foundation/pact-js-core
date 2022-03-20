import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import * as rimraf from 'rimraf';
import zlib = require('zlib');
import {
  ConsumerMessagePact,
  makeConsumerAsyncMessagePact,
} from '../src/consumer';
import { setLogLevel } from '../src/logger';

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

  describe('with JSON data', () => {
    beforeEach(() => {
      pact = makeConsumerAsyncMessagePact(
        'message-consumer',
        'message-provider'
      );
    });

    it('generates a pact with success', () => {
      pact.addMetadata('pact-node', 'meta-key', 'meta-val');
      const message = pact.newMessage('');
      message.expectsToReceive('a product event');
      message.given('some state');
      message.givenWithParam('some state 2', 'state2 key', 'state2 val');
      message.withContents(Buffer.from(`{"foo": "bar"}`), 'application/json');
      message.withMetadata('meta-key', 'meta-val');

      const reified = message.reifyMessage();

      expect(JSON.parse(reified).contents).to.have.property('foo', 'bar');

      pact.writePactFile('/tmp/pact', false);
    });
  });

  // See https://github.com/pact-foundation/pact-reference/issues/171 for why we have an OS switch here
  // Windows: does not have magic mime matcher, uses content-type
  // OSX on CI: does not magic mime matcher, uses content-type
  // OSX: has magic mime matcher, sniffs content
  // Linux: has magic mime matcher, sniffs content
  describe('with binary data', () => {
    it('generates a pact with success', () => {
      const message = pact.newMessage('');
      message.expectsToReceive('a binary event');
      message.given('some state');
      message.givenWithParam('some state 2', 'state2 key', 'state2 val');
      message.withContents(
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

      pact.writePactFile('/tmp/pact', false);
    });
  });
});
