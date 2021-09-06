import pino = require('pino');
import { LogLevel } from './types';

export const createLogger = (level: LogLevel): pino.Logger =>
  pino({
    level: level.toLowerCase(),
    prettyPrint: {
      translateTime: true,
    },
  });
