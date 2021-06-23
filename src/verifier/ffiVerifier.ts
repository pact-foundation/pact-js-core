import path = require('path');
import { initialiseFfi } from '../ffi/ffi';

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

// TODO: make this dynamic and select the right one for the architecture
const dll = path.resolve(
  process.cwd(),
  'ffi',
  'libpact_verifier_ffi-osx-x86_64.dylib'
);

export const verifierLib = initialiseFfi(dll, description);
