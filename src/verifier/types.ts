import { LogLevel } from '../service';

export interface ConsumerVersionSelector {
  pacticipant?: string;
  tag?: string;
  version?: string;
  latest?: boolean;
  all?: boolean;
}

export interface VerifierOptions {
  providerBaseUrl: string;
  provider?: string;
  pactUrls?: string[];
  pactBrokerUrl?: string;
  pactBrokerUsername?: string;
  pactBrokerPassword?: string;
  pactBrokerToken?: string;
  consumerVersionTags?: string | string[];
  providerVersionTags?: string | string[];
  providerStatesSetupUrl?: string;
  publishVerificationResult?: boolean;
  providerVersion?: string;
  enablePending?: boolean;
  // Todo in FFI
  includeWipPactsSince?: string;
  consumerVersionSelectors?: ConsumerVersionSelector[];
  logLevel?: LogLevel;
  // Todo in Rust maybe
  customProviderHeaders?: string[];
  timeout?: number;

  logDir?: string;

  // Kill
  verbose?: boolean;
  monkeypatch?: string;

  // Unknown?
  format?: 'json' | 'xml' | 'progress' | 'RspecJunitFormatter';
  out?: string;
}
