#!/usr/bin/env node

import childProcess = require('child_process');
import rubyStandalone from '../src/pact-standalone';

const isWindows = process.platform === 'win32'
const opts = isWindows ? { shell: true } : {}
const { error, status } = childProcess.spawnSync(
  rubyStandalone.verifierFullPath,
  process.argv.slice(2),
  {
    stdio: 'inherit',
    ...opts
  }
);
if (error) throw error;
process.exit(status as number);
