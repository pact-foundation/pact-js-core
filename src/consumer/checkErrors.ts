import logger from '../logger';

export const wrapWithCheck =
  <F extends (...args: never[]) => boolean | number>(
    f: CheckableFunction<F>,
    contextMessage: string
  ) =>
  (...args: Parameters<F>): ReturnType<F> => {
    const result = f(...args);
    const failed = typeof result === 'number' ? result !== 0 : !result;
    if (failed) {
      logger.pactCrash(
        `The pact consumer core returned false at '${contextMessage}'. This\nshould only happen if the core methods were invoked out of order`
      );
    }
    return result;
  };

type CheckableFunction<T> = T extends (...args: infer A) => boolean | number
  ? (...args: A) => ReturnType<T>
  : never;

type CheckableFunctions<T> = {
  [key in keyof T]: CheckableFunction<T[key]>;
};

export const wrapAllWithCheck = <T extends CheckableFunctions<T>>(
  o: T
): CheckableFunctions<T> =>
  (Object.keys(o) as Array<keyof T>)
    .map((key: keyof T) => ({
      [key]: wrapWithCheck(
        o[key] as CheckableFunction<T[keyof T]>,
        String(key)
      ),
    }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {}) as T;
