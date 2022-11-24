import { pino } from 'pino';
import { LogLevel } from './types';

export const createLogger = (level: LogLevel): pino.Logger =>
  pino({
    level: level.toLowerCase(),
    transport: {
      target: 'pino-pretty',
    },
  });
