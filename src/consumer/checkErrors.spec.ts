import logger from '../logger';
import { wrapWithCheck } from './checkErrors';

describe('checkErrors', () => {
  const originalPactCrash = logger.pactCrash;

  afterEach(() => {
    logger.pactCrash = originalPactCrash;
  });

  it('treats numeric status code 0 as success', () => {
    let called = false;
    logger.pactCrash = () => {
      called = true;
    };

    const wrapped = wrapWithCheck(() => 0, 'num');

    const result = wrapped();
    expect(result).toBe(0);
    expect(called).toBe(false);
  });

  it('treats non-zero numeric status as failure', () => {
    let called = false;
    logger.pactCrash = () => {
      called = true;
    };

    const wrapped = wrapWithCheck(() => 1, 'num');

    const result = wrapped();
    expect(result).toBe(1);
    expect(called).toBe(true);
  });
});
