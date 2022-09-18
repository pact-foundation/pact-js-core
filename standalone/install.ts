import chalk = require('chalk');

// Get latest version from https://github.com/pact-foundation/pact-ruby-standalone/releases
export const PACT_STANDALONE_VERSION = '1.91.0';

function throwError(msg: string): never {
  throw new Error(chalk.red(`Error while locating pact binary: ${msg}`));
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
        binary: `pact-${PACT_STANDALONE_VERSION}-linux-x86_64.tar.gz`,
        binaryChecksum: `pact-${PACT_STANDALONE_VERSION}-linux-x86_64.tar.gz${CHECKSUM_SUFFIX}`,
        folderName: `linux-x64-${PACT_STANDALONE_VERSION}`,
      },
    ],
  };
}

const CONFIG = createConfig();

export function getBinaryEntry(platform?: string, arch?: string): BinaryEntry {
  platform = platform || process.platform;
  arch = arch || process.arch;
  for (let value of CONFIG.binaries) {
    if (
      value.platform === platform &&
      (value.arch ? value.arch === arch : true)
    ) {
      return value;
    }
  }
  throw throwError(
    `Cannot find binary for platform '${platform}' with architecture '${arch}'.`
  );
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
