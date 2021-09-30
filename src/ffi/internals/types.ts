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
type VariableType =
  | 'string'
  | 'void'
  | 'int'
  | 'int32'
  | 'double'
  | 'float'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | any;

// This allows us to have enum types report as 'int', but
// be typed correctly on the way back
type UnpackEnum<T> = [T] extends [unknown]
  ? T extends number
    ? T
    : never
  : never;

type ActualType<T> = [T] extends ['string']
  ? string
  : [T] extends ['void']
  ? void
  : [number] extends [T]
  ? UnpackEnum<T>
  : ['int32'] extends [T]
  ? [T] extends ['int32']
    ? number
    : UnpackEnum<T>
  : ['int'] extends [T]
  ? [T] extends ['int']
    ? number
    : UnpackEnum<T>
  : [T] extends ['double' | 'float']
  ? number
  : [T] extends ['bool']
  ? boolean
  : T; // For now, structs are just passed through but we should do them properly ideally

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

/**
 * `FfiBinding` generates the correct library return
 * types from a structure that is
 * typed for `ffi.Library` from ffi-napi
 */
export type FfiBinding<T> = T extends LibDescription<string>
  ? {
      [Key in keyof T]: FfiFunction<FunctionFromArray<T[Key]>>;
    }
  : never;

/** Use this type within an `FfiBinding` to tell the FFI that it's an enum type that it should respect */
export type FfiEnum<T> = T | 'int32';
