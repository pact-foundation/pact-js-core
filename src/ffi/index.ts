import bindings = require('bindings');
import logger, { DEFAULT_LOG_LEVEL } from '../logger';
import { LogLevel } from '../logger/types';
import { Ffi, FfiLogLevelFilter } from './types';

const ffiLib: Ffi = bindings('pact.node');

export const PACT_FFI_VERSION = '0.4.0';

let ffi: typeof ffiLib;
let ffiLogLevel: LogLevel;

const initialiseFfi = (logLevel: LogLevel, logFile?: string): typeof ffi => {
  logger.debug(`Initalising native core at log level '${logLevel}'`);
  ffiLogLevel = logLevel;
  if (logFile) {
    const convertLogLevelToFfiLoglevelFilter = {
      trace: FfiLogLevelFilter.LOG_LEVEL_TRACE,
      info: FfiLogLevelFilter.LOG_LEVEL_INFO,
      debug: FfiLogLevelFilter.LOG_LEVEL_DEBUG,
      warn: FfiLogLevelFilter.LOG_LEVEL_WARN,
      error: FfiLogLevelFilter.LOG_LEVEL_ERROR,
    };

    logger.debug(
      `Setting log file to '${convertLogLevelToFfiLoglevelFilter[logLevel]}'`
    );
    const res = ffiLib.pactffiLogToFile(
      logFile,
      convertLogLevelToFfiLoglevelFilter[logLevel]
    );
    logger.debug(`result of writing to file '${res}'`);
  } else {
    ffiLib.pactffiInitWithLogLevel(logLevel);
  }

  return ffiLib;
};

export const getFfiLib = (
  logLevel: LogLevel = DEFAULT_LOG_LEVEL,
  logFile?: string
): typeof ffi => {
  if (!ffi) {
    logger.trace('Initiliasing ffi for the first time');
    ffi = initialiseFfi(logLevel, logFile);
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
