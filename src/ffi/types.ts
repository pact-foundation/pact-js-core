export type FfiHandle = number;
export type FfiPactHandle = number;
export type FfiInteractionHandle = number;
export type FfiVerifierHandle = number;
export type FfiMessagePactHandle = number;
export type FfiMessageHandle = number;

export type FfiSpecificationVersion = 0 | 1 | 2 | 3 | 4 | 5;

export const FfiSpecificationVersion: Record<string, FfiSpecificationVersion> =
  {
    SPECIFICATION_VERSION_UNKNOWN: 0,
    SPECIFICATION_VERSION_V1: 1,
    SPECIFICATION_VERSION_V1_1: 2,
    SPECIFICATION_VERSION_V2: 3,
    SPECIFICATION_VERSION_V3: 4,
    SPECIFICATION_VERSION_V4: 5,
  };

export type FfiWritePactResponse = 0 | 1 | 2 | 3;

export const FfiWritePactResponse: Record<string, FfiWritePactResponse> = {
  SUCCESS: 0,
  GENERAL_PANIC: 1,
  UNABLE_TO_WRITE_PACT_FILE: 2,
  MOCK_SERVER_NOT_FOUND: 3,
};

export type FfiWriteMessagePactResponse = 0 | 1 | 2;

export const FfiWriteMessagePactResponse: Record<
  string,
  FfiWriteMessagePactResponse
> = {
  SUCCESS: 0,
  UNABLE_TO_WRITE_PACT_FILE: 1,
  MESSAGE_HANDLE_INVALID: 2,
};

export type FfiConfigurePluginResponse = 0 | 1 | 2 | 3;

export const FfiConfigurePluginResponse: Record<
  string,
  FfiConfigurePluginResponse
> = {
  SUCCESS: 0,
  GENERAL_PANIC: 1,
  FAILED_TO_LOAD_PLUGIN: 2,
  PACT_HANDLE_INVALID: 3,
};

export type FfiPluginInteractionResponse = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const FfiPluginInteractionResponse: Record<
  string,
  FfiPluginInteractionResponse
> = {
  SUCCESS: 0,
  A_GENERAL_PANIC_WAS_CAUGHT: 1,
  MOCK_SERVER_HAS_ALREADY_BEEN_STARTED: 2,
  INTERACTION_HANDLE_IS_INVALID: 3,
  CONTENT_TYPE_IS_NOT_VALID: 4,
  CONTENTS_JSON_IS_NOT_VALID_JSON: 5,
  PLUGIN_RETURNED_AN_ERROR: 6,
};

export type FfiInteractionPart = 0 | 1;

export const INTERACTION_PART_REQUEST: FfiInteractionPart = 0;
export const INTERACTION_PART_RESPONSE: FfiInteractionPart = 1;

export const CREATE_MOCK_SERVER_ERRORS = {
  NULL_POINTER: -1,
  JSON_PARSE_ERROR: -2,
  MOCK_SERVER_START_FAIL: -3,
  CORE_PANIC: -4,
  ADDRESS_NOT_VALID: -5,
  TLS_CONFIG: -6,
};
/*
-1	A null pointer was received
-2	The pact JSON could not be parsed
-3	The mock server could not be started
-4	The method panicked
-5	The address is not valid
-6	Could not create the TLS configuration with the self-signed certificate
*/

export enum VERIFY_PROVIDER_RESPONSE {
  VERIFICATION_SUCCESSFUL = 0,
  VERIFICATION_FAILED,
  NULL_POINTER_RECEIVED,
  METHOD_PANICKED,
  INVALID_ARGUMENTS,
}
/*
 * | Error | Description |
 * |-------|-------------|
 * | 1 | The verification process failed, see output for errors |
 * | 2 | A null pointer was received |
 * | 3 | The method panicked |
 * | 4 | Invalid arguments were provided to the verification process |
 */

export enum FfiFunctionResult {
  RESULT_OK = 0,
  RESULT_FAILED,
}

export enum FfiLogLevelFilter {
  LOG_LEVEL_OFF = 0,
  LOG_LEVEL_ERROR,
  LOG_LEVEL_WARN,
  LOG_LEVEL_INFO,
  LOG_LEVEL_DEBUG,
  LOG_LEVEL_TRACE,
}

export type Ffi = {
  pactffiInit(logLevel: string): string;
  pactffiVersion(): string;
} & FfiConsumerFunctions &
  FfiVerificationFunctions;

export type FfiConsumerFunctions = {
  pactffiCreateMockServerForPact(
    handle: FfiPactHandle,
    address: string,
    tls: boolean
  ): number;
  pactffiNewPact(consumer: string, provider: string): FfiPactHandle;
  pactffiWithSpecification(
    handle: FfiPactHandle,
    specification: FfiSpecificationVersion
  ): boolean;
  pactffiWithPactMetadata(
    handle: FfiPactHandle,
    namespace_: string,
    name: string,
    value: string
  ): boolean;
  pactffiNewInteraction(
    handle: FfiPactHandle,
    description: string
  ): FfiInteractionHandle;
  pactffiUponReceiving(
    handle: FfiInteractionHandle,
    description: string
  ): boolean;
  pactffiGiven(handle: FfiInteractionHandle, providerState: string): boolean;
  pactffiGivenWithParam(
    handle: FfiInteractionHandle,
    description: string,
    name: string,
    value: string
  ): boolean;
  pactffiWithRequest(
    handle: FfiInteractionHandle,
    method: string,
    path: string
  ): boolean;
  pactffiWithQueryParameter(
    handle: FfiInteractionHandle,
    name: string,
    index: number,
    value: string
  ): boolean;
  pactffiWithHeader(
    handle: FfiInteractionHandle,
    part: FfiInteractionPart,
    name: string,
    index: number,
    value: string
  ): boolean;
  pactffiWithBody(
    handle: FfiInteractionHandle,
    part: FfiInteractionPart,
    contentType: string,
    body: string
  ): boolean;
  pactffiWithBinaryFile(
    handle: FfiInteractionHandle,
    part: FfiInteractionPart,
    contentType: string,
    body: Buffer,
    size: number
  ): boolean;
  pactffiWithMultipartFile(
    handle: FfiInteractionHandle,
    part: FfiInteractionPart,
    contentType: string,
    file: string,
    partName: string
  ): void;
  pactffiResponseStatus(handle: FfiInteractionHandle, status: number): boolean;
  pactffiWritePactFile(
    handle: FfiPactHandle,
    dir: string,
    overwrite: boolean
  ): FfiWritePactResponse;
  pactffiCleanupMockServer(port: number): boolean;
  pactffiMockServerMatched(port: number): boolean;
  pactffiMockServerMismatches(port: number): string;
  pactffiGetTlsCaCertificate(): string;
  pactffiLogMessage(source: string, logLevel: string, message: string): void;
  pactffiLogToBuffer(level: FfiLogLevelFilter): number;
  pactffiInitWithLogLevel(level: string): void;
  pactffiLogToStdout(level: FfiLogLevelFilter): number;
  pactffiLogToFile(fileName: string, level: FfiLogLevelFilter): number;
  pactffiFetchLogBuffer(logId: number): string;
  pactffiUsingPlugin(
    handle: FfiPactHandle,
    name: string,
    version: string
  ): FfiConfigurePluginResponse;
  pactffiCleanupPlugins(handle: FfiPactHandle): void;
  pactffiPluginInteractionContents(
    handle: FfiInteractionHandle,
    part: FfiInteractionPart,
    contentType: string,
    contents: string
  ): void;
  pactffiNewAsyncMessage(
    handle: FfiPactHandle,
    description: string
  ): FfiMessageHandle;
  // TODO: not sure how to use this given the return type, commenting out for now
  // pactffiNewSyncMessage(
  //   handle: FfiPactHandle,
  //   description: string
  // ): FfiInteractionHandle;
  // TODO: removing the old "FfiMessagePactHandle" based methods
  // pactffiNewMessagePact(
  //   consumer: string,
  //   provider: string
  // ): FfiMessagePactHandle;
  // pactffiWithMessagePactMetadata(
  //   handle: FfiMessagePactHandle,
  //   namespace: string,
  //   key: string,
  //   value: string
  // ): void;
  // pactffiWriteMessagePactFile(
  //   handle: FfiMessagePactHandle,
  //   dir: string,
  //   overwrite: boolean
  // ): FfiWriteMessagePactResponse;
  // pactffiNewMessage(
  //   handle: FfiMessagePactHandle,
  //   description: string
  // ): FfiMessageHandle;
  pactffiMessageExpectsToReceive(
    handle: FfiMessageHandle,
    description: string
  ): void;
  pactffiMessageGiven(handle: FfiMessageHandle, description: string): void;
  pactffiMessageGivenWithParam(
    handle: FfiMessageHandle,
    description: string,
    key: string,
    value: string
  ): void;
  pactffiMessageWithContents(
    handle: FfiMessageHandle,
    contentType: string,
    data: string
  ): void;
  pactffiMessageWithBinaryContents(
    handle: FfiMessageHandle,
    contentType: string,
    data: Buffer,
    size: number
  ): void;
  pactffiMessageWithMetadata(
    handle: FfiMessageHandle,
    key: string,
    value: string
  ): void;
  pactffiMessageReify(handle: FfiMessageHandle): string;
};

export type FfiVerificationFunctions = {
  pactffiVerifierNewForApplication(
    libraryName: string,
    version: string
  ): FfiVerifierHandle;
  pactffiVerifierExecute(
    handle: FfiVerifierHandle,
    callback: (e: Error, res: number) => void
  ): number;
  pactffiVerifierShutdown(handle: FfiVerifierHandle): void;
  pactffiVerifierSetProviderInfo(
    handle: FfiVerifierHandle,
    providerName: string,
    scheme: string,
    host: string,
    port: number,
    path: string
  ): void;
  pactffiVerifierSetFilterInfo(
    handle: FfiVerifierHandle,
    description: string,
    state: string,
    noState: boolean
  ): void;
  pactffiVerifierSetProviderState(
    handle: FfiVerifierHandle,
    url: string,
    teardown: boolean,
    body: boolean
  ): void;
  pactffiVerifierSetVerificationOptions(
    handle: FfiVerifierHandle,
    disableSslVerification: boolean,
    requestTimeout: number
  ): void;
  pactffiVerifierSetPublishOptions(
    handle: FfiVerifierHandle,
    providerVersion: string,
    buildUrl: string,
    providerTags: string[],
    providerBranch: string
  ): void;
  pactffiVerifierSetConsumerFilters(
    handle: FfiVerifierHandle,
    consumers: string[]
  ): void;
  pactffiVerifierAddCustomHeader(
    handle: FfiVerifierHandle,
    header: string,
    value: string
  ): void;
  pactffiVerifierAddFileSource(handle: FfiVerifierHandle, file: string): void;
  pactffiVerifierAddDirectorySource(
    handle: FfiVerifierHandle,
    dir: string
  ): void;
  pactffiVerifierUrlSource(
    handle: FfiVerifierHandle,
    url: string,
    username: string,
    password: string,
    token: string
  ): void;
  // pactffiVerifierBrokerSource(handle: FfiVerifierHandle): void;
  pactffiVerifierBrokerSourceWithSelectors(
    handle: FfiVerifierHandle,
    url: string,
    username: string,
    password: string,
    token: string,
    enablePending: boolean,
    includeWipPactsSince: string,
    providerTags: string[],
    providerBranch: string,
    consumerVersionSelectors: string[],
    consumerVersionTags: string[]
  ): void;
};
