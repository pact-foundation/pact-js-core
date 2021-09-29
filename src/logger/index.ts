import { pactCrashMessage } from './crashMessage';
import { createLogger } from './pino';
import { LogLevel } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');

const logContext = `pact-core@${pkg.version}`;
let currentLogLevel: LogLevel = 'info';
let logger = createLogger(currentLogLevel);

export const DEFAULT_LOG_LEVEL = 'info';

export const setLogLevel = (level: LogLevel = 'info'): void => {
  currentLogLevel = level;
  logger = createLogger(currentLogLevel);
};

export const verboseIsImplied = (): boolean =>
  currentLogLevel === 'trace' || currentLogLevel === 'debug';

const addContext = (context: string, message: string) =>
  `${context}: ${message}`;

const logFunctions = {
  pactCrash: (message: string, context: string = logContext): void =>
    logger.error(addContext(context, pactCrashMessage(message))),
  error: (message: string, context: string = logContext): void =>
    logger.error(addContext(context, message)),
  warn: (message: string, context: string = logContext): void =>
    logger.warn(addContext(context, message)),
  info: (message: string, context: string = logContext): void =>
    logger.info(addContext(context, message)),
  debug: (message: string, context: string = logContext): void =>
    logger.debug(addContext(context, message)),
  trace: (message: string, context: string = logContext): void =>
    logger.trace(addContext(context, message)),
};

export const logErrorAndThrow = (message: string, context?: string): never => {
  logger.error(message, context);
  throw new Error(message);
};

export const logCrashAndThrow = (message: string, context?: string): never => {
  logger.pactCrash(message, context);
  throw new Error(message);
};

export default logFunctions;
