export type MatchingResult =
  | MatchingResultSuccess
  | MatchingResultRequestMismatch
  | MatchingResultRequestNotFound
  | MatchingResultMissingRequest;

export type MatchingResultSuccess = {
  type: 'request-match';
};

export type MatchingResultRequestMismatch = {
  type: 'request-mismatch';
  method: string;
  path: string;
  mismatches: Mismatch[];
};

export type MatchingResultRequestNotFound = {
  type: 'request-not-found';
  method: string;
  path: string;
  request: unknown;
};

export type MatchingResultMissingRequest = {
  type: 'missing-request';
  method: string;
  path: string;
  request: unknown;
};

export type Mismatch =
  | MethodMismatch
  | PathMismatch
  | StatusMismatch
  | QueryMismatch
  | HeaderMismatch
  | BodyTypeMismatch
  | BodyMismatch
  | MetadataMismatch;

export type MethodMismatch = {
  type: 'MethodMismatch';
  expected: string;
  actual: string;
};

export type PathMismatch = {
  type: 'PathMismatch';
  expected: string;
  actual: string;
  mismatch: string;
};

export type StatusMismatch = {
  type: 'StatusMismatch';
  expected: string;
  actual: string;
  mismatch: string;
};

export type QueryMismatch = {
  type: 'QueryMismatch';
  parameter: string;
  expected: string;
  actual: string;
  mismatch: string;
};

export type HeaderMismatch = {
  type: 'HeaderMismatch';
  key: string;
  expected: string;
  actual: string;
  mismatch: string;
};

export type BodyTypeMismatch = {
  type: 'BodyTypeMismatch';
  expected: string;
  actual: string;
  mismatch: string;
  expectedBody?: string;
  actualBody?: string;
};

export type BodyMismatch = {
  type: 'BodyMismatch';
  path: string;
  expected?: string;
  actual?: string;
  mismatch: string;
};

export type MetadataMismatch = {
  type: 'MetadataMismatch';
  key: string;
  expected: string;
  actual: string;
  mismatch: string;
};

export type ConsumerInteraction = {
  uponReceiving: (description: string) => boolean;
  given: (state: string) => boolean;
  withRequest: (method: string, path: string) => boolean;
  withQuery: (name: string, index: number, value: string) => boolean;
  withStatus: (status: number) => boolean;
  withRequestHeader: (name: string, index: number, value: string) => boolean;
  withRequestBody: (body: string, contentType: string) => boolean;
  withResponseHeader: (name: string, index: number, value: string) => boolean;
  withResponseBody: (body: string, contentType: string) => boolean;
};

export type ConsumerPact = {
  newInteraction: (description: string) => ConsumerInteraction;
  createMockServer: (address: string, tls?: boolean) => number;
  mockServerMismatches: (port: number) => MatchingResult;
  cleanupMockServer: (port: number) => boolean;
};
