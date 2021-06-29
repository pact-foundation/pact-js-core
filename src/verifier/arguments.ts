import url = require('url');

import { ArgMapping } from '../ffi/argumentMapper/types';
import { ConsumerVersionSelector, VerifierOptions } from './types';

import { getUriType } from './filesystem';
import { LogLevel } from '../logger';

type DeprecatedVerifierOptions = {
  format?: 'json' | 'xml' | 'progress' | 'RspecJunitFormatter';
  out?: string;
  customProviderHeaders?: string[];
  verbose?: boolean;
  monkeypatch?: string;
  logDir?: string;
};

// These are arguments that are on the PactJS object that we don't need to use
export const ignoredArguments = [
  'requestFilter',
  'stateHandlers',
  'messageProviders',
  'changeOrigin',
  'beforeEach',
  'afterEach',
  'validateSSL',
];

export const argMapping: ArgMapping<
  VerifierOptions & DeprecatedVerifierOptions
> = {
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
    '--provider-tags',
    Array.isArray(tags) ? tags.join(',') : tags,
  ],
  providerStatesSetupUrl: { arg: '--state-change-url', mapper: 'string' },

  providerVersion: { arg: '--provider-version', mapper: 'string' },

  includeWipPactsSince: { arg: '--include-wip-pacts-since', mapper: 'string' },
  consumerVersionSelectors: (selectors: ConsumerVersionSelector[]) =>
    selectors
      .map((s: ConsumerVersionSelector) => [
        '--consumer-version-selectors',
        JSON.stringify(s),
      ]) // This reduce can be replaced simply with .flat() when node 10 is EOL
      .reduce((acc: string[], current: string[]) => [...acc, ...current], []),
  publishVerificationResult: { arg: '--publish', mapper: 'flag' },
  enablePending: { arg: '--enable-pending', mapper: 'flag' },
  timeout: { arg: '--request-timeout', mapper: 'string' },

  // We should support these, I think
  format: {
    warningMessage:
      "All output is now on standard out, setting 'format' has no effect",
  },
  out: {
    warningMessage:
      "All output is now on standard out, setting 'out' has no effect",
  },
  // Deprecate
  logDir: {
    warningMessage:
      'Setting logDir is deprecated as all logs are now on standard out',
  },
  verbose: {
    warningMessage:
      "Verbose mode is deprecated and has no effect, please use logLevel: 'DEBUG' instead",
  },
  monkeypatch: {
    warningMessage:
      'The undocumented feature monkeypatch is no more, please file an issue if you were using it and need this functionality',
  },
  // Todo in Rust ?
  customProviderHeaders: {
    warningMessage:
      'customProviderHeaders have been removed. This functionality is provided by request filters in a much more flexible way',
  },
};
