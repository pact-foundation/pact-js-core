export interface CanDeployPacticipant {
  name: string;
  version?: string;
  latest?: string | boolean;
}

export interface CanDeployOptions {
  pacticipants: CanDeployPacticipant[];
  pactBroker: string;
  pactBrokerToken?: string;
  pactBrokerUsername?: string;
  pactBrokerPassword?: string;
  output?: 'json' | 'table';
  verbose?: boolean;
  to?: string;
  retryWhileUnknown?: number;
  retryInterval?: number;
  timeout?: number;
}

export interface CanDeployResponse {
  summary: { deployable: boolean; reason: string; unknown: number };
  matrix: Array<{
    consumer: CanDeployPacticipant;
    provider: CanDeployPacticipant;
    verificationResult: { verifiedAt: string; success: boolean };
    pact: { createdAt: string };
  }>;
}
