import { FnValidationStatus } from './types';
import logger, { logCrashAndThrow, logErrorAndThrow } from '../../logger';
import { InternalPactVerifierOptions } from '../types';
import { ffiFnMapping, RequiredFfiVerificationFunctions } from './arguments';
import { Ffi, FfiVerifierHandle } from '../../ffi/types';

export const setupVerification = (
  ffi: Ffi,
  handle: FfiVerifierHandle,
  options: InternalPactVerifierOptions
): void => {
  (
    Object.keys(ffiFnMapping) as Array<keyof RequiredFfiVerificationFunctions>
  ).map((k) => {
    const validation = ffiFnMapping[k].validateAndExecute(ffi, handle, options);

    switch (validation.status) {
      case FnValidationStatus.FAIL:
        logErrorAndThrow(
          `the required ffi function '${k}' failed validation with errors: ${
            validation.messages || [].join(',')
          }`
        );
        break;
      case FnValidationStatus.IGNORE:
        logger.debug(
          `the optional ffi function '${k}' was not executed as it had non-fatal validation errors: ${
            validation.messages || [].join(',')
          }`
        );
        break;
      case FnValidationStatus.SUCCESS:
        break;
      default:
        logCrashAndThrow(
          `the ffi function '${k}' returned the following unrecognised validation signal: '${validation.status}'`
        );
    }
  });
};
