#!/bin/bash -eu

"$SCRIPT_DIR"/lib/modify-permissions-github-actions.sh

npm ci --ignore-scripts
npm test
npm run download-checksums