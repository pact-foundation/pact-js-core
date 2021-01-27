#!/bin/bash -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/lib/robust-bash.sh

"$SCRIPT_DIR"/lib/modify-permissions-github-actions.sh

npm ci --ignore-scripts
npm test
npm run download-checksums