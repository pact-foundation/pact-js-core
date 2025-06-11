import * as chai from 'chai';
import index from './index';

const { expect } = chai;

describe('Index Spec', function() {
  it('Typescript import should work', function() {
    expect(index).to.be.ok;
  });
});
