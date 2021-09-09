import { LogLevel } from '../logger/types';

export interface ConsumerVersionSelector {
  tag?: string;
  latest?: boolean;
  consumer?: string;
  deployedOrReleased?: boolean;
  deployed?: boolean;
  released?: boolean;
  environment?: string;
  fallbackTag?: string;
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
  disableSslVerification?: boolean;
}
