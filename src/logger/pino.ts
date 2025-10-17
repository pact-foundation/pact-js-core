import { pino, Logger } from 'pino';
import { prettyFactory } from 'pino-pretty';

import { LogLevel } from './types';

export const createLogger = (level: LogLevel): Logger => {
  const prettify = prettyFactory({ sync: true });
  // Configure custom stream that forwards pretty message to console
  // to address issues with pino pretty and Jest
  // Thanks to https://github.com/pinojs/pino-pretty/issues/480#issuecomment-2271709217 for the solution
  return pino(
    {
      level: level.toLowerCase(),
    },
    {
      write(data: unknown) {
        console.log(prettify(data));
      },
    }
  );
};
