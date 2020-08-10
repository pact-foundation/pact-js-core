import { AbstractService, LogLevel } from './service';
import { deprecate } from 'util';
import pact from './pact-standalone';
import path = require('path');
import fs = require('fs');
import mkdirp = require('mkdirp');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const checkTypes = require('check-types');

export class Server extends AbstractService {
	public static create = deprecate(
		(options?: ServerOptions) => new Server(options),
		'Create function will be removed in future release, please use the default export function or use `new Server()`',
	);

	public readonly options: ServerOptions;

	constructor(options?: ServerOptions) {
		options = options || {};
		options.dir = options.dir ? path.resolve(options.dir) : process.cwd(); // Use directory relative to cwd
		options.pactFileWriteMode = options.pactFileWriteMode || 'overwrite';

		if (options.spec) {
			checkTypes.assert.number(options.spec);
			checkTypes.assert.integer(options.spec);
			checkTypes.assert.positive(options.spec);
		}

		if (options.dir) {
			const dir = path.resolve(options.dir);
			try {
				fs.statSync(dir).isDirectory();
			} catch (e) {
				mkdirp.sync(dir);
			}
		}

		if (options.log) {
			options.log = path.resolve(options.log);
		}

		if (options.sslcert) {
			options.sslcert = path.resolve(options.sslcert);
		}

		if (options.sslkey) {
			options.sslkey = path.resolve(options.sslkey);
		}

		if (options.consumer) {
			checkTypes.assert.string(options.consumer);
		}

		if (options.provider) {
			checkTypes.assert.string(options.provider);
		}

		if (options.logLevel) {
			options.logLevel = options.logLevel.toLowerCase() as LogLevel;
		}

		if (options.monkeypatch) {
			checkTypes.assert.string(options.monkeypatch);
			try {
				fs.statSync(path.normalize(options.monkeypatch)).isFile();
			} catch (e) {
				throw new Error(
					`Monkeypatch ruby file not found at path: ${options.monkeypatch}`,
				);
			}
		}

		let opts = options;

		// Need to uppercase logLevel for ruby
		if (options.logLevel) {
			opts = JSON.parse(JSON.stringify(options));
			opts.logLevel = options.logLevel.toUpperCase() as LogLevel;
		}

		super(
			pact.mockServicePath,
			opts,
			{
				port: '--port',
				host: '--host',
				log: '--log',
				ssl: '--ssl',
				sslcert: '--sslcert',
				sslkey: '--sslkey',
				cors: '--cors',
				dir: '--pact_dir',
				spec: '--pact_specification_version',
				pactFileWriteMode: '--pact-file-write-mode',
				consumer: '--consumer',
				provider: '--provider',
				monkeypatch: '--monkeypatch',
				logLevel: '--log-level',
			},
			{ cliVerb: 'service' },
		);
	}
}

// Creates a new instance of the pact server with the specified option
export default (options?: ServerOptions): Server => new Server(options);

export interface ServerOptions {
	port?: number;
	ssl?: boolean;
	cors?: boolean;
	dir?: string;
	host?: string;
	sslcert?: string;
	sslkey?: string;
	log?: string;
	spec?: number;
	consumer?: string;
	provider?: string;
	monkeypatch?: string;
	logLevel?: LogLevel;
	pactFileWriteMode?: 'overwrite' | 'update' | 'merge';
}
