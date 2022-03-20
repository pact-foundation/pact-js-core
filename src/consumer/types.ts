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
  request: RequestMismatch;
};

export type MatchingResultMissingRequest = {
  type: 'missing-request';
  method: string;
  path: string;
  request: RequestMismatch;
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

export type RequestMismatch = {
  method?: string;
  path?: string;
  headers?: Record<string, Array<string>>;
  query?: Record<string, Array<string>>;
  body?: string;
};

export type PluginInteraction = {
  withPluginRequestInteractionContents: (
    contentType: string,
    contents: string
  ) => boolean;
  withPluginResponseInteractionContents: (
    contentType: string,
    contents: string
  ) => boolean;
};

export type PluginPact = {
  addPlugin: (plugin: string, version: string) => void;
  cleanupPlugins: () => void;
};

export type ConsumerInteraction = PluginInteraction & {
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
  withPluginRequestInteractionContents: (
    contentType: string,
    contents: string
  ) => void;
  withPluginResponseInteractionContents: (
    contentType: string,
    contents: string
  ) => void;
};

export type ConsumerPact = PluginPact & {
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
  writePactFile: (dir: string, merge?: boolean) => void;
  /**
   * Check if a mock server has matched all its requests.
   *
   * @param port the port number the mock server is running on.
   * @returns {boolean} true if all requests have been matched. False if there
   * is no mock server on the given port, or if any request has not been successfully matched, or
   * the method panics.
   */
  mockServerMatchedSuccessfully: (port: number) => boolean;
  addMetadata: (namespace: string, name: string, value: string) => boolean;
};

export type ConsumerMessage = PluginInteraction & {
  given: (state: string) => void;
  givenWithParam: (state: string, name: string, value: string) => void;
  expectsToReceive: (description: string) => void;
  withMetadata: (name: string, value: string) => void;
  withContents: (body: Buffer, contentType: string) => void;
  reifyMessage: () => string;
};

export type ConsumerMessagePact = PluginPact & {
  newMessage: (description: string) => ConsumerMessage;
  /**
   * This function writes the pact file, regardless of whether or not the test was successful.
   * Do not call it without checking that the tests were successful, unless you want to write the wrong pact contents.
   *
   * @param dir the directory to write the pact file to
   * @param overwrite whether or not to overwrite the pact file contents (default true)
   */
  writePactFile: (dir: string, overwrite?: boolean) => void;
  addMetadata: (namespace: string, name: string, value: string) => boolean;
};
