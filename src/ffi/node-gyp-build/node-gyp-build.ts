/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const os = require('os');

const runtimeRequire =
  // Workaround to fix webpack's build warnings: 'the request of a dependency is an expression'
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require; // eslint-disable-line
function readdirSync(dir: string | undefined) {
  try {
    return fs.readdirSync(dir);
  } catch (err) {
    return [];
  }
}

function getFirst(
  dir: string | undefined,
  filter: { (name: unknown): boolean; (name: unknown): boolean }
) {
  const files = readdirSync(dir).filter(filter);
  return files[0] && path.join(dir, files[0]);
}

function matchBuild(name: string) {
  return /\.node$/.test(name);
}

function parseTuple(name: string) {
  // Example: darwin-x64+arm64
  const arr = name.split('-');
  if (arr.length !== 2) return;

  const platform = arr[0];
  const architectures = arr[1].split('+');

  if (!platform) return;
  if (!architectures.length) return;
  if (!architectures.every(Boolean)) return;

  // eslint-disable-next-line consistent-return
  return { name, platform, architectures };
}

function matchTuple(platform: string, arch: string) {
  return function (
    tuple: { platform: string; architectures: string | string[] } | null
  ) {
    if (tuple == null) return false;
    if (tuple.platform !== platform) return false;
    return tuple.architectures.includes(arch);
  };
}

function compareTuples(
  a: { architectures: string | string[] },
  b: { architectures: string | string[] }
) {
  // Prefer single-arch prebuilds over multi-arch
  return a.architectures.length - b.architectures.length;
}

function parseTags(file: string) {
  const arr = file.split('.');
  const extension = arr.pop();
  const tags = { file, specificity: 0 };

  if (extension !== 'node') return;

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < arr.length; i++) {
    const tag = arr[i];

    if (tag === 'node' || tag === 'electron' || tag === 'node-webkit') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      tags.runtime = tag;
    } else if (tag === 'napi') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      tags.napi = true;
    } else if (tag.slice(0, 3) === 'abi') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      tags.abi = tag.slice(3);
    } else if (tag.slice(0, 2) === 'uv') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      tags.uv = tag.slice(2);
    } else if (tag.slice(0, 4) === 'armv') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      tags.armv = tag.slice(4);
    } else if (tag === 'glibc' || tag === 'musl') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      tags.libc = tag;
    } else {
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-plusplus
    tags.specificity++;
  }

  // eslint-disable-next-line consistent-return
  return tags;
}

function runtimeAgnostic(tags: { runtime: string; napi: string }) {
  return tags.runtime === 'node' && tags.napi;
}
function matchTags(runtime: string, abi: string) {
  return function (
    tags: {
      runtime: string;
      abi: string;
      napi: string;
      uv: string;
      armv: string;
      libc: string;
    } | null
  ) {
    if (tags == null) return false;
    if (tags.runtime !== runtime && !runtimeAgnostic(tags)) return false;
    if (tags.abi !== abi && !tags.napi) return false;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    if (tags.uv && tags.uv !== uv) return false;
    if (tags.armv && tags.armv !== armv) return false;
    if (tags.libc && tags.libc !== libc) return false;

    return true;
  };
}

function compareTags(runtime: string) {
  // Precedence: non-agnostic runtime, abi over napi, then by specificity.

  return function (
    a: { runtime: string; abi: string; specificity: number },
    b: { runtime: string; abi: string; specificity: number }
  ) {
    if (a.runtime !== b.runtime) {
      return a.runtime === runtime ? -1 : 1;
    }
    if (a.abi !== b.abi) {
      return a.abi ? -1 : 1;
    }
    if (a.specificity !== b.specificity) {
      return a.specificity > b.specificity ? -1 : 1;
    }
    return 0;
  };
}

function isNwjs() {
  return !!(process.versions && process.versions['nw']);
}

function isElectron() {
  if (process.versions && process.versions['electron']) return true;
  if (process.env['ELECTRON_RUN_AS_NODE']) return true;

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    typeof window !== 'undefined' &&
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.process &&
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.process.type === 'renderer'
  );
}

function isAlpine(platform: string) {
  return platform === 'linux' && fs.existsSync('/etc/alpine-release');
}
const vars = (process.config && process.config.variables) || {};
const prebuildsOnly = !!process.env['PREBUILDS_ONLY'];
const abi = process.versions.modules; // TODO: support old node where this is undef
// eslint-disable-next-line no-nested-ternary
const runtime = isElectron() ? 'electron' : isNwjs() ? 'node-webkit' : 'node';

const arch = process.env['npm_config_arch'] || os.arch();
const platform = process.env['npm_config_platform'] || os.platform();
const libc = process.env['LIBC'] || (isAlpine(platform) ? 'musl' : 'glibc');
const armv =
  process.env['ARM_VERSION'] ||
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  (arch === 'arm64' ? '8' : vars.arm_version) ||
  '';
const uv = (process.versions.uv || '').split('.')[0];
function load(dir: string | undefined) {
  return runtimeRequire(load.resolve(dir));
}

// eslint-disable-next-line no-multi-assign
load.resolve = load.path = function (dir: string | undefined) {
  // eslint-disable-next-line no-param-reassign
  dir = path.resolve(dir || '.');

  try {
    const name = runtimeRequire(path.join(dir, 'package.json'))
      .name.toUpperCase()
      .replace(/-/g, '_');
    // eslint-disable-next-line no-param-reassign
    if (process.env[`${name}_PREBUILD`]) dir = process.env[`${name}_PREBUILD`];
  } catch (err) {
    /* empty */
  }

  if (!prebuildsOnly) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const release = getFirst(path.join(dir, 'build/Release'), matchBuild);
    if (release) return release;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const debug = getFirst(path.join(dir, 'build/Debug'), matchBuild);
    if (debug) return debug;
  }
  // eslint-disable-next-line @typescript-eslint/no-shadow
  function resolve(dir: string | undefined) {
    // Find matching "prebuilds/<platform>-<arch>" directory
    const tuples = readdirSync(path.join(dir, 'prebuilds')).map(parseTuple);
    const tuple = tuples
      .filter(matchTuple(platform, arch))
      .sort(compareTuples)[0];
    if (!tuple) return;

    // Find most specific flavor first
    const prebuilds = path.join(dir, 'prebuilds', tuple.name);
    const parsed = readdirSync(prebuilds).map(parseTags);
    const candidates = parsed.filter(matchTags(runtime, abi));
    const winner = candidates.sort(compareTags(runtime))[0];
    // eslint-disable-next-line consistent-return
    if (winner) return path.join(prebuilds, winner.file);
  }
  const prebuild = resolve(dir);
  if (prebuild) return prebuild;

  const nearby = resolve(path.dirname(process.execPath));
  if (nearby) return nearby;

  const target = [
    `platform=${platform}`,
    `arch=${arch}`,
    `runtime=${runtime}`,
    `abi=${abi}`,
    `uv=${uv}`,
    armv ? `armv=${armv}` : '',
    `libc=${libc}`,
    `node=${process.versions.node}`,
    process.versions['electron']
      ? `electron=${process.versions['electron']}`
      : '',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    typeof __webpack_require__ === 'function' ? 'webpack=true' : '', // eslint-disable-line
  ]
    .filter(Boolean)
    .join(' ');

  throw new Error(
    `No native build was found for ${target}\n    loaded from: ${dir}\n`
  );
};

module.exports = load;

// Exposed for unit tests
// TODO: move to lib
load.parseTags = parseTags;
load.matchTags = matchTags;
load.compareTags = compareTags;
load.parseTuple = parseTuple;
load.matchTuple = matchTuple;
load.compareTuples = compareTuples;
