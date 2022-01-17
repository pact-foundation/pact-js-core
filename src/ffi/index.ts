import logger, { DEFAULT_LOG_LEVEL } from '../logger';
import { LogLevel } from '../logger/types';
import { Ffi } from './types';
import bindings = require('bindings');

const ffiLib: Ffi = bindings('pact.node');

export const PACT_FFI_VERSION = '0.1.6';

// let ffi: Omit<FfiBinding<FfiDeclarations>, 'pactffi_init'>;
let ffi: typeof ffiLib;
let ffiLogLevel: LogLevel;

// TODO: revisit types
// const initialiseFfi = (logLevel: LogLevel): FfiBinding<FfiDeclarations> => {
const initialiseFfi = (logLevel: LogLevel): typeof ffiLib => {
  logger.debug(`Initalising native core at log level '${logLevel}'`);
  ffiLogLevel = logLevel;
  ffiLib.pactffiInitWithLogLevel(logLevel);

  return ffiLib;
};

export const getFfiLib = (
  logLevel: LogLevel = DEFAULT_LOG_LEVEL
  // ): typeof ffi => {
): typeof ffiLib => {
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
