import chalk = require('chalk');

// Get latest version from https://github.com/pact-foundation/pact-ruby-standalone/releases
export const PACT_STANDALONE_VERSION = '1.92.00';

function makeError(msg: string): Error {
  return new Error(chalk.red(`Error while locating pact binary: ${msg}`));
}

export function createConfig(): Config {
  const CHECKSUM_SUFFIX = '.checksum';

  return {
    binaries: [
      {
        platform: 'win32',
        binary: `pact-${PACT_STANDALONE_VERSION}-win32.zip`,
        binaryChecksum: `pact-${PACT_STANDALONE_VERSION}-win32.zip${CHECKSUM_SUFFIX}`,
        folderName: `win32-${PACT_STANDALONE_VERSION}`,
      },
      {
        platform: 'darwin',
        binary: `pact-${PACT_STANDALONE_VERSION}-osx.tar.gz`,
        binaryChecksum: `pact-${PACT_STANDALONE_VERSION}-osx.tar.gz${CHECKSUM_SUFFIX}`,
        folderName: `darwin-${PACT_STANDALONE_VERSION}`,
      },
      {
        platform: 'linux',
        arch: 'x64',
        binary: `pact-${PACT_STANDALONE_VERSION}-linux-x86_64.tar.gz`,
        binaryChecksum: `pact-${PACT_STANDALONE_VERSION}-linux-x86_64.tar.gz${CHECKSUM_SUFFIX}`,
        folderName: `linux-x64-${PACT_STANDALONE_VERSION}`,
      },
    ],
  };
}

const CONFIG = createConfig();

export function getBinaryEntry(
  platform: string = process.platform,
  arch: string = process.arch
): BinaryEntry {
  const found = CONFIG.binaries.find(
    (value) =>
      value.platform === platform && (value.arch ? value.arch === arch : true)
  );
  if (found === undefined) {
    throw makeError(
      `Cannot find binary for platform '${platform}' with architecture '${arch}'.`
    );
  }
  return found;
}

export interface Config {
  binaries: BinaryEntry[];
}

export interface BinaryEntry {
  platform: string;
  arch?: string;
  binary: string;
  binaryChecksum: string;
  folderName: string;
}
