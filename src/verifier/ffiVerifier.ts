import { initialiseFfi, libName } from '../ffi/ffi';

// We have to declare this twice because typescript can't figure it out
// There's a workaround here we could employ:
// https://gist.github.com/jcalz/381562d282ebaa9b41217d1b31e2c211
type FfiVerifierType = {
  init: ['string', ['string']];
  version: ['string', []];
  free_string: ['void', ['string']];
  verify: ['int', ['string']];
};

const description: FfiVerifierType = {
  init: ['string', ['string']],
  version: ['string', []],
  free_string: ['void', ['string']],
  verify: ['int', ['string']],
};

export const verifierLib = initialiseFfi(
  libName('libpact_verifier_ffi', 'v0.0.5'),
  description
);
