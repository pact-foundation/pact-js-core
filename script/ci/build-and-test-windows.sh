#!/bin/bash -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/../lib/robust-bash.sh

# The windows build agent has trouble unpacking the tar for
# linux, so we only download windows binaries. This means
# we cannot release from Windows in CI.
export ONLY_DOWNLOAD_PACT_FOR_WINDOWS=true

npm ci
# We don't check format on windows because it always fails
# npm run format:check
npm run lint
npm run build
npm run test