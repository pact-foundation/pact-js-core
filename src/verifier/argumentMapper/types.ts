import logger from '../../logger';

export const deprecatedFunction = (_: any, property: string): boolean => {
  logger.warn(`${property} is deprecated and no longer has any effect`);

  return true;
};
import { Ffi, FfiHandle } from '../../ffi/types';

export type FnObject = {
  [key: string]: (...args: any) => any;
};

export type FnMapping<T extends FnObject, O> = {
  [Key in keyof T]: FnArgumentMapping<O>;
};

export enum FnValidationStatus {
  SUCCESS = 0,
  IGNORE = 1,
  FAIL = 2,
}

export type FnValidationResult = {
  status: FnValidationStatus;
  messages?: string[];
};

export type FnArgumentMapping<O> = {
  validateAndExecute: (
    ffi: Ffi,
    handle: FfiHandle,
    options: O
  ) => FnValidationResult;
};
