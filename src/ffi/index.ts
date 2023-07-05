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
logger.debug(detectedMessage);
if (!supportedPlatforms.includes(platform)) {
  logger.warn(supportedPlatformsMessage);
  logger.warn(detectedMessage);
  logger.error(`Unsupported platform: ${platform}`);
  throw new Error(`Unsupported platform: ${platform}`);
}

const loadPathMessage = (bindingsPath: string) =>
  `: loading native module from: \n\n - ${path.join(
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

const bindingsResolver = (bindingsPath: string | undefined) =>
  bindings(bindingsPath);

const bindingPaths = [
  path.resolve(
    path.resolve(__dirname, '..', '..'),
    process.env['PACT_PREBUILD_LOCATION']?.toString() ?? path.resolve()
  ),
];
let ffiLib: Ffi;

const renderBinaryErrorMessage = (error: unknown, bindingPath: string) => {
  logger.debug(`${supportedPlatformsMessage}\n${detectedMessage}`);
  logger.error(`Failed to initialise native module for ${platform}: ${error}`);
  logger.debug(
    `{supportedPlatformsMessage}\n${detectedMessage}\n
      We looked for a supported build in this location ${path.join(
        bindingPath ?? path.resolve(),
        'prebuilds',
        platform
      )}\n
      Tip: check there is a prebuild for ${platform} \n
      check the prebuild exists at the path: ${path.join(
        bindingPath ?? path.resolve(),
        'prebuilds',
        platform
      )}\n
      Wrong Path?: set the load path with PACT_PREBUILD_LOCATION ensuring that ${path.join(
        '$PACT_NODE_NAPI_LOCATION',
        'prebuilds',
        platform
      )} exists\n
      - Note: You dont need to include the prebuilds/${platform} part of the path, just the parent directory\n
      - Let us know: We can add more supported path lookups easily, chat to us on slack or raise an issue on github`
  );
};

let ffi: typeof ffiLib;
let ffiLogLevel: LogLevel;

const initialiseFfi = (logLevel: LogLevel): typeof ffi => {
  logger.debug(`Initalising native core at log level '${logLevel}'`);
  ffiLogLevel = logLevel;
  try {
    bindingPaths.forEach((bindingPath) => {
      try {
        logger.debug(
          `Attempting to find pact native module ${loadPathMessage(
            bindingPath
          )}`
        );
        ffiLib = bindingsResolver(bindingPath);
        if (!ffiLib) {
          throw new Error('Native module not found');
        }
      } catch (error) {
        renderBinaryErrorMessage(error, bindingPath);
      }
    });
    ffiLib.pactffiInitWithLogLevel(logLevel);
  } catch (error) {
    throw new Error(
      `Failed to load native module, try setting LOG_LEVEL=debug for more info \n. ${error}`
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
