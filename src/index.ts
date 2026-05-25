import pact from './pact';

// biome-ignore lint/suspicious/noGlobalAssign: CJS/ESM interop pattern required for backwards compatibility
module.exports = exports = pact;

export default pact;

export * from './consumer';
export * from './consumer/types';
export * from './ffi';
export * from './logger';
export * from './logger/types';
export * from './verifier';
export * from './verifier/types';
