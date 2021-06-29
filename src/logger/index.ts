import { pactCrashMessage } from './crashMessage';
import { createLogger } from './pino';
import { LogLevel } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');

const logContext = `pact-core@${pkg.version}`;
let currentLogLevel: LogLevel = 'info';

export const setLogLevel = (level: LogLevel = 'info'): void => {
  currentLogLevel = level;
};

export const verboseIsImplied = (): boolean =>
  currentLogLevel === 'trace' || currentLogLevel === 'debug';

export default {
  pactCrash: (message: string, context: string = logContext): void =>
    createLogger(currentLogLevel, context).error(pactCrashMessage(message)),
  error: (message: string, context: string = logContext): void =>
    createLogger(currentLogLevel, context).error(message),
  warn: (message: string, context: string = logContext): void =>
    createLogger(currentLogLevel, context).warn(message),
  info: (message: string, context: string = logContext): void =>
    createLogger(currentLogLevel, context).info(message),
  debug: (message: string, context: string = logContext): void =>
    createLogger(currentLogLevel, context).debug(message),
  trace: (message: string, context: string = logContext): void =>
    createLogger(currentLogLevel, context).trace(message),
};
