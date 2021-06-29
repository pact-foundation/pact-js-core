import pino = require('pino');
import { LogLevel } from './types';

export const createLogger = (level: LogLevel, context: string): pino.Logger =>
  pino({
    level: level.toLowerCase(),
    prettyPrint: {
      messageFormat: `${context}: {msg}`,
      translateTime: true,
    },
  });
