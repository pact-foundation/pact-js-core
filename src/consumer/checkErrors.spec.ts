import { expect } from 'chai';
import logger from '../logger';
import { wrapWithCheck } from './checkErrors';

describe('checkErrors', function () {
  const originalPactCrash = logger.pactCrash;

  afterEach(function () {
    logger.pactCrash = originalPactCrash;
  });

  it('treats numeric status code 0 as success', function () {
    let called = false;
    logger.pactCrash = () => {
      called = true;
    };

    const wrapped = wrapWithCheck(() => 0, 'num');

    const result = wrapped();
    expect(result).to.equal(0);
    expect(called).to.equal(false);
  });

  it('treats non-zero numeric status as failure', function () {
    let called = false;
    logger.pactCrash = () => {
      called = true;
    };

    const wrapped = wrapWithCheck(() => 1, 'num');

    const result = wrapped();
    expect(result).to.equal(1);
    expect(called).to.equal(true);
  });
});
