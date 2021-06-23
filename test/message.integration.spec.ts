import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import fs = require('fs');
import messageFactory from '../src/message';
import path = require('path');
import logger from '../src/logger';
chai.use(chaiAsPromised);

import rimraf = require('rimraf');
const expect = chai.expect;

describe('Message Integration Spec', () => {
  const pactDir =
    process && process.mainModule
      ? `${path.dirname(process.mainModule.filename)}/pacts`
      : '/tmp/pacts';
  const contractFile = `${pactDir}/consumer-provider.json`;

  const validJSON = `{ "description": "a test mesage", "content": { "name": "Mary" } }`;

  context('when given a successful contract', () => {
    before(() => {
      try {
        if (fs.statSync(contractFile)) {
          rimraf(pactDir, () => logger.debug('removed existing pacts'));
        }
      } catch (e) {}
    });

    it('should return a successful promise', (done) => {
      const message = messageFactory({
        consumer: 'consumer',
        provider: 'provider',
        dir: `${pactDir}`,
        content: validJSON,
      });

      const promise = message.createMessage();

      promise.then(() => {
        expect(fs.statSync(contractFile).isFile()).to.eql(true);
        done();
      });
    });
  });
});
