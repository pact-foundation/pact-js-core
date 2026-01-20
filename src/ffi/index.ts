import path from 'node:path';
import bindings = require('node-gyp-build');
import { isNonGlibcLinuxSync } from 'detect-libc';
import logger, { DEFAULT_LOG_LEVEL } from '../logger';
import { LogLevel } from '../logger/types';
import { Ffi, FfiLogLevelFilter } from './types';

export const PACT_FFI_VERSION = '0.4.28';

/**
 * Returns the library path which is located inside `node_modules`
 * The naming convention is @pact-foundation/pact-core-${os}-${arch}<-${libc}>
 * - "-${libc}" is optional for linux only
 * @see https://nodejs.org/api/os.html#osarch
 * @see https://nodejs.org/api/os.html#osplatform
 * @example "x/xx/node_modules/@pact-foundation/pact-core-darwin-arm64"
 */
function getPlatformArchSpecificPackage() {
  const { arch } = process;
  let os = process.platform as string;
  if (['win32', 'cygwin'].includes(process.platform)) {
    os = 'windows';
  }
  let platformArchSpecificPackage = `@pact-foundation/pact-core-${os}-${arch}`;
  if (os === 'linux') {
    platformArchSpecificPackage += isNonGlibcLinuxSync() ? '-musl' : '-glibc';
  }

  const prebuildPackageLocation = process.env['PACT_PREBUILD_PACKAGE_LOCATION'];
  if (prebuildPackageLocation) {
    platformArchSpecificPackage = path.join(
      prebuildPackageLocation,
      platformArchSpecificPackage
    );
  }

  const packagePath = `${platformArchSpecificPackage}/package.json`;
  try {
    let resolvedPackagePath = require.resolve(packagePath);
    if (os === 'windows') {
      resolvedPackagePath = resolvedPackagePath.replace('\\package.json', '');
    } else {
      resolvedPackagePath = resolvedPackagePath.replace('/package.json', '');
    }
    return resolvedPackagePath;
  } catch {
    throw new Error(
      `Couldn't find npm package ${platformArchSpecificPackage} \n 💡 you can tell Pact where the npm package is located with env var $PACT_PREBUILD_PACKAGE_LOCATION`
    );
  }
}

// supported prebuilds
// darwin-arm64
// darwin-x64
// linux-arm64
// linux-x64
// win32-x64

const supportedPlatforms = [
  'darwin-arm64',
  'darwin-x64',
  'linux-arm64',
  'linux-x64',
  'win32-x64',
];
const platform = `${process.platform}-${process.arch}`;

const supportedPlatformsMessage = [
  'Supported platforms are: ',
  ` - ${supportedPlatforms.join('\n - ')}`,
].join('\n');
const detectedMessage = `We detected your platform as: \n\n - ${platform}`;
logger.debug(detectedMessage);
if (!supportedPlatforms.includes(platform)) {
  logger.warn(supportedPlatformsMessage);
  logger.warn(detectedMessage);
  logger.error(`Unsupported platform: ${platform}`);
  throw new Error(`Unsupported platform: ${platform}`);
}

const loadPathMessage = (bindingsPath: string) =>
  `: attempting to load native module from: \n\n - ${path.join(
    bindingsPath,
    'prebuilds',
    platform
  )} ${
    process.env['PACT_PREBUILD_LOCATION']
      ? `\n - source: PACT_PREBUILD_LOCATION \n - You must have a supported prebuild for your platform at this location in the path ${path.join(
          process.env['PACT_PREBUILD_LOCATION'],
          'prebuilds',
          platform
        )}`
      : `\n   source: pact-js-core binding lookup \n\n - You can override via PACT_PREBUILD_LOCATION\n`
  }`;

const bindingsResolver = (bindingsPath: string | undefined) => {
  if (bindingsPath === undefined) {
    throw new Error('Bindings path is undefined');
  }
  return bindings(bindingsPath);
};

const bindingPaths = [
  path.resolve(getPlatformArchSpecificPackage()),
  process.env['PACT_PREBUILD_LOCATION']?.toString() ?? path.resolve(),
];
let ffiLib: Ffi;

const renderBinaryErrorMessage = (error: unknown) => {
  logger.debug(supportedPlatformsMessage);
  logger.error(`Failed to find native module for ${platform}: ${error}`);
  bindingPaths.forEach((bindingPath) => {
    logger.debug(
      `We looked for a supported build in this location ${path.join(
        bindingPath ?? path.resolve(),
        'prebuilds',
        platform
      )}`
    );
  });
  logger.debug(
    `Tip: check there is a prebuild for ${platform} \n
          check the path exists\n
      Wrong Path?: set the load path with PACT_PREBUILD_LOCATION ensuring that ${path.join(
        '$PACT_PREBUILD_LOCATION',
        'prebuilds',
        platform
      )} exists\n
      - Note: You dont need to include the prebuilds/${platform} part of the path, just the parent directory\n
      - Let us know: We can add more supported path lookups easily, chat to us on slack or raise an issue on github`
  );
};

let ffi: typeof ffiLib;

const initialiseFfi = (): typeof ffi => {
  // @ts-ignore
  if (process.stdout._handle) {
    // @ts-ignore
    process.stdout._handle.setBlocking(true);
  }
  try {
    bindingPaths.every((bindingPath, i) => {
      try {
        logger.debug(`binding path #${i}: ${loadPathMessage(bindingPath)}`);
        ffiLib = bindingsResolver(bindingPath);
        if (ffiLib.pactffiVersion() === PACT_FFI_VERSION) {
          logger.info(
            'pact native library successfully found, and the correct version',
            ffiLib.pactffiVersion()
          );
          return false;
        }
        return true;
      } catch {
        return true;
      }
    });
  } catch (error) {
    renderBinaryErrorMessage(error);
    throw new Error(
      `Failed to load native module, try setting LOG_LEVEL=debug for more info`
    );
  }
  return ffiLib;
};

export const getFfiLib = (
  logLevel: LogLevel = DEFAULT_LOG_LEVEL,
  logFile: string | undefined = undefined
): typeof ffi => {
  if (!ffi) {
    logger.trace('Initialising ffi for the first time');
    ffi = initialiseFfi();
    logger.debug(
      `Initialising native core at log level '${logLevel}'`,
      logFile
    );
    if (logFile) {
      logger.debug(`writing log file at level ${logLevel} to ${logFile}`);
      const res = ffiLib.pactffiLogToFile(
        logFile,
        FfiLogLevelFilter[logLevel] ?? 3
      );
      if (res !== 0) {
        logger.warn(`Failed to write log file to ${logFile}, reason: ${res}`);
      }
    } else {
      ffiLib.pactffiInitWithLogLevel(logLevel);
    }
  }
  return ffi;
};
