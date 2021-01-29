import pino = require('pino');
import SonicBoom = require('sonic-boom');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json');

let level = (process.env.LOGLEVEL || 'info').toLowerCase();

export type Logger = pino.Logger;
export type LogDest = SonicBoom;

export const create = (destination?: pino.DestinationStream): Logger =>
	pino(
		{
			level,
			prettyPrint: {
				messageFormat: `pact@${pkg.version} -- {msg}`,
				translateTime: true,
			},
		},
		destination || pino.destination(1),
	);

let logger: pino.Logger = create();

export const setLogLevel = (
	logger: Logger,
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

export const createDestination = (path: string): LogDest =>
	pino.destination(path);

export type LogLevels = pino.Level;

export default logger;
