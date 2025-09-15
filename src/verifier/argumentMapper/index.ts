import { values, invert } from 'underscore';
import { FnValidationResult, FnValidationStatus } from './types';
import logger, { logCrashAndThrow, logErrorAndThrow } from '../../logger';
import { InternalPactVerifierOptions } from '../types';
import { ffiFnMapping, orderOfExecution } from './arguments';
import { Ffi, FfiVerifierHandle } from '../../ffi/types';

export const setupVerification = (
  ffi: Ffi,
  handle: FfiVerifierHandle,
  options: InternalPactVerifierOptions
): void => {
  const order = values(orderOfExecution).sort((a, b) => a - b);
  const functionsToCall = invert(orderOfExecution);

  order.forEach((k) => {
    const fn = functionsToCall[k] as keyof typeof ffiFnMapping;
    const validation: FnValidationResult = ffiFnMapping[fn].validateAndExecute(
      ffi,
      handle,
      options
    );

    switch (validation.status) {
      case FnValidationStatus.FAIL:
        logErrorAndThrow(
          `the required ffi function '${fn}' failed validation with errors: ${validation.messages}`
        );
        break;
      case FnValidationStatus.IGNORE:
        logger.debug(
          `the optional ffi function '${fn}' was not executed as it had non-fatal validation errors: ${validation.messages}`
        );
        break;
      case FnValidationStatus.SUCCESS:
        break;
      default:
        logCrashAndThrow(
          `the ffi function '${fn}' returned the following unrecognised validation signal: '${
            (validation as FnValidationResult).status
          }'`
        );
    }
  });
};
