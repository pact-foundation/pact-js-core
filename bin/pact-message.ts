#!/usr/bin/env node

import standalone from "../src/pact-standalone";
const spawnSync = require("child_process").spawnSync;

spawnSync(standalone.messageFullPath, process.argv.slice(2), {stdio: "inherit"});
