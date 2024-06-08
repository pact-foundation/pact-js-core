import * as chai from 'chai';
import index from './index';

const { expect } = chai;

describe('Index Spec', () => {
  it('Typescript import should work', () => {
    expect(index).to.be.ok;
  });
});
