import path from 'node:path';
import bindings = require('node-gyp-build');
import logger, { DEFAULT_LOG_LEVEL } from '../logger';
import { LogLevel } from '../logger/types';
import { Ffi } from './types';

export const PACT_FFI_VERSION = '0.4.0';

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
const detectedMessage = `We detected your platform as: \n\n - ${platform}\n`;
logger.info(detectedMessage);
if (
  !supportedPlatforms.includes(platform) &&
  process.env['UNSUPPORTED_PLATFORM'] !== platform
) {
  logger.warn(supportedPlatformsMessage);
  logger.warn(detectedMessage);
  logger.error(`Unsupported platform: ${platform}`);
  throw new Error(
    `Unsupported platform: ${platform}, set $UNSUPPORTED_PLATFORM to ${platform} to override this check`
  );
}

if (process.env['UNSUPPORTED_PLATFORM'] !== platform) {
  logger.warn(
    `You have set the environment variable UNSUPPORTED_PLATFORM to ${process.env['UNSUPPORTED_PLATFORM']}, this will override the detected platform of ${platform}`
  );
}

const loadPathMessage = (bindingsPath: string) =>
  `: loading native module from: \n\n - ${path.join(
    bindingsPath,
    'prebuilds',
    platform
  )} ${
    process.env['PACT_NAPI_NODE_LOCATION']
      ? `\n - source: PACT_NAPI_NODE_LOCATION \n - You must have a supported prebuild for your platform at this location in the path ${path.join(
          process.env['PACT_NAPI_NODE_LOCATION'],
          'prebuilds',
          platform
        )}`
      : `\n   source: ${path.join(
          bindingsPath,
          'prebuilds',
          platform
        )} \n\n - You can override via PACT_NAPI_NODE_LOCATION\n`
  }`;

const bindingsResolver = (bindingsPath: string | undefined) =>
  bindings(bindingsPath);

const bindingPaths = [
  path.resolve(
    process.env['PACT_NAPI_NODE_LOCATION']?.toString() ?? path.resolve(),
    path.resolve(__dirname, '..', '..')
  ),
];
let ffiLib: Ffi;
let loadPath: string | undefined;
try {
  bindingPaths.forEach((bindingPath) => {
    try {
      loadPath = bindingPath;
      logger.info(
        `Attempting to find pact native module ${loadPathMessage(bindingPath)}`
      );
      ffiLib = bindingsResolver(bindingPath);
      if (ffiLib) {
        throw new Error('Native module not found');
      }
    } catch (error) {
      logger.warn(`Failed to load native module from ${bindingPath}: ${error}`);
    }
  });
} catch (error) {
  logger.debug(supportedPlatformsMessage);
  logger.debug(detectedMessage);
  logger.debug(`Failed ${loadPathMessage}`);
  logger.error(`Failed to load native module: ${error}`);
  throw new Error(
    'Native module not found - check the logs for more details and set PACT_LOG_LEVEL=debug for more details'
  );
}

let ffi: typeof ffiLib;
let ffiLogLevel: LogLevel;

const initialiseFfi = (logLevel: LogLevel): typeof ffi => {
  logger.debug(`Initalising native core at log level '${logLevel}'`);
  ffiLogLevel = logLevel;
  try {
    ffiLib.pactffiInitWithLogLevel(logLevel);
  } catch (error) {
    logger.debug(supportedPlatformsMessage);
    logger.debug(detectedMessage);
    logger.error(
      `Failed to initialise native module for ${platform}: ${error}`
    );
    logger.error(
      `We looked for a supported build in this location ${path.join(
        loadPath ?? path.resolve(),
        'prebuilds',
        platform
      )}`
    );
    logger.error(`Tip: check there this a prebuild for ${platform}`);
    logger.error(
      `Tip: check the prebuild exists at the path: ${path.join(
        loadPath ?? path.resolve(),
        'prebuilds',
        platform
      )}`
    );
    logger.error(
      `Wrong Path?: set the load path with $PACT_NAPI_NODE_LOCATION ensuring that ${path.join(
        '$PACT_NODE_NAPI_LOCATION',
        'prebuilds',
        platform
      )} exists`
    );
    logger.error(
      `  - Note: You dont need to include the prebuilds${platform} part of the path, just the parent directory`
    );
    logger.error(
      `  - Let us know: - We can add more supported path lookups easily, chat to us on slack or raise an issue on github`
    );
    logger.error(
      `Pro Tip: build your own prebuild, and set $UNSUPPORTED_PLATFORM to ${platform}`
    );
    logger.error(`Pro Tip: see DEVELOPER.md in pact-js-core for more details`);
    logger.error(
      `  - Let us know: - We can add look to build more supported platforms, chat to us on slack or raise an issue on github`
    );
    throw new Error(
      'Native module not found - check the logs for more details and set PACT_LOG_LEVEL=debug for more details'
    );
  }

  return ffiLib;
};

export const getFfiLib = (
  logLevel: LogLevel = DEFAULT_LOG_LEVEL
): typeof ffi => {
  if (!ffi) {
    logger.trace('Initiliasing ffi for the first time');
    ffi = initialiseFfi(logLevel);
  } else {
    logger.trace('Ffi has already been initialised, no need to repeat it');
    if (logLevel !== ffiLogLevel) {
      logger.warn(
        `The pact native core has already been initialised at log level '${ffiLogLevel}'`
      );
      logger.warn(`The new requested log level '${logLevel}' will be ignored`);
    }
  }
  return ffi;
};
