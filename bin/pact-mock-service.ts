#!/usr/bin/env node

import childProcess = require('child_process');
import rubyStandalone from '../src/pact-standalone';

const { error, status } = childProcess.spawnSync(
  rubyStandalone.mockServiceFullPath,
  process.argv.slice(2),
  {
    stdio: 'inherit',
    shell: true,
  }
);
if (error) throw error;
process.exit(status as number);
