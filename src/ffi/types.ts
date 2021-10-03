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
