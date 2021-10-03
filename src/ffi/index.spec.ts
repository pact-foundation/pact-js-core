import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { getFfiLib } from '.';
import { declarations } from './declarations';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ffi Lib', () => {
  let lib: ReturnType<typeof getFfiLib>;
  beforeEach(() => {
    lib = getFfiLib();
  });

  describe('functions', () => {
    Object.keys(declarations).forEach((key) => {
      it(`'${key}' was loaded`, () => {
        expect(lib[key]).not.to.be.undefined;
      });
    });
  });
});
