import * as pino from 'pino';
import fs = require('fs');
import path = require('path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json');

let level = (process.env.LOGLEVEL || 'info').toLowerCase();
let destination = pino.destination(1);

const init = (): pino.Logger =>
	pino(
		{
			level,
			prettyPrint: {
				messageFormat: `pact@${pkg.version} -- {msg}`,
				translateTime: true,
			},
		},
		destination,
	);

let logger: pino.Logger = init();

export const setLogPath = (logPath: string): void => {
	const resolvedPath = path.resolve(logPath);

	const updateDestination = (): void => {
		destination = pino.destination(resolvedPath);
		logger = init();
	};

	if (!fs.existsSync(resolvedPath)) {
		fs.writeFile(resolvedPath, '', err => {
			if (err) {
				logger.error(
					{ path: logPath, err },
					`could not set logger destination`,
				);
			} else {
				updateDestination();
			}
		});
	} else {
		updateDestination();
	}
};

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

export const endDestination = (): void => {
	if (destination) {
		destination.end();
	}
};

process.on('exit', endDestination);

export type LogLevels = pino.Level;

export default logger;
