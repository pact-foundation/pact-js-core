#!/usr/bin/env node

import childProcess = require('child_process');
import {
  standalone,
  standaloneUseShell,
  setStandaloneArgs,
} from '../src/pact-standalone';

const args = process.argv.slice(2);
const opts = standaloneUseShell ? { shell: true } : {};
const { error, status } = childProcess.spawnSync(
  standalone().brokerFullPath,
  setStandaloneArgs(args, standaloneUseShell),
  {
    stdio: 'inherit',
    ...opts,
  }
);
if (error) throw error;
process.exit(status as number);
