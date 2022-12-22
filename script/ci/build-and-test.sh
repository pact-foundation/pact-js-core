#!/bin/bash -eu
set -eu # This needs to be here for windows bash, which doesn't read the #! line above

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/../lib/robust-bash.sh

bash script/download-libs.sh
npm ci

npm run format:check
npm run lint
npm run build
npm run test