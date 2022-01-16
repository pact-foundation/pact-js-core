export type FfiPactHandle = number;
export type FfiInteractionHandle = number;

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
  pactffiVerify(
    args: string,
    callback: (e: Error, res: number) => void
  ): number;
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
  pactffiWritePactFile(port: number, dir: string, overwrite: boolean): number;
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
};
