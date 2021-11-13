import chalk = require('chalk');
import path = require('path');
import fs = require('fs');

// Get latest version from https://github.com/pact-foundation/pact-ruby-standalone/releases
export const PACT_STANDALONE_VERSION = '1.88.80';
const PACT_DEFAULT_LOCATION = `https://github.com/pact-foundation/pact-ruby-standalone/releases/download/v${PACT_STANDALONE_VERSION}/`;
const HTTP_REGEX = /^http(s?):\/\//;

function throwError(msg: string): never {
  throw new Error(chalk.red(`Error while installing binary: ${msg}`));
}

function getBinaryLocation(
  location: string,
  basePath: string
): string | undefined {
  // Check if location is valid and is a string
  if (!location || location.length === 0) {
    return undefined;
  }

  // Check if it's a URL, if not, try to resolve the path to work with either absolute or relative paths
  return HTTP_REGEX.test(location)
    ? location
    : path.resolve(basePath, location);
}
function findPackageConfig(location: string, tries = 10): PackageConfig {
  if (tries === 0) {
    return {};
  }
  const packagePath = path.resolve(location, 'package.json');
  if (fs.existsSync(packagePath)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require(packagePath).config;
    if (config && (config.pact_binary_location || config.pact_do_not_track)) {
      return {
        binaryLocation: getBinaryLocation(
          config.pact_binary_location,
          location
        ),
        doNotTrack: config.pact_do_not_track,
      };
    }
  }

  return findPackageConfig(path.resolve(location, '..'), tries - 1);
}

export function createConfig(location: string = process.cwd()): Config {
  const packageConfig = findPackageConfig(location);
  const PACT_BINARY_LOCATION =
    packageConfig.binaryLocation || PACT_DEFAULT_LOCATION;
  const CHECKSUM_SUFFIX = '.checksum';

  return {
    doNotTrack:
      packageConfig.doNotTrack ||
      process.env.PACT_DO_NOT_TRACK !== undefined ||
      false,
    binaries: [
      {
        platform: 'win32',
        binary: `pact-${PACT_STANDALONE_VERSION}-win32.zip`,
        binaryChecksum: `pact-${PACT_STANDALONE_VERSION}-win32.zip${CHECKSUM_SUFFIX}`,
        downloadLocation: PACT_BINARY_LOCATION,
        folderName: `win32-${PACT_STANDALONE_VERSION}`,
      },
      {
        platform: 'darwin',
        binary: `pact-${PACT_STANDALONE_VERSION}-osx.tar.gz`,
        binaryChecksum: `pact-${PACT_STANDALONE_VERSION}-osx.tar.gz${CHECKSUM_SUFFIX}`,
        downloadLocation: PACT_BINARY_LOCATION,
        folderName: `darwin-${PACT_STANDALONE_VERSION}`,
      },
      {
        platform: 'linux',
        arch: 'x64',
        binary: `pact-${PACT_STANDALONE_VERSION}-linux-x86_64.tar.gz`,
        binaryChecksum: `pact-${PACT_STANDALONE_VERSION}-linux-x86_64.tar.gz${CHECKSUM_SUFFIX}`,
        downloadLocation: PACT_BINARY_LOCATION,
        folderName: `linux-x64-${PACT_STANDALONE_VERSION}`,
      },
      {
        platform: 'linux',
        arch: 'ia32',
        binary: `pact-${PACT_STANDALONE_VERSION}-linux-x86.tar.gz`,
        binaryChecksum: `pact-${PACT_STANDALONE_VERSION}-linux-x86.tar.gz${CHECKSUM_SUFFIX}`,
        downloadLocation: PACT_BINARY_LOCATION,
        folderName: `linux-ia32-${PACT_STANDALONE_VERSION}`,
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

export interface PackageConfig {
  binaryLocation?: string;
  doNotTrack?: boolean;
}

export interface Config {
  doNotTrack: boolean;
  binaries: BinaryEntry[];
}

export interface Data {
  binaryDownloadPath: string;
  checksumDownloadPath: string;
  filepath: string;
  checksumFilepath: string;
  platform: string;
  isWindows: boolean;
  arch?: string;
  platformFolderPath?: string;
  binaryInstallSkipped?: boolean;
  binaryAlreadyDownloaded?: boolean;
  binaryAlreadyInstalled?: boolean;
}

export interface BinaryEntry {
  platform: string;
  arch?: string;
  binary: string;
  binaryChecksum: string;
  downloadLocation: string;
  folderName: string;
}
