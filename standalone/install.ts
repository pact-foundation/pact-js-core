import chalk = require('chalk');

// Get latest version from https://github.com/pact-foundation/pact-ruby-standalone/releases
export const PACT_STANDALONE_VERSION = '2.0.4';

function makeError(msg: string): Error {
  return new Error(chalk.red(`Error while locating pact binary: ${msg}`));
}

export function createConfig(): Config {
  return {
    binaries: [
      ['win32', 'x64', 'windows', 'x64', 'zip'],
      ['darwin', 'arm64', 'osx', 'arm64', 'tar.gz'],
      ['darwin', 'x64', 'osx', 'x86_64', 'tar.gz'],
      ['linux', 'arm64', 'linux', 'arm64', 'tar.gz'],
      ['linux', 'x64', 'linux', 'x64', 'tar.gz'],
    ].map(([platform, arch, downloadPlatform, downloadArch, extension]) => {
      const binary = `pact-${PACT_STANDALONE_VERSION}-${downloadPlatform}-${downloadArch}.${extension}`;
      return {
        platform,
        arch,
        binary,
        binaryChecksum: `${binary}.checksum`,
        folderName: `${
          platform === 'win32' ? 'windows' : platform
        }-${arch}-${PACT_STANDALONE_VERSION}`,
      };
    }),
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
