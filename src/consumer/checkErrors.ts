import logger from '../logger';

export const wrapWithCheck =
  <Params extends Array<unknown>, F extends (...args: Params) => boolean>(
    f: F,
    contextMessage: string
  ) =>
  (...args: Params): boolean => {
    const result = f(...args);
    if (!result) {
      logger.pactCrash(
        `The pact consumer core returned false at '${contextMessage}'. This\nshould only happen if the core methods were invoked out of order`
      );
    }
    return result;
  };

type BooleanFunctions<T> = {
  [key in keyof T]: T[key] extends (...args: infer A) => boolean
    ? (...args: A) => boolean
    : never;
};

export const wrapAllWithCheck = <T extends BooleanFunctions<T>>(
  o: T
): BooleanFunctions<T> =>
  Object.keys(o)
    .map((key: string) => ({
      [key]: wrapWithCheck(o[key], key),
    }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {}) as T;
