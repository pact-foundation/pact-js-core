import ref = require('ref-napi');
import refStructDi = require('ref-struct-di');
import { FfiEnum } from './internals/types';
import { FfiInteractionPart, FfiSpecificationVersion } from './types';

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

const StringResultStruct = struct({
  tag: ref.types.int,
  ok: ref.types.CString,
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
  pactffi_with_specification: [
    'bool',
    [typeof PactHandle, FfiEnum<FfiSpecificationVersion>]
  ];
  pactffi_new_interaction: [
    typeof InteractionHandle,
    [typeof PactHandle, 'string']
  ];
  pactffi_upon_receiving: ['bool', [typeof InteractionHandle, 'string']];
  pactffi_given: ['bool', [typeof InteractionHandle, 'string']];
  pactffi_given_with_param: [
    'bool',
    [typeof InteractionHandle, 'string', 'string', 'string']
  ];
  pactffi_with_request: [
    'bool',
    [typeof InteractionHandle, 'string', 'string']
  ];
  pactffi_with_query_parameter: [
    'bool',
    [typeof InteractionHandle, 'string', 'int', 'string']
  ];
  pactffi_with_header: [
    'bool',
    [
      typeof InteractionHandle,
      FfiEnum<FfiInteractionPart>,
      'string',
      'int',
      'string'
    ]
  ];
  pactffi_with_body: [
    'bool',
    [typeof InteractionHandle, FfiEnum<FfiInteractionPart>, 'string', 'string']
  ];
  pactffi_with_binary_file: [
    'bool',
    [
      typeof InteractionHandle,
      FfiEnum<FfiInteractionPart>,
      'string',
      'string',
      'int'
    ]
  ];
  pactffi_with_multipart_file: [
    typeof StringResultStruct,
    [typeof InteractionHandle, 'int', 'string', 'string', 'string']
  ];
  pactffi_response_status: ['bool', [typeof InteractionHandle, 'int']];
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
  pactffi_with_specification: ['bool', [PactHandle, 'int']],
  pactffi_new_interaction: [InteractionHandle, [PactHandle, 'string']],
  pactffi_upon_receiving: ['bool', [InteractionHandle, 'string']],
  pactffi_given: ['bool', [InteractionHandle, 'string']],
  pactffi_given_with_param: [
    'bool',
    [InteractionHandle, 'string', 'string', 'string'],
  ],
  pactffi_with_request: ['bool', [InteractionHandle, 'string', 'string']],
  pactffi_with_query_parameter: [
    'bool',
    [InteractionHandle, 'string', 'int', 'string'],
  ],
  pactffi_with_header: [
    'bool',
    [InteractionHandle, 'int', 'string', 'int', 'string'],
  ],
  pactffi_with_body: ['bool', [InteractionHandle, 'int', 'string', 'string']],
  pactffi_with_binary_file: [
    'bool',
    [InteractionHandle, 'int', 'string', 'string', 'int'],
  ],
  pactffi_with_multipart_file: [
    StringResultStruct,
    [InteractionHandle, 'int', 'string', 'string', 'string'],
  ],
  pactffi_response_status: ['bool', [InteractionHandle, 'int']],
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

export enum FfiLogLevelFilter {
  LOG_LEVEL_OFF = 0,
  LOG_LEVEL_ERROR,
  LOG_LEVEL_WARN,
  LOG_LEVEL_INFO,
  LOG_LEVEL_DEBUG,
  LOG_LEVEL_TRACE,
}
