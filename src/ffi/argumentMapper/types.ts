type BasicMapping = {
  arg: string;
  mapper: 'string' | 'flag';
};

type IgnoreAndWarn = {
  warningMessage: string;
};

type FunctionMapping<T> = (arg: NonNullable<T>) => string[];

export type ArgMapping<PactOptions> = {
  [Key in keyof PactOptions]:
    | BasicMapping
    | IgnoreAndWarn
    | FunctionMapping<PactOptions[Key]>;
};
