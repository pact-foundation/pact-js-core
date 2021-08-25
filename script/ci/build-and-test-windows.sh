#!/bin/bash -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/../lib/robust-bash.sh


npm ci
# We don't check format on windows because it always fails
# npm run format:check
npm run lint
npm run build
npm run test