import { LogLevel } from '../logger';

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
  includeWipPactsSince?: string;
  consumerVersionSelectors?: ConsumerVersionSelector[];
  timeout?: number;
  logLevel?: LogLevel;
}
