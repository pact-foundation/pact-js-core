// This is a lookup between process.platform and
// the platform names used in pact-reference
const PLATFORM_LOOKUP = {
  linux: 'linux',
  darwin: 'osx',
  win32: 'windows', // yes, 'win32' is what process.platform returns on windows 64 bit
};

// This is a lookup between process.platform and
// the prefixes for the library name
const LIBNAME_PREFIX_LOOKUP = {
  linux: 'lib',
  darwin: 'lib',
  win32: '', // yes, 'win32' is what process.platform returns on windows 64 bit
};

// This is a lookup between process.arch and
// the architecture names used in pact-reference
const ARCH_LOOKUP = { x64: 'x86_64', arm64: 'aarch64-apple-darwin' };

// This is a lookup between "${platform}-${arch}" and
// the file extensions to link on that platform/arch combination
const EXTENSION_LOOKUP = {
  'osx-x86_64': 'dylib',
  'osx-aarch64-apple-darwin': 'dylib',
  'linux-x86_64': 'so',
  'windows-x86_64': 'dll',
};

export const libName = (
  library: string,
  version: string,
  processArch = process.arch,
  processPlatform = process.platform
): string => {
  const arch = ARCH_LOOKUP[processArch];
  const platform = PLATFORM_LOOKUP[processPlatform];

  if (!arch || !platform) {
    throw new Error(
      `Pact does not currently support the operating system and architecture combination '${processPlatform}/${processArch}'`
    );
  }

  const target = `${platform}-${arch}`;

  const extension = EXTENSION_LOOKUP[target];
  if (!extension) {
    throw new Error(
      `Pact doesn't know what extension to use for the libraries in the architecture combination '${target}'`
    );
  }

  const libnamePrefix = LIBNAME_PREFIX_LOOKUP[processPlatform];
  if (libnamePrefix === undefined) {
    throw new Error(
      `Pact doesn't know what prefix to use for the libraries on '${processPlatform}'`
    );
  }

  return `${version}-${libnamePrefix}${library}-${target}.${extension}`;
};
