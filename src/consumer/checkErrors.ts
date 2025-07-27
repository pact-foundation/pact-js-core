import logger from '../logger';

export const wrapWithCheck =
  <F extends (...args: never[]) => boolean>(
    f: BooleanFunction<F>,
    contextMessage: string
  ) =>
  (...args: Parameters<F>): boolean => {
    const result = f(...args);
    if (!result) {
      logger.pactCrash(
        `The pact consumer core returned false at '${contextMessage}'. This\nshould only happen if the core methods were invoked out of order`
      );
    }
    return result;
  };

type BooleanFunction<T> = T extends (...args: infer A) => boolean
  ? (...args: A) => boolean
  : never;

type BooleanFunctions<T> = {
  [key in keyof T]: BooleanFunction<T[key]>;
};

export const wrapAllWithCheck = <T extends BooleanFunctions<T>>(
  o: T
): BooleanFunctions<T> =>
  (Object.keys(o) as Array<keyof T>)
    .map((key: keyof T) => ({
      [key]: wrapWithCheck(o[key] as BooleanFunction<T[keyof T]>, String(key)),
    }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {}) as T;
