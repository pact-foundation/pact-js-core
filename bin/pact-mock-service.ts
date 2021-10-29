#!/usr/bin/env node

import standalone from '../src/pact-standalone';
import cp = require('child_process');

const status = cp.spawnSync(
  standalone.mockServiceFullPath,
  process.argv.slice(2),
  { stdio: 'inherit' }
).status;
process.exit(status);
