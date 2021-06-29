import pino = require('pino');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json');

const DEFAULT_LEVEL: LogLevel = (process.env.LOGLEVEL || 'info') as LogLevel;

export type Logger = pino.Logger;

const createLogger = (level: LogLevel = DEFAULT_LEVEL): Logger => {
  const pinoLogger = pino({
    level: level.toLowerCase(),
    prettyPrint: {
      messageFormat: `pact-core@${pkg.version}: {msg}`,
      translateTime: true,
    },
  });
  pinoLogger.pactCrash = (message: string) => {
    pinoLogger.error(pactCrashMessage(message));
  };
  return pinoLogger;
};

const pactCrashMessage = (
  extraMessage: string
) => `!!!!!!!!! PACT CRASHED !!!!!!!!!

${extraMessage}

This is almost certainly a bug in pact-js-core. It would be great if you could
open a bug report at: https://github.com/pact-foundation/pact-js-core/issues
so that we can fix it.

There is additional debugging information above. If you open a bug report, 
please rerun with logLevel: 'debug' set in the VerifierOptions, and include the
full output.

SECURITY WARNING: Before including your log in the issue tracker, make sure you
have removed sensitive info such as login credentials and urls that you don't want
to share with the world.

We're sorry about this!
`;

const logger = createLogger();

export type LogLevel = 'debug' | 'error' | 'info' | 'trace' | 'warn';

export const setLogLevel = (
  wantedLevel?: pino.Level | number
): number | void => {
  if (wantedLevel) {
    logger.level =
      typeof wantedLevel === 'string'
        ? wantedLevel.toLowerCase()
        : logger.levels.labels[wantedLevel];
  }
  return logger.levels.values[logger.level];
};

export const verboseIsImplied = (): boolean =>
  logger.level === 'trace' || logger.level === 'debug';

export default logger;
