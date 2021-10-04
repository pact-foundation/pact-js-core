import ref = require('ref-napi');
import refStructDi = require('ref-struct-di');

const struct = refStructDi(ref);

const unknown = ref.types.void; // unknown type

const pact = unknown;
const interaction = unknown;
const InteractionPtr = ref.refType(interaction);
const PactPtr = ref.refType(pact);
const PactHandle = struct({
  pact: PactPtr,
});
const InteractionHandle = struct({
  pact: PactPtr,
  interaction: InteractionPtr,
});

// We have to declare this twice because typescript can't figure it out
// There's a workaround here we could employ:
// https://gist.github.com/jcalz/381562d282ebaa9b41217d1b31e2c211
export type FfiDeclarations = {
  pactffi_init: ['string', ['string']];
  pactffi_version: ['string', []];
  pactffi_free_string: ['void', ['string']];
  pactffi_verify: ['int', ['string']];
  pactffi_create_mock_server_for_pact: [
    'int',
    [typeof PactHandle, 'string', 'bool']
  ];
  pactffi_new_pact: [typeof PactHandle, ['string', 'string']];
  pactffi_with_specification: ['void', [typeof PactHandle, 'int']];
  pactffi_new_interaction: [
    typeof InteractionHandle,
    [typeof PactHandle, 'string']
  ];
  pactffi_upon_receiving: ['void', [typeof InteractionHandle, 'string']];
  pactffi_given: ['void', [typeof InteractionHandle, 'string']];
  pactffi_given_with_param: [
    'void',
    [typeof InteractionHandle, 'string', 'string', 'string']
  ];
  pactffi_with_request: [
    'void',
    [typeof InteractionHandle, 'string', 'string']
  ];
  pactffi_with_query_parameter: [
    'void',
    [typeof InteractionHandle, 'string', 'int', 'string']
  ];
  pactffi_with_header: [
    'void',
    [typeof InteractionHandle, 'int', 'string', 'int', 'string']
  ];
  pactffi_with_body: [
    'void',
    [typeof InteractionHandle, 'int', 'string', 'string']
  ];
  pactffi_with_binary_file: [
    'void',
    [typeof InteractionHandle, 'int', 'string', 'string', 'int']
  ];
  pactffi_with_multipart_file: [
    'void',
    [typeof InteractionHandle, 'int', 'string', 'string', 'string']
  ];
  pactffi_response_status: ['void', [typeof InteractionHandle, 'int']];
  pactffi_write_pact_file: ['int', ['int', 'string']];
  pactffi_cleanup_mock_server: ['bool', ['int']];
  pactffi_mock_server_mismatches: ['string', ['int']];
  pactffi_get_tls_ca_certificate: ['string', []];
  pactffi_log_message: ['void', ['string', 'string', 'string']];
  pactffi_log_to_buffer: ['int', ['int']];
  pactffi_init_with_log_level: ['void', ['int']];
  pactffi_log_to_stdout: ['int', ['int']];
  pactffi_log_to_file: ['int', ['string', 'int', 'int']];
  pactffi_fetch_log_buffer: ['string', ['int']];
};

export const declarations: FfiDeclarations = {
  pactffi_init: ['string', ['string']],
  pactffi_version: ['string', []],
  pactffi_free_string: ['void', ['string']],
  pactffi_verify: ['int', ['string']],
  pactffi_create_mock_server_for_pact: ['int', [PactHandle, 'string', 'bool']],
  pactffi_new_pact: [PactHandle, ['string', 'string']],
  pactffi_with_specification: ['void', [PactHandle, 'int']],
  pactffi_new_interaction: [InteractionHandle, [PactHandle, 'string']],
  pactffi_upon_receiving: ['void', [InteractionHandle, 'string']],
  pactffi_given: ['void', [InteractionHandle, 'string']],
  pactffi_given_with_param: [
    'void',
    [InteractionHandle, 'string', 'string', 'string'],
  ],
  pactffi_with_request: ['void', [InteractionHandle, 'string', 'string']],
  pactffi_with_query_parameter: [
    'void',
    [InteractionHandle, 'string', 'int', 'string'],
  ],
  pactffi_with_header: [
    'void',
    [InteractionHandle, 'int', 'string', 'int', 'string'],
  ],
  pactffi_with_body: ['void', [InteractionHandle, 'int', 'string', 'string']],
  pactffi_with_binary_file: [
    'void',
    [InteractionHandle, 'int', 'string', 'string', 'int'],
  ],
  pactffi_with_multipart_file: [
    'void',
    [InteractionHandle, 'int', 'string', 'string', 'string'],
  ],
  pactffi_response_status: ['void', [InteractionHandle, 'int']],
  pactffi_write_pact_file: ['int', ['int', 'string']],
  pactffi_cleanup_mock_server: ['bool', ['int']],
  pactffi_mock_server_mismatches: ['string', ['int']],
  pactffi_get_tls_ca_certificate: ['string', []],
  pactffi_log_message: ['void', ['string', 'string', 'string']],
  pactffi_log_to_buffer: ['int', ['int']],
  pactffi_init_with_log_level: ['void', ['int']],
  pactffi_fetch_log_buffer: ['string', ['int']],
  pactffi_log_to_stdout: ['int', ['int']],
  pactffi_log_to_file: ['int', ['string', 'int', 'int']],
};

export enum FfiFunctionResult {
  RESULT_OK = 0,
  RESULT_FAILED,
}

export enum FfiSpecificationVersion {
  SPECIFICATION_VERSION_UNKNOWN = 0,
  SPECIFICATION_VERSION_V1,
  SPECIFICATION_VERSION_V1_1,
  SPECIFICATION_VERSION_V2,
  SPECIFICATION_VERSION_V3,
  SPECIFICATION_VERSION_V4,
}

export enum FfiInteractionPart {
  INTERACTION_PART_REQUEST = 0,
  INTERACTION_PART_RESPONSE,
}

export enum FfiLogLevelFilter {
  LOG_LEVEL_OFF = 0,
  LOG_LEVEL_ERROR,
  LOG_LEVEL_WARN,
  LOG_LEVEL_INFO,
  LOG_LEVEL_DEBUG,
  LOG_LEVEL_TRACE,
}
