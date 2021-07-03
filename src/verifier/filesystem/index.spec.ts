import path = require('path');
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { getUriType } from '.';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('filesystem helpers', () => {
  context('when given filenames', () => {
    context("that don't exist", () => {
      it('throws an error', () => {
        expect(() => getUriType('this-file-is-not-found.json')).to.throw(Error);
      });
    });
    context('that do exist', () => {
      context('and are a directory', () => {
        it('returns DIRECTORY', () => {
          expect(getUriType(path.dirname(__dirname))).to.equal('DIRECTORY');
        });
      });
      context('and are a file', () => {
        it('returns FILE', () => {
          expect(getUriType(path.join(__dirname, 'index.ts'))).to.equal('FILE');
        });
      });
    });
  });
  context('when given a url', () => {
    context('which is https', () => {
      it('returns URL', () => {
        expect(getUriType('https://tls.example.com')).to.equal('URL');
      });
    });
    context('which is http', () => {
      it('returns URL', () => {
        expect(getUriType('http://www.example.com')).to.equal('URL');
      });
    });
  });
});
