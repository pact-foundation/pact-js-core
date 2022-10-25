import logger from '../../logger';
import { Ffi, FfiHandle } from '../../ffi/types';

export const deprecatedFunction = (_: unknown, property: string): boolean => {
  logger.warn(`${property} is deprecated and no longer has any effect`);

  return true;
};

type KeyedObject = {
  [key: string]: unknown;
};

type FnArgumentMapping<O> = {
  validateAndExecute: (
    ffi: Ffi,
    handle: FfiHandle,
    options: O
  ) => FnValidationResult;
};

export type FnMapping<T extends KeyedObject, O> = {
  [Key in keyof T]: FnArgumentMapping<O>;
};

export enum FnValidationStatus {
  SUCCESS = 0,
  IGNORE = 1,
  FAIL = 2,
}

type FnValidationResult = {
  status: FnValidationStatus;
  messages?: string[];
};
