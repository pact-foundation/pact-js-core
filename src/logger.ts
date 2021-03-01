import pino = require('pino');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json');

export type Logger = pino.Logger;
export type LogLevels = pino.Level;

const DEFAULT_LEVEL: LogLevels = (process.env.LOGLEVEL || 'info') as LogLevels;

const createLogger = (level: LogLevels = DEFAULT_LEVEL): Logger =>
	pino({
		level: level.toLowerCase(),
		prettyPrint: {
			messageFormat: `pact-core@${pkg.version}: {msg}`,
			translateTime: true,
		},
	});

const logger: pino.Logger = createLogger();

export const setLogLevel = (
	wantedLevel?: pino.Level | number,
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
