import { initialiseFfi, libName } from './internals';
import { FfiBinding } from './internals/types';

import logger, { DEFAULT_LOG_LEVEL } from '../logger';
import { LogLevel } from '../logger/types';
import { declarations, FfiDeclarations } from './declarations';

const LOG_ENV_VAR_NAME = 'PACT_LOG_LEVEL';

const PACT_FFI_VERSION = '0.0.2';

export const getFfiLib = (
  logLevel: LogLevel = DEFAULT_LOG_LEVEL
): FfiBinding<FfiDeclarations> => {
  logger.debug(`Initalising native core at log level '${logLevel}'`);
  process.env[LOG_ENV_VAR_NAME] = logLevel;
  const lib = initialiseFfi(
    libName('pact_ffi', `v${PACT_FFI_VERSION}`),
    declarations
  );
  lib.pactffi_init(LOG_ENV_VAR_NAME);
  return lib;
};
