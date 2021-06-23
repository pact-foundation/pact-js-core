#!/usr/bin/env node

import standalone from '../src/pact-standalone';
import childProcess = require('child_process');

const status = childProcess.spawnSync(
  standalone.verifierFullPath,
  process.argv.slice(2),
  {
    stdio: 'inherit',
  }
).status;
process.exit(status);
