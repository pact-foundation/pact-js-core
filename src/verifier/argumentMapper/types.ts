type BasicMapping = {
  arg: string;
  mapper: 'string' | 'flag';
};

type IgnoreAndWarn = {
  warningMessage: string;
};

/** @internal */
export type FunctionMapping<T> = (arg: NonNullable<T>) => string[];

/** @internal */
export type ArgMapping<PactOptions> = {
  [Key in keyof PactOptions]-?:
    | BasicMapping
    | IgnoreAndWarn
    | FunctionMapping<PactOptions[Key]>;
};

/** @internal */
export type IgnoreOptionCombinations<T> = {
  [Key in keyof Partial<T>]: { ifNotSet: keyof T };
};
