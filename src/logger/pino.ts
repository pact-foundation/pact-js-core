import { pino } from 'pino';
import pretty from 'pino-pretty';
import { LogLevel } from './types';

export const createLogger = (level: LogLevel): pino.Logger =>
  pino(
    {
      level: level.toLowerCase(),
    },
    pretty({ sync: true })
  );
