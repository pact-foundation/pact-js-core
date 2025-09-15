import { pino, Logger } from 'pino';
import pretty from 'pino-pretty';
import { LogLevel } from './types';

export const createLogger = (level: LogLevel): Logger =>
  pino(
    {
      level: level.toLowerCase(),
    },
    pretty({ sync: true })
  );
