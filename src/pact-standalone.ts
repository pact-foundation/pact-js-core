import * as path from 'path';
import { getBinaryEntry } from '../standalone/install';
import pactEnvironment from './pact-environment';
import logger from './logger';

export interface PactStandalone {
  cwd: string;
  brokerPath: string;
  brokerFullPath: string;
  mockServicePath: string;
  mockServiceFullPath: string;
  stubPath: string;
  stubFullPath: string;
  verifierPath: string;
  verifierFullPath: string;
  messagePath: string;
  messageFullPath: string;
  pactPath: string;
  pactFullPath: string;
  pactflowPath: string;
  pactflowFullPath: string;
}

export const standalone = (
  platform: string = process.platform,
  arch: string = process.arch
): PactStandalone => {
  const binName = (name: string): string =>
    `${name}${pactEnvironment.isWindows(platform) ? '.bat' : ''}`;
  const mock = binName('pact-mock-service');
  const message = binName('pact-message');
  const verify = binName('pact-provider-verifier');
  const broker = binName('pact-broker');
  const stub = binName('pact-stub-service');
  const pact = binName('pact');
  const pactflow = binName('pactflow');
  const basePath = path.join(
    'standalone',
    getBinaryEntry(platform, arch).folderName,
    'pact',
    'bin'
  );

  return {
    cwd: pactEnvironment.cwd,
    brokerPath: path.join(basePath, broker),
    brokerFullPath: path.resolve(pactEnvironment.cwd, basePath, broker).trim(),
    messagePath: path.join(basePath, message),
    messageFullPath: path
      .resolve(pactEnvironment.cwd, basePath, message)
      .trim(),
    mockServicePath: path.join(basePath, mock),
    mockServiceFullPath: path
      .resolve(pactEnvironment.cwd, basePath, mock)
      .trim(),
    stubPath: path.join(basePath, stub),
    stubFullPath: path.resolve(pactEnvironment.cwd, basePath, stub).trim(),
    pactPath: path.join(basePath, pact),
    pactFullPath: path.resolve(pactEnvironment.cwd, basePath, pact).trim(),
    pactflowPath: path.join(basePath, pactflow),
    pactflowFullPath: path
      .resolve(pactEnvironment.cwd, basePath, pactflow)
      .trim(),
    verifierPath: path.join(basePath, verify),
    verifierFullPath: path
      .resolve(pactEnvironment.cwd, basePath, verify)
      .trim(),
  };
};

const isWindows = process.platform === 'win32';

function quoteCmdArg(arg: string) {
  return `"${arg.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function quotePwshArg(arg: string) {
  return `'${arg.replace(/'/g, "''")}'`;
}

function quotePosixShArg(arg: string) {
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

function testWindowsExe(cmd: string, file: string) {
  return new RegExp(`^(?:.*\\\\)?${cmd}(?:\\.exe)?$`, 'i').test(file);
}

function parseArgs(unparsed_args: string[]) {
  if (isWindows === true) {
    const file = process.env['comspec'] || 'cmd.exe';
    if (testWindowsExe('cmd', file) === true) {
      return unparsed_args.map((i) => quoteCmdArg(i));
    }
    if (testWindowsExe('(powershell|pwsh)', file) || file.endsWith('/pwsh')) {
      return unparsed_args.map((i) => quotePwshArg(i));
    }
    return unparsed_args;
  }
  return unparsed_args.map((i) => quotePosixShArg(i));
}

export function setStandaloneArgs(
  unparsed_args: string[],
  shell: boolean
): string[] {
  let parsedArgs = unparsed_args;
  if (shell === true) {
    parsedArgs = parseArgs(unparsed_args);
  }
  return parsedArgs;
}

export function showStandaloneDeprecationWarning(): void {
  const silenceDeprecationWarnings =
    process.env['PACT_SILENCE_DEPRECATION_WARNINGS'] === 'true';

  if (!silenceDeprecationWarnings) {
    logger.warn(
      'DEPRECATION NOTICE: \n  pact standalone tools will be removed in pact-js-core 15.x. \n  Please update imports to @pact-foundation/pact-cli \n  https://github.com/pact-foundation/pact-js-core/issues/488'
    );
  }
}

export const standaloneUseShell = isWindows;

export default standalone();
