import { createFfi, libName } from './internals';
import { FfiBinding } from './internals/types';

import logger, { DEFAULT_LOG_LEVEL } from '../logger';
import { LogLevel } from '../logger/types';
import { declarations, FfiDeclarations } from './declarations';

const LOG_ENV_VAR_NAME = 'PACT_LOG_LEVEL';

const PACT_FFI_VERSION = '0.0.2';

let ffi: Omit<FfiBinding<FfiDeclarations>, 'pactffi_init'>;
let ffiLogLevel: LogLevel;

const initialiseFfi = (logLevel: LogLevel): FfiBinding<FfiDeclarations> => {
  logger.debug(`Initalising native core at log level '${logLevel}'`);
  process.env[LOG_ENV_VAR_NAME] = logLevel.toUpperCase();
  ffiLogLevel = logLevel;
  const lib = createFfi(
    libName('pact_ffi', `v${PACT_FFI_VERSION}`),
    declarations
  );
  lib.pactffi_init(LOG_ENV_VAR_NAME);
  return lib;
};

export const getFfiLib = (
  logLevel: LogLevel = DEFAULT_LOG_LEVEL
): typeof ffi => {
  if (!ffi) {
    logger.trace('Initiliasing ffi for the first time');
    ffi = initialiseFfi(logLevel);
  } else {
    logger.trace('Ffi has already been initialised, no need to repeat it');
    if (logLevel !== ffiLogLevel) {
      logger.warn(
        `The pact native core has already been initialised at log level '${ffiLogLevel}'`
      );
      logger.warn(`The new requested log level '${logLevel}' will be ignored`);
    }
  }
  return ffi;
};
