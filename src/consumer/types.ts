export type MatchingResult =
  | MatchingResultSuccess
  | MatchingResultRequestMismatch
  | MatchingResultRequestNotFound
  | MatchingResultMissingRequest;

// As far as I can tell, MatchingResultSuccess is actually
// never produced by the FFI lib
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
  givenWithParam: (state: string, name: string, value: string) => boolean;
  withRequest: (method: string, path: string) => boolean;
  withQuery: (name: string, index: number, value: string) => boolean;
  withStatus: (status: number) => boolean;
  withRequestHeader: (name: string, index: number, value: string) => boolean;
  withRequestBody: (body: string, contentType: string) => boolean;
  withRequestBinaryBody: (body: Buffer, contentType: string) => boolean;
  withRequestMultipartBody: (
    contentType: string,
    filename: string,
    mimePartName: string
  ) => boolean;
  withResponseHeader: (name: string, index: number, value: string) => boolean;
  withResponseBody: (body: string, contentType: string) => boolean;
  withResponseBinaryBody: (body: Buffer, contentType: string) => boolean;
  withResponseMultipartBody: (
    contentType: string,
    filename: string,
    mimePartName: string
  ) => boolean;
};

export type ConsumerPact = {
  newInteraction: (description: string) => ConsumerInteraction;
  createMockServer: (address: string, port?: number, tls?: boolean) => number;
  mockServerMismatches: (port: number) => MatchingResult[];
  cleanupMockServer: (port: number) => boolean;
  /**
   * This function writes the pact file, regardless of whether or not the test was successful.
   * Do not call it without checking that the tests were successful, unless you want to write the wrong pact contents.
   *
   * @param port the port number the mock server is running on.
   * @param dir the directory to write the pact file to
   * @param merge whether or not to merge the pact file contents (default true)
   */
  writePactFile: (port: number, dir: string, merge?: boolean) => void;
  /**
   * Check if a mock server has matched all its requests.
   *
   * @param port the port number the mock server is running on.
   * @returns {boolean} true if all requests have been matched. False if there
   * is no mock server on the given port, or if any request has not been successfully matched, or
   * the method panics.
   */
  mockServerMatchedSuccessfully: (port: number) => boolean;
};
