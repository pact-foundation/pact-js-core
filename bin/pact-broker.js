#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pact_standalone_1 = require("../src/pact-standalone");
var spawnSync = require('child_process').spawnSync;
var status = spawnSync(pact_standalone_1.default.brokerFullPath, process.argv.slice(2), {
    stdio: 'inherit',
}).status;
process.exit(status);
//# sourceMappingURL=pact-broker.js.map