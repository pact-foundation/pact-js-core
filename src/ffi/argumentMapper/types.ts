export type ArgMapping<PactOptions> = {
  [Key in keyof PactOptions]:
    | {
        arg: string;
        mapper: 'string' | 'flag';
      }
    | {
        warningMessage: string;
      }
    | ((arg: NonNullable<PactOptions[Key]>) => string[]);
};
