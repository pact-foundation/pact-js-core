// I am so so sorry about these types. They exist
// to infer the returned type of the library
// using the object that we pass in to describe the functions
type AsyncFfiCall<Args extends unknown[], ReturnType> = {
  async: (
    ...args: [...Args, (err: Error, ret: ReturnType) => void]
  ) => ReturnType;
};

type FfiFunction<T> = T extends (...a: infer Args) => infer ReturnType
  ? T & AsyncFfiCall<Args, ReturnType>
  : never;

// We allow any here, because typescript won't accept the `StructType`from
// ref-struct-di for some reason. Using any lets us pass through arbitrary
// parameter types, so we just have to be careful to get them right.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VariableType = 'string' | 'void' | 'int' | 'double' | 'float' | any;

type ActualType<T> = [T] extends ['string']
  ? string
  : [T] extends ['void']
  ? void
  : [T] extends ['int' | 'double' | 'float']
  ? number
  : T;

type ArrayActualType<Tuple extends [...Array<unknown>]> = {
  [Index in keyof Tuple]: ActualType<Tuple[Index]>;
} & { length: Tuple['length'] };

type TupleType = [VariableType, Array<VariableType>];

type FunctionFromArray<A extends TupleType> = A extends [
  r: infer ReturnType,
  args: [...infer ArgArrayType]
]
  ? (...args: ArrayActualType<ArgArrayType>) => ActualType<ReturnType>
  : never;

type LibDescription<Functions extends string> = {
  [k in Functions]: [VariableType, Array<VariableType>];
};

export type FfiBinding<T> = T extends LibDescription<string>
  ? {
      [Key in keyof T]: FfiFunction<FunctionFromArray<T[Key]>>;
    }
  : never;
