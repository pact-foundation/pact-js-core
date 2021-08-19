import { initialiseFfi, libName } from './internals';
import { FfiBinding } from './internals/types';

// We have to declare this twice because typescript can't figure it out
// There's a workaround here we could employ:
// https://gist.github.com/jcalz/381562d282ebaa9b41217d1b31e2c211
type FfiVerifierType = {
  pactffi_init: ['string', ['string']];
  pactffi_version: ['string', []];
  pactffi_free_string: ['void', ['string']];
  pactffi_verify: ['int', ['string']];
};

const description: FfiVerifierType = {
  pactffi_init: ['string', ['string']],
  pactffi_version: ['string', []],
  pactffi_free_string: ['void', ['string']],
  pactffi_verify: ['int', ['string']],
};

export const getVerifierLib = (): FfiBinding<FfiVerifierType> =>
  initialiseFfi(libName('pact_ffi', 'v0.0.1'), description);
