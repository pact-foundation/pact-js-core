import chalk = require('chalk');

// Get latest version from https://github.com/pact-foundation/pact-ruby-standalone/releases
export const PACT_STANDALONE_VERSION = '2.0.2';

function makeError(msg: string): Error {
  return new Error(chalk.red(`Error while locating pact binary: ${msg}`));
}

export function createConfig(): Config {
  return {
    binaries: [
      [ 'win32',  'x86',    'windows', 'zip' ],
      [ 'win32',  'x86_64', 'windows', 'zip' ],
      [ 'darwin', 'arm64',  'osx',     'tar.gz' ],
      [ 'darwin', 'x86_64', 'osx',     'tar.gz' ],
      [ 'linux',  'arm64',  'linux',   'tar.gz' ],
      [ 'linux',  'x64',    'linux',   'tar.gz' ],
    ].map(([ platform, arch, name, extension ]) => {
      const binary = `pact-${PACT_STANDALONE_VERSION}-${name}-${arch}.${extension}`;
      return {
        platform,
        arch,
        binary,
        binaryChecksum: `${binary}.checksum`,
        folderName: `${platform}-${arch}-${PACT_STANDALONE_VERSION}`
      }
    })
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
