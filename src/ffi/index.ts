import { initialiseFfi, libName } from './internals';
import { FfiBinding } from './internals/types';

import ref = require('ref-napi');
import structDi = require('ref-struct-di');

const struct = structDi(ref);

const pact = ref.types.void; // unknown type
const interaction = ref.types.void; // unknown type
const InteractionPtr = ref.refType(interaction);
const PactPtr = ref.refType(pact);
const PactHandle = struct({
  pact: PactPtr,
});
const InteractionHandle = struct({
  pact: PactPtr,
  interaction: InteractionPtr,
});

const PACT_FFI_VERSION = '0.0.2';

// We have to declare this twice because typescript can't figure it out
// There's a workaround here we could employ:
// https://gist.github.com/jcalz/381562d282ebaa9b41217d1b31e2c211
type FfiDeclarations = {
  pactffi_init: ['string', ['string']];
  pactffi_version: ['string', []];
  pactffi_free_string: ['void', ['string']];
  pactffi_verify: ['int', ['string']];
  pactffi_create_mock_server_for_pact: [
    'int',
    [typeof PactHandle, 'string', 'bool']
  ];
  pactffi_new_pact: [typeof PactHandle, ['string', 'string']];
  pactffi_new_interaction: [
    typeof InteractionHandle,
    [typeof PactHandle, 'string']
  ];
  pactffi_upon_receiving: ['void', [typeof InteractionHandle, 'string']];
  pactffi_given: ['void', [typeof InteractionHandle, 'string']];
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
  pactffi_response_status: ['void', [typeof InteractionHandle, 'int']];
  pactffi_write_pact_file: ['int', ['int', 'string']];
  pactffi_cleanup_mock_server: ['bool', ['int']];
  pactffi_mock_server_mismatches: ['string', ['int']];
  pactffi_get_tls_ca_certificate: ['string', []];
};

const description: FfiDeclarations = {
  pactffi_init: ['string', ['string']],
  pactffi_version: ['string', []],
  pactffi_free_string: ['void', ['string']],
  pactffi_verify: ['int', ['string']],
  pactffi_create_mock_server_for_pact: ['int', [PactHandle, 'string', 'bool']],
  pactffi_new_pact: [PactHandle, ['string', 'string']],
  pactffi_new_interaction: [InteractionHandle, [PactHandle, 'string']],
  pactffi_upon_receiving: ['void', [InteractionHandle, 'string']],
  pactffi_given: ['void', [InteractionHandle, 'string']],
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
  pactffi_response_status: ['void', [InteractionHandle, 'int']],
  pactffi_write_pact_file: ['int', ['int', 'string']],
  pactffi_cleanup_mock_server: ['bool', ['int']],
  pactffi_mock_server_mismatches: ['string', ['int']],
  pactffi_get_tls_ca_certificate: ['string', []],
};

export const getFfiLib = (): FfiBinding<FfiDeclarations> =>
  initialiseFfi(libName('pact_ffi', `v${PACT_FFI_VERSION}`), description);
