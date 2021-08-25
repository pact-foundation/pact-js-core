import chai = require('chai');
import { libName } from '.';
import chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

describe('ffi names', () => {
  it('has the correct name for windows', () => {
    expect(libName('pact_ffi', 'v0.0.1', 'x64', 'win32')).to.be.equal(
      'v0.0.1-pact_ffi-windows-x86_64.dll'
    );
  });
  it('has the correct name for linux', () => {
    expect(libName('pact_ffi', 'v0.0.1', 'x64', 'linux')).to.be.equal(
      'v0.0.1-libpact_ffi-linux-x86_64.so'
    );
  });
  it('has the correct name for osx intel', () => {
    expect(libName('pact_ffi', 'v0.0.1', 'x64', 'darwin')).to.be.equal(
      'v0.0.1-libpact_ffi-osx-x86_64.dylib'
    );
  });
  it('has the correct name for osx arm', () => {
    expect(libName('pact_ffi', 'v0.0.1', 'arm64', 'darwin')).to.be.equal(
      'v0.0.1-libpact_ffi-osx-aarch64-apple-darwin.dylib'
    );
  });
});
