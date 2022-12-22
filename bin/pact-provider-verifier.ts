#!/usr/bin/env node

import childProcess = require('child_process');
import rubyStandalone from '../src/pact-standalone';

const { status } = childProcess.spawnSync(
  rubyStandalone.verifierFullPath,
  process.argv.slice(2),
  {
    stdio: 'inherit',
  }
);
process.exit(status as number);
