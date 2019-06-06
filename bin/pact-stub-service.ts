#!/usr/bin/env node

import standalone from "../src/pact-standalone";
const spawnSync = require("child_process").spawnSync;

const status = spawnSync(standalone.stubFullPath, process.argv.slice(2), {stdio: "inherit"}).status;
process.exit(status);
