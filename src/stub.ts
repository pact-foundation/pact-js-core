// tslint:disable:no-string-literal
import { DEFAULT_ARG } from './spawn';
import { AbstractService } from './service';
import { deprecate } from 'util';

import pact from './pact-standalone';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const checkTypes = require('check-types');

export class Stub extends AbstractService {
  public static create = deprecate(
    (options?: StubOptions) => new Stub(options),
    'Create function will be removed in future release, please use the default export function or use `new Stub()`',
  );

  public readonly options: StubOptions;

  constructor(options?: StubOptions) {
    options = options || {};
    options.pactUrls = options.pactUrls || [];

    if (options.pactUrls) {
      checkTypes.assert.array.of.string(options.pactUrls);
    }

    checkTypes.assert.not.emptyArray(options.pactUrls);

    super(`${pact.stubPath}`, options, {
      pactUrls: DEFAULT_ARG,
      port: '--port',
      host: '--host',
      log: '--log',
      ssl: '--ssl',
      sslcert: '--sslcert',
      sslkey: '--sslkey',
      cors: '--cors',
    });
  }
}

// Creates a new instance of the pact stub with the specified option
export default (options?: StubOptions): Stub => new Stub(options);

export interface StubOptions {
  pactUrls?: string[];
  port?: number;
  ssl?: boolean;
  cors?: boolean;
  host?: string;
  sslcert?: string;
  sslkey?: string;
  log?: string;
}
