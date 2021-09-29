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
  /**
   * External interface to create a mock server. A pointer to the pact JSON as a C string is passed in,
   * as well as the port for the mock server to run on. A value of 0 for the port will result in a
   * port being allocated by the operating system. The port of the mock server is returned.
   *
   * * `pact_str` - Pact JSON
   * * `addr_str` - Address to bind to in the form name:port (i.e. 127.0.0.1:0)
   * * `tls` - boolean flag to indicate of the mock server should use TLS (using a self-signed certificate)
   *
   * # Errors
   *
   * Errors are returned as negative values.
   *
   * | Error | Description |
   * |-------|-------------|
   * | -1 | A null pointer was received |
   * | -2 | The pact JSON could not be parsed |
   * | -3 | The mock server could not be started |
   * | -4 | The method panicked |
   * | -5 | The address is not valid |
   * | -6 | Could not create the TLS configuration with the self-signed certificate |
   *
   *  int32_t pactffi_create_mock_server(const char *pact_str,
   *   const char *addr_str,
   *   bool tls);
   */
  pactffi_create_mock_server_for_pact: [
    'int',
    [typeof PactHandle, 'string', 'bool']
  ];
  pactffi_new_pact: [typeof PactHandle, ['string', 'string']];
  pactffi_with_specification: [
    'bool',
    [typeof PactHandle, FfiEnum<FfiSpecificationVersion>]
  ];
  /**
   * Creates a new Interaction and returns a handle to it.
   *
   * * `description` - The interaction description. It needs to be unique for each interaction.
   *
   * Returns a new `InteractionHandle`.
   *
   * struct InteractionHandle pactffi_new_interaction(struct PactHandle pact, const char *description);
   */
  pactffi_new_interaction: [
    typeof InteractionHandle,
    [typeof PactHandle, 'string']
  ];
  /**
   * Sets the description for the Interaction. Returns false if the interaction or Pact can't be
   * modified (i.e. the mock server for it has already started)
   *
   * `description` - The interaction description. It needs to be unique for each interaction.
   *
   * bool pactffi_upon_receiving(struct InteractionHandle interaction, const char *description);
   */
  pactffi_upon_receiving: ['bool', [typeof InteractionHandle, 'string']];
  /** bool pactffi_given(struct InteractionHandle interaction, const char *description); */
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
  /**
   * External interface to trigger a mock server to write out its pact file. This function should
   * be called if all the consumer tests have passed. The directory to write the file to is passed
   * as the second parameter. If a NULL pointer is passed, the current working directory is used.
   *
   * If overwrite is true, the file will be overwritten with the contents of the current pact.
   * Otherwise, it will be merged with any existing pact file.
   *
   * Returns 0 if the pact file was successfully written. Returns a positive code if the file can
   * not be written, or there is no mock server running on that port or the function panics.
   *
   * # Errors
   *
   * Errors are returned as positive values.
   *
   * | Error | Description |
   * |-------|-------------|
   * | 1 | A general panic was caught |
   * | 2 | The pact file was not able to be written |
   * | 3 | A mock server with the provided port was not found |
   */
  pactffi_write_pact_file: ['int', ['int', 'string']];
  /**
   * External interface to cleanup a mock server. This function will try terminate the mock server
   * with the given port number and cleanup any memory allocated for it. Returns true, unless a
   * mock server with the given port number does not exist, or the function panics.
   */
  pactffi_cleanup_mock_server: ['bool', ['int']];
  /**
   * External interface to get all the mismatches from a mock server. The port number of the mock
   * server is passed in, and a pointer to a C string with the mismatches in JSON format is
   * returned.
   *
   * **NOTE:** The JSON string for the result is allocated on the heap, and will have to be freed
   * once the code using the mock server is complete. The [`cleanup_mock_server`](fn.cleanup_mock_server.html) function is
   * provided for this purpose.
   *
   * # Errors
   *
   * If there is no mock server with the provided port number, or the function panics, a NULL
   * pointer will be returned. Don't try to dereference it, it will not end well for you.
   *
   * char *pactffi_mock_server_mismatches(int32_t mock_server_port);
   */
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
