import url = require('url');

import { LogLevel } from '../service';
import { ArgMapping } from './argumentMapper/types';
import { VerifierOptions } from './types';

import { getUriType } from './filesystem';

export const argMapping: ArgMapping<VerifierOptions> = {
  providerBaseUrl: (providerBaseUrl: string) => {
    const u = url.parse(providerBaseUrl);
    return u && u.port && u.hostname
      ? ['--port', u.port, '--hostname', u.hostname]
      : [];
  },
  logLevel: (logLevel: LogLevel) => ['--loglevel', logLevel],
  provider: { arg: '--provider-name', mapper: 'string' },
  pactUrls: (pactUrls: string[]) =>
    pactUrls.reduce<Array<string>>((acc: Array<string>, uri: string) => {
      switch (getUriType(uri)) {
        case 'URL':
          return [...acc, '--url', uri];
        case 'DIRECTORY':
          return [...acc, '--dir', uri];
        case 'FILE':
          return [...acc, '--file', uri];
        default:
          return acc;
      }
    }, []),
  pactBrokerUrl: { arg: '--broker-url', mapper: 'string' },
  pactBrokerUsername: { arg: '--user', mapper: 'string' },
  pactBrokerPassword: { arg: '--password', mapper: 'string' },
  pactBrokerToken: { arg: '--broker-token', mapper: 'string' },
  consumerVersionTags: (tags: string | string[]) => [
    '--consumer-version-tags',
    Array.isArray(tags) ? tags.join(',') : tags,
  ],
  providerVersionTags: (tags: string | string[]) => [
    '--provider-version-tags',
    Array.isArray(tags) ? tags.join(',') : tags,
  ],
  providerStatesSetupUrl: { arg: '--state-change-url', mapper: 'string' },

  providerVersion: { arg: '--provider-version', mapper: 'string' },

  // Todo in FFI
  includeWipPactsSince: { arg: '--include-wip-pacts-since', mapper: 'string' },
  consumerVersionSelectors: () => {
    throw new Error('Consumer version selectors are not yet implemented');
  },
  publishVerificationResult: { arg: '--publish', mapper: 'flag' },
  enablePending: { arg: '--enable-pending', mapper: 'flag' },

  // Todo in Rust
  customProviderHeaders: () => {
    throw new Error('customProviderHeaders are not yet implemented');
  },
  timeout: {
    warningMessage: 'Timeout currently has no effect on the rust binary',
  },
  // We should support these, I think
  format: {
    warningMessage:
      "All output is currently on standard out, setting 'format' has no effect",
  },
  out: {
    warningMessage:
      "All output is currently on standard out, setting 'out' has no effect",
  },

  // Deprecate
  logDir: {
    warningMessage:
      'Setting logDir is deprecated as all logs are now on standard out.',
  },
  verbose: {
    warningMessage:
      "Verbose mode is deprecated and has no effect, please use logLevel: 'DEBUG' instead",
  },
  monkeypatch: {
    warningMessage:
      'The undocumented feature monkeypatch is no more, please file an issue if you were using it and need this functionality',
  },
};
